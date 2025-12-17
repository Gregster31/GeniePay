import { useEffect, useCallback } from 'react';
import { 
  useBalance, 
  useSendTransaction, 
  useWaitForTransactionReceipt,
  useAccount 
} from 'wagmi';
import { parseEther } from 'viem';
import { config } from '../utils/Environment';

interface PaymentData {
  recipientAddress: string;
  amount: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export const usePaymentWithRefetch = () => {
  const { address } = useAccount();
  
  // Balance hook with refetch capability
  const { 
    data: balanceData, 
    isError: balanceError, 
    isLoading: balanceLoading,
    refetch: refetchBalance 
  } = useBalance({
    address: address,
    chainId: config.chainId,
  });

  // Transaction hooks
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
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  // Auto-refetch balance when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && receipt) {
      // Small delay to ensure blockchain state is updated
      const timer = setTimeout(() => {
        refetchBalance();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, receipt, refetchBalance]);

  // Send payment function
  const sendPayment = useCallback(async ({
    recipientAddress,
    amount,
    onSuccess,
    onError
  }: PaymentData) => {
    try {
      // Reset previous transaction state
      resetTransaction();
      
      // Send transaction
      await sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(amount),
      });
      
      // Transaction sent successfully (not yet confirmed)
      console.log('Transaction sent, waiting for confirmation...');
      
      // Call success callback with hash if provided
      if (txHash && onSuccess) {
        onSuccess(txHash);
      }
    } catch (error) {
      console.error('Failed to send transaction:', error);
      onError?.(error as Error);
    }
  }, [sendTransaction, resetTransaction, txHash]);

  // Handle successful confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log('Transaction confirmed:', txHash);
    }
  }, [isConfirmed, txHash]);

  // Manual refetch function for explicit updates
  const manualRefetch = useCallback(async () => {
    await refetchBalance();
  }, [refetchBalance]);

  return {
    // Balance data
    balance: balanceData,
    balanceError,
    balanceLoading,
    refetchBalance: manualRefetch,
    
    // Transaction state
    sendPayment,
    txHash,
    isSending,
    isConfirming,
    isConfirmed,
    sendError,
    sendErrorDetails,
    receipt,
    
    // Combined loading state
    isProcessing: isSending || isConfirming,
  };
};