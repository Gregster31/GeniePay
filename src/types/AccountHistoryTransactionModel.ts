import type { Transaction } from "./TransactionModel";

export interface AccountHistoryTransaction extends Transaction {
  type: 'Payroll' | 'One-off Pay' | 'Bonus' | 'Reimbursement';
  gasUsed?: string;
  companyName: string;
}