import { useQuery } from '@tanstack/react-query';
import { fetchEthPrice } from '@/utils/EthUtils';

export const useEthPrice = () => {
  const { data: ethPrice = 0, isLoading, isError } = useQuery({
    queryKey: ['ethPrice'],
    queryFn: fetchEthPrice,
    refetchInterval: 60_000,
    staleTime: 60_000,
    placeholderData: 0,
    retry: 2,
  });

  return { ethPrice, isLoading, isError };
};