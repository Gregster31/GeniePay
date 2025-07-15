import type { Employee } from "./AddEmployeeModalProps";

export interface PaymentModalProps {
  isOpen: boolean;
  employee: Employee | null;
  stablecoins: Stablecoin[];
  onClose: () => void;
  onSendPayment: (employee: Employee, token: string, amount: string) => void;
}

export interface Stablecoin {
  symbol: string;
  balance: string;
  icon: string;
}
