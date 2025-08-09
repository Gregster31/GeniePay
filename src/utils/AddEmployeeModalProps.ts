import type { Employee } from "./Types";

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id'>) => void;
}