import { useQuery } from '@tanstack/react-query';
import { fetchEthPrice } from '@/utils/EthUtils';

export const useEthPrice = () => {
  const { data: ethPrice = 3000, isLoading, isError } = useQuery({
    queryKey: ['ethPrice'],
    queryFn: fetchEthPrice,
    refetchInterval: 60_000,
    staleTime: 30_000,
    placeholderData: 3000,
    retry: 2,
  });

  return { ethPrice, isLoading, isError };
};