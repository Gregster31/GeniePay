import React, { useState } from 'react';
import { Plus, User, Send, Copy, Check } from 'lucide-react';
import type { Employee } from './AddEmployeeModal';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onPayEmployee: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onAddEmployee,
  onPayEmployee,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const EmptyState = () => (
    <div className="empty-state">
      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No employees yet
      </h3>
      <p className="text-gray-500">
        Add your first employee to start sending payments
      </p>
    </div>
  );

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className="employee-card">
      <div className="flex items-center gap-4 mb-4">
        <div className="avatar-placeholder">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt={employee.name} 
              className="w-12 h-12 rounded-full object-cover" 
            />
          ) : (
            <User className="w-6 h-6 text-blue-600" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
          <div className="flex items-center gap-2">
            <p className="truncate-address">
              {truncateAddress(employee.walletAddress)}
            </p>
            <button
              onClick={() => copyAddress(employee.walletAddress)}
              className="copy-button"
              title="Copy wallet address"
            >
              {copiedAddress === employee.walletAddress ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => onPayEmployee(employee)}
        className="w-full py-2 px-4 btn-primary btn-icon"
      >
        <Send className="w-4 h-4" />
        Send Payment
      </button>
    </div>
  );

  return (
    <div className="card">
      <div className="section-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Employees</h2>
            <p className="text-sm text-gray-500">
              Manage your team and send payments
            </p>
          </div>
          <button
            onClick={onAddEmployee}
            className="px-4 py-2 btn-primary btn-icon"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="p-6">
        {employees.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;