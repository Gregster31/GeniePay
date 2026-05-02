import { useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import type { TokenSymbol } from '@/config/tokenConfig';
import { getTokenAddress, TOKEN_DECIMALS } from '@/config/tokenConfig';

export const useGlobalBalance = (token: TokenSymbol = 'ETH') => {
  const { address, isConnected, chain } = useAccount();

  const tokenAddress = useMemo(() => {
    if (!chain || token === 'ETH') return undefined;
    const addr = getTokenAddress(chain.id, token);
    return addr && addr !== 'native' ? addr : undefined;
  }, [chain, token]);

  const {
    data: balanceData,
    isError,
    isLoading,
    refetch,
    error
  } = useBalance({
    address: address,
    token: tokenAddress,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 12000,
      staleTime: 12_000,
    }
  });

  const formattedBalance = useMemo(() => {
    if (!balanceData || !isConnected) return '0.0000';
    if (token === 'ETH') {
      return parseFloat(formatEther(balanceData.value)).toFixed(4);
    }
    const decimals = TOKEN_DECIMALS[token];
    return parseFloat(formatUnits(balanceData.value, decimals)).toFixed(4);
  }, [balanceData, isConnected, token]);

  return {
    balance: balanceData?.value,
    formattedBalance,
    symbol: token,
    isLoading: isLoading && isConnected,
    isError: isError && isConnected,
    error: error || null,
    refetch,
    isConnected,
  };
};
