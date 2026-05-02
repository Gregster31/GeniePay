import { useEffect, useCallback } from 'react';
import { useBalance, useSendTransaction, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import type { TokenSymbol } from '@/config/tokenConfig';
import { getTokenAddress, TOKEN_DECIMALS } from '@/config/tokenConfig';

const ERC20_TRANSFER_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

interface SendPaymentParams {
  recipientAddress: string;
  amount: string;
  currency?: TokenSymbol;
}

export const usePayment = () => {
  const { address, chain } = useAccount();

  const { data: balance, isError: balanceError, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({ address });

  const { sendTransaction, data: ethTxHash, isPending: isEthSending, isError: ethSendError, error: ethSendErrorDetails, reset: resetEthTransaction } = useSendTransaction();
  const { writeContract, data: erc20TxHash, isPending: isErc20Sending, isError: erc20SendError, error: erc20SendErrorDetails, reset: resetErc20Transaction } = useWriteContract();

  const txHash = ethTxHash ?? erc20TxHash;
  const isSending = isEthSending || isErc20Sending;
  const sendError = ethSendError || erc20SendError;
  const sendErrorDetails = ethSendErrorDetails ?? erc20SendErrorDetails;

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
    pollingInterval: 1000,
  });

  useEffect(() => {
    if (isConfirmed) refetchBalance();
  }, [isConfirmed, refetchBalance]);

  const sendPayment = useCallback(
    ({ recipientAddress, amount, currency = 'ETH' }: SendPaymentParams) => {
      if (currency === 'ETH') {
        resetEthTransaction();
        sendTransaction({ to: recipientAddress as `0x${string}`, value: parseEther(amount) });
      } else {
        if (!chain) return;
        const tokenAddr = getTokenAddress(chain.id, currency);
        if (!tokenAddr || tokenAddr === 'native') return;
        resetErc20Transaction();
        const decimals = TOKEN_DECIMALS[currency];
        writeContract({
          address: tokenAddr,
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [recipientAddress as `0x${string}`, parseUnits(amount, decimals)],
        });
      }
    },
    [sendTransaction, resetEthTransaction, writeContract, resetErc20Transaction, chain],
  );

  return {
    balance,
    balanceError,
    balanceLoading,
    refetchBalance,
    sendPayment,
    txHash,
    isSending,
    isConfirming,
    isConfirmed,
    sendError,
    sendErrorDetails,
    isProcessing: isSending || isConfirming,
  };
};
