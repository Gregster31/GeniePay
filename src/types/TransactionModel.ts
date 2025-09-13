// Transaction types
export interface Transaction {
  id: string;
  recipientName: string;
  recipientAddress: string;
  amount: number;
  token: string;
  date: Date;
  status: 'Success' | 'Failed' | 'Pending';
  txHash: string;
  note?: string;
}

