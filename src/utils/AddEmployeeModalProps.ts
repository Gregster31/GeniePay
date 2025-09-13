import type { Employee } from "../types/EmployeeModel.ts";

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id'>) => void;
}