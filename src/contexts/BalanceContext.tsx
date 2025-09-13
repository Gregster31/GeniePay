// contexts/BalanceContext.tsx
import React, { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAccount, useBalance, useWatchBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import { config } from '../utils/environment';

interface BalanceContextType {
  balance: bigint | undefined;
  formattedBalance: string;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  lastUpdated: Date | null;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address } = useAccount();
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  
  // Balance hook
  const { 
    data: balanceData, 
    isError, 
    isLoading,
    refetch 
  } = useBalance({
    address: address,
    chainId: config.chainId,
  });

  // Watch for new blocks and refetch balance
  useWatchBlockNumber({
    onBlockNumber() {
      if (address) {
        refetch();
        setLastUpdated(new Date());
      }
    },
  });

  // Update timestamp when balance changes
  useEffect(() => {
    if (balanceData) {
      setLastUpdated(new Date());
    }
  }, [balanceData]);

  // Format balance for display
  const formattedBalance = React.useMemo(() => {
    if (!balanceData) return '0.0000';
    return parseFloat(formatEther(balanceData.value)).toFixed(4);
  }, [balanceData]);

  const contextValue: BalanceContextType = {
    balance: balanceData?.value,
    formattedBalance,
    isLoading,
    isError,
    refetch,
    lastUpdated,
  };

  return (
    <BalanceContext.Provider value={contextValue}>
      {children}
    </BalanceContext.Provider>
  );
};

// Custom hook to use balance context
export const useGlobalBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useGlobalBalance must be used within BalanceProvider');
  }
  return context;
};