// components/dashboard/DashboardComponent.tsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { mockEmployees } from "../../Data/MockData";
import type { Employee } from "../../models/EmployeeModel";
import AddEmployeeModal from './AddEmployeeModal';
import PayCycleCard from './PayCycleCard';
import CashRequirementCard from './CashRequirementCard';
import EmployeeTable from './EmployeeTable';
import { useGlobalBalance } from '../../contexts/BalanceContext';

const DashboardPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState(mockEmployees);
  const [payingEmployeeId, setPayingEmployeeId] = useState<number | null>(null);
  const [cycleOffset, setCycleOffset] = useState(0); // 0 = current, -1 = previous, etc.
  
  const { address } = useAccount();
  
  // Use global balance from context
  const { balance, formattedBalance, isLoading: balanceLoading, refetch: refetchBalance } = useGlobalBalance();
  
  // Wagmi hooks for transactions
  const { sendTransaction, data: txHash, isPending: isSending, reset: resetTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Calculate total payroll amount from all employees
  const calculateTotalPayroll = () => {
    return employees.reduce((total, employee) => {
      return total + parseFloat(String(employee.salary || '0'));
    }, 0);
  };

  // Get numeric balance for calculations
  const getNumericBalance = () => {
    if (!balance) return 0;
    return parseFloat(formattedBalance);
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
      resetTransaction(); // Reset previous transaction state
      
      await sendTransaction({
        to: employee.walletAddress as `0x${string}`,
        value: parseEther(employee.salary.toString()),
      });

      console.log(`Payment of ${employee.salary} ETH sent to ${employee.name}`);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPayingEmployeeId(null);
    }
  };

  // Handle successful payment - update balance
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log('Payment confirmed:', txHash);
      setPayingEmployeeId(null);
      
      // Update employee's last paid status (optional)
      setEmployees(prev => prev.map(emp => 
        emp.id === payingEmployeeId 
          ? { ...emp, lastPaid: new Date() }
          : emp
      ));
      
      // Refetch balance after a short delay
      setTimeout(() => {
        refetchBalance();
      }, 1000);
    }
  }, [isConfirmed, txHash, payingEmployeeId, refetchBalance]);

  // Check if payment is in progress for a specific employee
  const isPaymentInProgress = (employeeId: number) => {
    return payingEmployeeId === employeeId && (isSending || isConfirming);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your crypto payroll operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Wallet Balance</h3>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {balanceLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              `${formattedBalance} ETH`
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">Available for payroll</p>
        </div>

        {/* Total Payroll Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Payroll</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Monthly</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {calculateTotalPayroll().toFixed(4)} ETH
          </p>
          <p className="text-xs text-gray-500 mt-1">For {employees.length} employees</p>
        </div>

        {/* Employees Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Employees</h3>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Team</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
          <p className="text-xs text-gray-500 mt-1">Across all departments</p>
        </div>
      </div>

      {/* Pay Cycle and Cash Requirement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PayCycleCard 
          employees={employees}
          cycleOffset={cycleOffset}
          onCycleChange={setCycleOffset}
        />
        <CashRequirementCard 
          totalPayroll={calculateTotalPayroll()}
          currentBalance={getNumericBalance()}
        />
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Employee Payroll</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Employee
            </button>
          </div>
        </div>
        
        <EmployeeTable 
          employees={employees}
          onPayEmployee={handlePayEmployee}
          isPaymentInProgress={isPaymentInProgress}
        />
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

export default DashboardPage;