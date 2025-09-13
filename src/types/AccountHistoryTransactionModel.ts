import type { Transaction } from "./TransactionModel";

// Extended interface for additional fields needed for Account History
export interface AccountHistoryTransaction extends Transaction {
  type: 'Payroll' | 'One-off Pay' | 'Bonus' | 'Reimbursement';
  gasUsed?: string;
  companyName: string;
}