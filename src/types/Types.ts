// Types
export interface Employee {
  id: number;
  name: string;
  walletAddress: string;
  avatar?: string | null;
}


export interface AccountBalance {
  symbol: string;
  balance: string;
  icon: string;
  loading: boolean;
  error?: string;
}

