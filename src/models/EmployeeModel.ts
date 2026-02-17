export interface Employee {
  id: number;
  name: string;
  walletAddress: string;
  role: string;
  payUsd: number;
  dateAdded: Date;
  email?: string;
  department?: string;
}