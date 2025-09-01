import type { AccountHistoryTransaction } from "../models/AccountHistoryTransactionModel";

// Invoice Modal Component
export interface InvoiceModalProps {
  transaction: AccountHistoryTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}