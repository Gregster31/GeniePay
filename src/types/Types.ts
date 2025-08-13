// Types
export interface Employee {
  id: number;
  name: string;
  walletAddress: string;
  avatar?: string | null;
  salary: number;
}


export interface AccountBalance {
  symbol: string;
  balance: string;
  icon: string;
  loading: boolean;
  error?: string;
}

