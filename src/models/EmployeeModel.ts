export interface Employee {
  id: string;
  name: string;
  walletAddress: string;
  role: string;
  payUsd: number;
  dateAdded: Date;
  email?: string;
  department?: string;
}