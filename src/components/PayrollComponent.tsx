import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Download, MoreHorizontal, User, Users } from "lucide-react";
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { mockEmployees } from "../utils/MockData";
import type { Employee } from '../utils/Types.ts';
import AddEmployeeModal from './AddEmployeeModal';

// Main Payroll Page Component
const PayrollPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState(mockEmployees);
  const { address } = useAccount();
  
  // Get real ETH balance
  const { data: balanceData, isError, isLoading } = useBalance({
    address: address,
  });

  // Calculate total payroll amount from all employees
  const calculateTotalPayroll = () => {
    return employees.reduce((total, employee) => {
      // Generate consistent salary for each employee based on their ID
      const salary = parseFloat(((employee.id % 5) + 1).toFixed(2));
      return total + salary;
    }, 0);
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      id: Date.now(),
      ...employeeData
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  // Get formatted balance
  const getFormattedBalance = () => {
    if (isLoading) return "Loading...";
    if (isError || !balanceData) return "0.00 ETH";
    return `${parseFloat(formatEther(balanceData.value)).toFixed(4)} ETH`;
  };

  // Get numeric balance for calculations
  const getNumericBalance = () => {
    if (isError || !balanceData) return 0;
    return parseFloat(formatEther(balanceData.value));
  };

  const totalPayrollAmount = calculateTotalPayroll();
  const availableBalance = getNumericBalance();
  const requiredAmount = Math.max(0, totalPayrollAmount - availableBalance);

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Current
          </button>
          <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            Previous
          </button>
          <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            Severance
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
          >
            <Users className="w-4 h-4" />
            Add Employee
          </button>
          <button className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pay Cycle Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Pay Cycle</h3>
          </div>
          <div className="text-sm text-gray-600 mb-2">May 16th - May 31st</div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Date to Update</span>
              <span className="text-gray-600">Pay Date</span>
            </div>
            <div className="flex justify-between">
              <span className="text-2xl font-bold text-gray-900">May 26</span>
              <span className="text-2xl font-bold text-gray-900">Jun 01</span>
            </div>
          </div>
        </div>

        {/* Cash Requirement Card */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Cash Requirement</h3>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Payroll Amount</div>
              <div className="text-2xl font-bold text-gray-900">{totalPayrollAmount.toFixed(2)} ETH</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Available Balance</div>
              <div className={`text-2xl font-bold ${isLoading ? 'text-gray-400' : 'text-gray-900'}`}>
                {getFormattedBalance()}
              </div>
              {isError && (
                <div className="text-xs text-red-500 mt-1">Error loading balance</div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Required</div>
              <div className={`text-2xl font-bold ${requiredAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {requiredAmount > 0 ? `${requiredAmount.toFixed(4)} ETH` : '0.00 ETH'}
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-4 text-white ${
            availableBalance >= totalPayrollAmount 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Total Amount to Pay</div>
                <div className="text-2xl font-bold">{totalPayrollAmount.toFixed(2)} ETH</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Due by</div>
                <div className="text-lg font-semibold">Jun 01</div>
              </div>
              <button 
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  availableBalance >= totalPayrollAmount
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30 cursor-not-allowed opacity-75'
                }`}
                disabled={availableBalance < totalPayrollAmount}
              >
                <Download className="w-4 h-4" />
                {availableBalance >= totalPayrollAmount ? 'Pay now' : 'Insufficient funds'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
                <Users className="w-4 h-4" />
                All Employees
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Calendar className="w-4 h-4" />
                <span>Pending Actions</span>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">4</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Calendar className="w-4 h-4" />
                Paused
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Salary (ETH)</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => {
                // Generate consistent salary based on employee ID
                const salary = ((employee.id % 5) + 1).toFixed(2);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {employee.avatar ? (
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.walletAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {salary} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Pay</button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEmployee}
      />
    </div>
  );
};

export default PayrollPage;