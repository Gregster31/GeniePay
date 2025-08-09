import type { Employee } from "../types/Types";

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id'>) => void;
}