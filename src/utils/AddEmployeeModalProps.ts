export interface Employee {
  id: number;
  name: string;
  walletAddress: string;
  avatar?: string | null;
}

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
}