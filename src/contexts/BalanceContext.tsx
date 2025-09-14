import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAccount, useBalance, useWatchBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import { config } from '@/utils/Environment';
import type { BalanceContextType } from '@/types/BalanceContextType';

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

/**
 * BalanceProvider manages wallet balance state and blockchain updates
 * - Tracks ETH balance for connected wallet
 * - Automatically updates on new blocks
 * - Provides formatted balance for UI display
 * - Handles loading and error states
 * - Only active when wallet is connected
 */
export const BalanceProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { 
    data: balanceData, 
    isError, 
    isLoading,
    refetch,
    error
  } = useBalance({
    address: address,
    chainId: config.chainId,
    query: {
      enabled: !!address && isConnected,
    }
  });

  useWatchBlockNumber({
    enabled: isConnected,
    onBlockNumber() {
      if (address && isConnected) {
        refetch();
        setLastUpdated(new Date());
      }
    },
  });

  useEffect(() => {
    if (balanceData && isConnected) {
      setLastUpdated(new Date());
    }
  }, [balanceData, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      setLastUpdated(null);
    }
  }, [isConnected]);

  const formattedBalance = useMemo(() => {
    if (!balanceData || !isConnected) return '0.0000';
    return parseFloat(formatEther(balanceData.value)).toFixed(4);
  }, [balanceData, isConnected]);

  const contextValue = useMemo((): BalanceContextType => ({
    balance: balanceData?.value,
    formattedBalance,
    symbol: balanceData?.symbol || 'ETH',
    isLoading: isLoading && isConnected,
    isError: isError && isConnected,
    error: error || null,
    refetch,
    lastUpdated,
    isConnected,
  }), [balanceData, formattedBalance, isLoading, isError, error, refetch, lastUpdated, isConnected]);

  return (
    <BalanceContext.Provider value={contextValue}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useGlobalBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useGlobalBalance must be used within BalanceProvider');
  }
  return context;
};