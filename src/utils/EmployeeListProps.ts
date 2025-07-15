import type { Employee } from '../utils/AddEmployeeModalProps';

export interface EmployeeListProps {
    employees: Employee[];
    onAddEmployee: () => void;
    onPayEmployee: (employee: Employee) => void;
}

export const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-5)}`;
};