export interface BalanceContextType {
  balance: bigint | undefined;
  formattedBalance: string;
  symbol: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  lastUpdated: Date | null;
  isConnected: boolean;
}