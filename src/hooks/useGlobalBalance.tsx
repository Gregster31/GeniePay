/**
 * Simple Balance Hook - No Context Needed
 * Just wraps Wagmi's useBalance with formatting
 */

import { useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

export const useGlobalBalance = () => {
  const { address, isConnected } = useAccount();
  
  const { 
    data: balanceData, 
    isError, 
    isLoading,
    refetch,
    error
  } = useBalance({
    address: address,
    query: {
      enabled: !!address && isConnected,
      // Automatically refetches on new blocks
      refetchInterval: 12000, // Every 12 seconds (Ethereum block time)
    }
  });

  const formattedBalance = useMemo(() => {
    if (!balanceData || !isConnected) return '0.0000';
    return parseFloat(formatEther(balanceData.value)).toFixed(4);
  }, [balanceData, isConnected]);

  return {
    balance: balanceData?.value,
    formattedBalance,
    symbol: balanceData?.symbol || 'ETH',
    isLoading: isLoading && isConnected,
    isError: isError && isConnected,
    error: error || null,
    refetch,
    isConnected,
  };
};