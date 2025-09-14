// components/dashboard/PayCycleCard.tsx
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import type { Employee } from '@/types/EmployeeModel';

interface PayCycleCardProps {
  employees: Employee[];
  cycleOffset: number;
  onCycleChange: (offset: number) => void;
}

export const PayCycleCard: React.FC<PayCycleCardProps> = ({ 
  employees, 
  cycleOffset, 
  onCycleChange 
}) => {
  // Calculate current cycle dates
  const getCurrentCycleDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + cycleOffset);
    return date;
  };

  const cycleDate = getCurrentCycleDate();
  const monthYear = cycleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Calculate employees to be paid
  const employeesToPay = employees.filter(emp => emp.walletAddress);
  const totalAmount = employeesToPay.reduce((sum, emp) => sum + (emp.salary || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Pay Cycle</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCycleChange(cycleOffset - 1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium px-2">{monthYear}</span>
          <button
            onClick={() => onCycleChange(cycleOffset + 1)}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={cycleOffset >= 0}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Payment Date</span>
          </div>
          <span className="text-sm font-medium">
            {new Date(cycleDate.getFullYear(), cycleDate.getMonth() + 1, 0).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Employees</span>
          </div>
          <span className="text-sm font-medium">{employeesToPay.length}</span>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Total Amount</span>
            <span className="text-lg font-semibold text-blue-900">
              {totalAmount.toFixed(4)} ETH
            </span>
          </div>
        </div>
      </div>

      {cycleOffset === 0 && (
        <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Process Payroll
        </button>
      )}
    </div>
  );
};