import type { Employee } from "./AddEmployeeModalProps";
import type { Coin } from "./BalanceCardsProps";

export interface PaymentModalProps {
  isOpen: boolean;
  employee: Employee | null;
  stablecoins: Coin[];
  onClose: () => void;
  onSendPayment: (employee: Employee, token: string, amount: string) => void;
}
