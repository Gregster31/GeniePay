import { useEffect, useCallback } from 'react';
import { 
  useBalance, 
  useSendTransaction, 
  useWaitForTransactionReceipt,
  useAccount 
} from 'wagmi';
import { parseEther } from 'viem';
import { config } from '../utils/Environment';

interface SendPaymentParams {
  recipientAddress: string;
  amount: string;
}

export const usePayment = () => {
  const { address } = useAccount();
  
  const { 
    data: balance, 
    isError: balanceError, 
    isLoading: balanceLoading,
    refetch: refetchBalance 
  } = useBalance({
    address,
    chainId: config.chainId,
  });

  const { 
    sendTransaction, 
    data: txHash, 
    isPending: isSending,
    isError: sendError,
    error: sendErrorDetails,
    reset: resetTransaction
  } = useSendTransaction();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Auto-refetch balance when transaction confirms
  useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => refetchBalance(), 500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetchBalance]);

  const sendPayment = useCallback(
    ({ recipientAddress, amount }: SendPaymentParams) => {
      resetTransaction();
      
      sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(amount),
      });
    },
    [sendTransaction, resetTransaction]
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