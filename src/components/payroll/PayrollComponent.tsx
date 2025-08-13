import React, { useState } from 'react';
import { Calendar, DollarSign, Download, MoreHorizontal, User, Users, Loader2 } from "lucide-react";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { mockEmployees } from "../../Data/MockData.ts";
import type { Employee } from "../../models/EmployeeModel.ts";
import AddEmployeeModal from './AddEmployeeModal.tsx';
import { config } from '../../utils/environment.ts';

// Main Payroll Page Component
const PayrollPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState(mockEmployees);
  const [payingEmployeeId, setPayingEmployeeId] = useState<number | null>(null);
  const { address } = useAccount();
  
  // Wagmi hooks for transactions
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  // Get balance for the appropriate network (mainnet or Sepolia)
  const { data: balanceData, isError, isLoading } = useBalance({
    address: address,
    chainId: config.chainId,
  });

  // Calculate total payroll amount from all employees
  const calculateTotalPayroll = () => {
    return employees.reduce((total, employee) => {
      return total + parseFloat(String(employee.salary || '0'));
    }, 0);
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      id: Date.now(),
      ...employeeData
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  // Handle individual employee payment
  const handlePayEmployee = async (employee: Employee) => {
    if (!employee.walletAddress || !employee.salary) {
      alert('Employee wallet address or salary is missing');
      return;
    }

    try {
      setPayingEmployeeId(employee.id);
      
      await sendTransaction({
        to: employee.walletAddress as `0x${string}`,
        value: parseEther(employee.salary.toString()),
      });

      // Transaction submitted successfully
      console.log(`Payment of ${employee.salary} ETH sent to ${employee.name}`);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPayingEmployeeId(null);
    }
  };

  // Handle bulk payment (Pay now button)
  const handleBulkPayment = async () => {
    if (availableBalance < totalPayrollAmount) {
      alert('Insufficient funds for bulk payment');
      return;
    }

    const confirmPayment = window.confirm(
      `Are you sure you want to pay all ${employees.length} employees a total of ${totalPayrollAmount.toFixed(4)} ETH?`
    );

    if (!confirmPayment) return;

    try {
      // For demo purposes, we'll pay employees sequentially
      // In production, you might want to use a smart contract for batch payments
      for (const employee of employees) {
        if (employee.walletAddress && employee.salary) {
          await handlePayEmployee(employee);
          // Add small delay between transactions
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Bulk payment failed:', error);
      alert('Bulk payment failed. Some payments may have been processed.');
    }
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
      {/* Environment indicator */}
      {!config.isProduction && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-sm font-medium">🧪 Test Mode - Using Sepolia Testnet</span>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {(isSending || isConfirming) && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              {isSending && 'Sending transaction...'}
              {isConfirming && 'Confirming transaction...'}
            </span>
          </div>
        </div>
      )}

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
              <div className="text-2xl font-bold text-gray-900">{totalPayrollAmount.toFixed(4)} ETH</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">
                Available Balance {!config.isProduction && '(Sepolia)'}
              </div>
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
                <div className="text-2xl font-bold">{totalPayrollAmount.toFixed(4)} ETH</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Due by</div>
                <div className="text-lg font-semibold">Jun 01</div>
              </div>
              <button 
                onClick={handleBulkPayment}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  availableBalance >= totalPayrollAmount && !isSending
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30 cursor-not-allowed opacity-75'
                }`}
                disabled={availableBalance < totalPayrollAmount || isSending}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {availableBalance >= totalPayrollAmount 
                  ? (isSending ? 'Processing...' : 'Pay now') 
                  : 'Insufficient funds'
                }
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
                All Employees ({employees.length})
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
                const isPayingThisEmployee = payingEmployeeId === employee.id;
                
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
                      <span className="font-mono text-xs">
                        {employee.walletAddress}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {employee.salary || '0'} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handlePayEmployee(employee)}
                        disabled={isPayingThisEmployee || isSending || !employee.walletAddress || !employee.salary}
                        className={`text-blue-600 hover:text-blue-900 mr-4 flex items-center gap-1 ${
                          (isPayingThisEmployee || isSending || !employee.walletAddress || !employee.salary) 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {isPayingThisEmployee ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Paying...
                          </>
                        ) : (
                          'Pay'
                        )}
                      </button>
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