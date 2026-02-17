import { useState, useCallback, useEffect } from 'react';
import { 
  useAccount, 
  useWriteContract,
  usePublicClient
} from 'wagmi';
import { parseUnits, type Address } from 'viem';
import type { Employee } from '@/models/EmployeeModel';
import { fetchEthPrice } from '@/utils/ethUtils';

// ============================================================================
// CONSTANTS
// ============================================================================

const DISPERSE_CONTRACTS: Record<number, Address> = {
  1: '0xD152f549545093347A162Dce210e7293f1452150',       // Ethereum
  11155111: '0xD152f549545093347A162Dce210e7293f1452150', // Sepolia
  56: '0xD152f549545093347A162Dce210e7293f1452150',      // BSC
  137: '0xD152f549545093347A162Dce210e7293f1452150',     // Polygon
  10: '0xD152f549545093347A162Dce210e7293f1452150',      // Optimism
  42161: '0x692B5A7eCcCaD243a07535E8C24b0e7433238c6a',   // Arbitrum
  8453: '0xD152f549545093347A162Dce210e7293f1452150',    // Base
};

const TOKEN_ADDRESSES: Record<number, Record<string, Address | 'native'>> = {
  // Ethereum Mainnet
  1: {
    'ETH': 'native', 
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  // Sepolia Testnet
  11155111: {
    'ETH': 'native',
    'USDC': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  },
  // Polygon
  137: {
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    'DAI': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  // Arbitrum
  42161: {
    'USDC': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    'USDT': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    'DAI': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  // Optimism
  10: {
    'USDC': '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    'DAI': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  // Base
  8453: {
    'USDC': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  // BSC
  56: {
    'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    'USDT': '0x55d398326f99059fF775485246999027B3197955',
  },
};

const TOKEN_DECIMALS: Record<string, number> = {
  'USDC': 6,
  'USDT': 6,
  'DAI': 18,
  'ETH': 18,
};

const DISPERSE_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'recipients', type: 'address[]' },
      { name: 'values', type: 'uint256[]' }
    ],
    name: 'disperseToken',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: false,
    inputs: [
      { name: 'recipients', type: 'address[]' },
      { name: 'values', type: 'uint256[]' }
    ],
    name: 'disperseEther',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// ============================================================================
// TYPES
// ============================================================================

interface BulkPaymentParams {
  employees: Employee[];
  currency: string;
}

type PaymentStep = 'idle' | 'approving' | 'approved' | 'sending' | 'success' | 'error';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert USD amount to ETH based on current price
 */
function usdToEth(usdAmount: number, ethPrice: number): number {
  return usdAmount / ethPrice;
}

// ============================================================================
// HOOK
// ============================================================================

export function useBulkPayment() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  
  const [currentStep, setCurrentStep] = useState<PaymentStep>('idle');
  const [approvalHash, setApprovalHash] = useState<string | undefined>();
  const [paymentHash, setPaymentHash] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(3000); // Default fallback price

  // Fetch ETH price on mount and update periodically
  useEffect(() => {
    const updatePrice = async () => {
      const price = await fetchEthPrice();
      setEthPrice(price);
    };
    
    updatePrice();
    // Update price every 30 seconds
    const interval = setInterval(updatePrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  /**
   * Get token and contract addresses
   */
  const getAddresses = useCallback((currency: string) => {
    if (!chain) return null;
    
    const disperseAddress = DISPERSE_CONTRACTS[chain.id];
    if (!disperseAddress) return null;
    
    if (currency === 'ETH') {
      return { 
        tokenAddress: null,
        disperseAddress,
        isNative: true
      };
    }
    
    // Handle ERC20 tokens
    const tokenAddress = TOKEN_ADDRESSES[chain.id]?.[currency];
    if (!tokenAddress || tokenAddress === 'native') return null;
    
    return { tokenAddress, disperseAddress, isNative: false };
  }, [chain]);

  /**
   * Validate payment prerequisites
   */
  const validate = useCallback(async (
    employees: Employee[],
    currency: string
  ): Promise<string | null> => {
    if (!address || !chain || !publicClient) {
      return 'Please connect your wallet';
    }

    if (employees.length === 0) {
      return 'No employees selected';
    }

    const addresses = getAddresses(currency);
    if (!addresses) {
      return `${currency} not supported on ${chain.name}`;
    }

    const wallets = employees.map(e => e.walletAddress.toLowerCase());
    if (new Set(wallets).size !== wallets.length) {
      return 'Duplicate wallet addresses detected';
    }

    const decimals = TOKEN_DECIMALS[currency] || 18;
    
    const total = employees.reduce((sum, emp) => {
      const amountInCurrency = addresses.isNative 
        ? usdToEth(emp.payUsd, ethPrice) // Convert USD to ETH
        : emp.payUsd; // Keep as USD for stablecoins
      
      return sum + parseUnits(amountInCurrency.toString(), decimals);
    }, 0n);

    // Check balance
    try {
      let balance: bigint;
      
      if (addresses.isNative) {
        // Check native ETH balance
        balance = await publicClient.getBalance({ address });
      } else {
        // Check ERC20 token balance
        balance = await publicClient.readContract({
          address: addresses.tokenAddress!,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address]
        }) as bigint;
      }

      if (balance < total) {
        return `Insufficient ${currency} balance`;
      }
    } catch (err) {
      return 'Failed to check balance';
    }

    return null;
  }, [address, chain, publicClient, getAddresses, ethPrice]);

  /**
   * Execute bulk payment
   */
  const execute = useCallback(async ({ employees, currency }: BulkPaymentParams) => {
    try {
      setError(null);
      setCurrentStep('idle');

      // Validate
      const validationError = await validate(employees, currency);
      if (validationError) {
        setError(validationError);
        setCurrentStep('error');
        throw new Error(validationError);
      }

      const addresses = getAddresses(currency)!;
      const decimals = TOKEN_DECIMALS[currency] || 18;

      const recipients = employees.map(e => e.walletAddress as Address);
      const amounts = employees.map(e => {
        const amountInCurrency = addresses.isNative 
          ? usdToEth(e.payUsd, ethPrice) 
          : e.payUsd;
        
        return parseUnits(amountInCurrency.toString(), decimals);
      });
      const total = amounts.reduce((sum, amt) => sum + amt, 0n);

      if (addresses.isNative) {
        // ===== NATIVE ETH PAYMENT =====
        // No approval needed for ETH, go straight to payment
        setCurrentStep('sending');
        
        const hash = await writeContractAsync({
          address: addresses.disperseAddress,
          abi: DISPERSE_ABI,
          functionName: 'disperseEther',
          args: [recipients, amounts],
          value: total,
        });

        setPaymentHash(hash);
        
        await publicClient!.waitForTransactionReceipt({ hash: hash as `0x${string}` });
        setCurrentStep('success');
        
        return hash;
        
      } else {
        // ===== ERC20 TOKEN PAYMENT =====
        // Check allowance
        const allowance = await publicClient!.readContract({
          address: addresses.tokenAddress!,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address!, addresses.disperseAddress]
        }) as bigint;

        if (allowance < total) {
          setCurrentStep('approving');
          
          const hash = await writeContractAsync({
            address: addresses.tokenAddress!,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [addresses.disperseAddress, total],
          });

          setApprovalHash(hash);
          
          await publicClient!.waitForTransactionReceipt({ hash: hash as `0x${string}` });
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
        
        await publicClient!.waitForTransactionReceipt({ hash: hash as `0x${string}` });
        setCurrentStep('success');
        
        return hash;
      }

    } catch (err: any) {
      // Check if user rejected the transaction
      if (err?.message?.includes('User rejected') || 
          err?.message?.includes('User denied') ||
          err?.message?.includes('user rejected')) {
        setError('Transaction cancelled');
        setCurrentStep('error');
        throw new Error('Transaction cancelled');
      }
      
      const errorMsg = err?.message || 'Transaction failed';
      setError(errorMsg);
      setCurrentStep('error');
      throw err;
    }
  }, [address, publicClient, writeContractAsync, validate, getAddresses, ethPrice]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setCurrentStep('idle');
    setApprovalHash(undefined);
    setPaymentHash(undefined);
    setError(null);
  }, []);

  /**
   * Calculate gas savings
   */
  const estimateGasSavings = useCallback((employeeCount: number): string => {
    const individualGas = employeeCount * 65000;
    const bulkGas = 50000 + (employeeCount * 5000);
    const savings = ((individualGas - bulkGas) / individualGas) * 100;
    return `${Math.round(savings)}%`;
  }, []);

  return {
    currentStep,
    approvalHash,
    paymentHash,
    error,
    ethPrice,
    isApproving: currentStep === 'approving',
    isSending: currentStep === 'sending',
    isSuccess: currentStep === 'success',
    isProcessing: currentStep === 'approving' || currentStep === 'sending',
    
    execute,
    validate,
    reset,
    estimateGasSavings,
    
    getTokenAddress: (currency: string) => getAddresses(currency)?.tokenAddress,
    getDisperseAddress: () => chain ? DISPERSE_CONTRACTS[chain.id] : undefined,
  };
}