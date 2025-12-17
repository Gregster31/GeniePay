import type { AccountHistoryTransaction } from "../types/AccountHistoryTransactionModel";

// Invoice Modal Component
export interface InvoiceModalProps {
  transaction: AccountHistoryTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}