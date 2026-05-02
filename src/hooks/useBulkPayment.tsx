import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import type { Employee } from '@/models/EmployeeModel';
import type { TokenSymbol } from '@/config/tokenConfig';
import { DISPERSE_CONTRACTS, TOKEN_ADDRESSES, TOKEN_DECIMALS } from '@/config/tokenConfig';
import { useEthPrice } from '@/hooks/useEthPrice';
import { isValidEthAddress } from '@/utils/EthUtils';

const DISPERSE_ABI = [
  {
    constant: false,
    inputs: [{ name: 'token', type: 'address' }, { name: 'recipients', type: 'address[]' }, { name: 'values', type: 'uint256[]' }],
    name: 'disperseToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ name: 'recipients', type: 'address[]' }, { name: 'values', type: 'uint256[]' }],
    name: 'disperseEther',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const ERC20_ABI = [
  {
    constant: false,
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type PaymentStep = 'idle' | 'approving' | 'approved' | 'sending' | 'success' | 'error';

interface BulkPaymentParams {
  employees: Employee[];
  currency: TokenSymbol;
}

export function useBulkPayment() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { ethPrice } = useEthPrice();

  const [currentStep, setCurrentStep] = useState<PaymentStep>('idle');
  const [approvalHash, setApprovalHash] = useState<string | undefined>();
  const [paymentHash, setPaymentHash] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const getAddresses = useCallback((currency: TokenSymbol) => {
    if (!chain) return null;
    const disperseAddress = DISPERSE_CONTRACTS[chain.id];
    if (!disperseAddress) return null;
    if (currency === 'ETH') return { tokenAddress: null, disperseAddress, isNative: true };
    const tokenAddress = TOKEN_ADDRESSES[chain.id]?.[currency];
    if (!tokenAddress || tokenAddress === 'native') return null;
    return { tokenAddress, disperseAddress, isNative: false };
  }, [chain]);

  const validate = useCallback(async (employees: Employee[], currency: TokenSymbol): Promise<string | null> => {
    if (!address || !chain || !publicClient) return 'Please connect your wallet';
    if (employees.length === 0) return 'No employees selected';

    const addresses = getAddresses(currency);
    if (!addresses) return `${currency} not supported on ${chain.name}`;

    const wallets = employees.map(e => e.walletAddress.toLowerCase());
    if (new Set(wallets).size !== wallets.length) return 'Duplicate wallet addresses detected';

    const invalidAddresses = employees.filter(e => !isValidEthAddress(e.walletAddress));
    if (invalidAddresses.length > 0)
      return `Invalid wallet address for: ${invalidAddresses.map(e => e.name).join(', ')}`;

    const decimals = TOKEN_DECIMALS[currency];
    const total = employees.reduce((sum, emp) => {
      const amount = addresses.isNative ? emp.payUsd / ethPrice : emp.payUsd;
      return sum + parseUnits(amount.toString(), decimals);
    }, 0n);

    try {
      const balance: bigint = addresses.isNative
        ? await publicClient.getBalance({ address })
        : await publicClient.readContract({
            address: addresses.tokenAddress!,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address],
          }) as bigint;
      if (balance < total) return `Insufficient ${currency} balance`;
    } catch {
      return 'Failed to check balance';
    }

    return null;
  }, [address, chain, publicClient, getAddresses, ethPrice]);

  const execute = useCallback(async ({ employees, currency }: BulkPaymentParams): Promise<string> => {
    const validationError = await validate(employees, currency);
    if (validationError) {
      setError(validationError);
      setCurrentStep('error');
      throw new Error(validationError);
    }

    try {
      setError(null);
      const client = publicClient;
      if (!client) throw new Error('No public client, wallet may have disconnected');
      const addresses = getAddresses(currency)!;
      const decimals = TOKEN_DECIMALS[currency];
      const recipients = employees.map(e => e.walletAddress as Address);
      const amounts = employees.map(e => {
        const amount = addresses.isNative ? e.payUsd / ethPrice : e.payUsd;
        return parseUnits(amount.toString(), decimals);
      });
      const total = amounts.reduce((sum, amt) => sum + amt, 0n);

      if (addresses.isNative) {
        setCurrentStep('sending');
        const hash = await writeContractAsync({
          address: addresses.disperseAddress,
          abi: DISPERSE_ABI,
          functionName: 'disperseEther',
          args: [recipients, amounts],
          value: total,
        });
        setPaymentHash(hash);
        await client.waitForTransactionReceipt({ hash: hash as `0x${string}`, confirmations: 1, pollingInterval: 1000 });
        setCurrentStep('success');
        return hash;
      }

      const allowance = await client.readContract({
        address: addresses.tokenAddress!,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address!, addresses.disperseAddress],
      }) as bigint;

      if (allowance < total) {
        setCurrentStep('approving');
        const approveHash = await writeContractAsync({
          address: addresses.tokenAddress!,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [addresses.disperseAddress, total],
        });
        setApprovalHash(approveHash);
        await client.waitForTransactionReceipt({ hash: approveHash as `0x${string}` });
        setCurrentStep('approved');
      }

      setCurrentStep('sending');
      const hash = await writeContractAsync({
        address: addresses.disperseAddress,
        abi: DISPERSE_ABI,
        functionName: 'disperseToken',
        args: [addresses.tokenAddress!, recipients, amounts],
      });
      setPaymentHash(hash);
      await client.waitForTransactionReceipt({ hash: hash as `0x${string}`, confirmations: 1, pollingInterval: 1000 });
      setCurrentStep('success');
      return hash;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      const cancelled = msg.includes('User rejected') || msg.includes('User denied') || msg.includes('user rejected');
      const finalMsg = cancelled ? 'Transaction cancelled' : msg;
      setError(finalMsg);
      setCurrentStep('error');
      throw new Error(finalMsg);
    }
  }, [address, publicClient, writeContractAsync, validate, getAddresses, ethPrice]);

  const reset = useCallback(() => {
    setCurrentStep('idle');
    setApprovalHash(undefined);
    setPaymentHash(undefined);
    setError(null);
  }, []);

  const estimateGasSavings = useCallback((employeeCount: number): string => {
    const individualGas = employeeCount * 65000;
    const bulkGas = 50000 + employeeCount * 5000;
    const savings = ((individualGas - bulkGas) / individualGas) * 100;
    return `${Math.round(savings)}%`;
  }, []);

  return {
    currentStep,
    approvalHash,
    paymentHash,
    error,
    ethPrice,
    isApproving:  currentStep === 'approving',
    isSending:    currentStep === 'sending',
    isSuccess:    currentStep === 'success',
    isProcessing: currentStep === 'approving' || currentStep === 'sending',
    execute,
    validate,
    reset,
    estimateGasSavings,
    getTokenAddress:    (currency: TokenSymbol) => getAddresses(currency)?.tokenAddress,
    getDisperseAddress: () => chain ? DISPERSE_CONTRACTS[chain.id] : undefined,
  };
}
