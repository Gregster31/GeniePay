import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { mockEmployees } from '@/data/MockData';
import type { Employee } from '@/types/EmployeeModel';
import { useGlobalBalance } from '@/contexts/BalanceContext';

export const useDashboard = () => {
  // State
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [payingEmployeeId, setPayingEmployeeId] = useState<number | null>(null);
  const [cycleOffset, setCycleOffset] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Hooks
  const { address } = useAccount();
  const { balance, formattedBalance, isLoading: balanceLoading, refetch: refetchBalance } = useGlobalBalance();
  const { sendTransaction, data: txHash, isPending: isSending, reset: resetTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Calculations
  const calculateTotalPayroll = () => {
    return employees.reduce((total, employee) => {
      return total + parseFloat(String(employee.salary || '0'));
    }, 0);
  };

  const getNumericBalance = () => {
    if (!balance) return 0;
    return parseFloat(formattedBalance);
  };

  // Employee management
  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      id: Date.now(),
      ...employeeData
    };
    setEmployees(prev => [...prev, newEmployee]);
    setIsAddModalOpen(false);
  };

  // Payment handling
  const handlePayEmployee = async (employee: Employee) => {
    if (!employee.walletAddress || !employee.salary) {
      alert('Employee wallet address or salary is missing');
      return;
    }

    try {
      setPayingEmployeeId(employee.id);
      resetTransaction();
      
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

  // Check if payment is in progress
  const isPaymentInProgress = (employeeId: number) => {
    return payingEmployeeId === employeeId && (isSending || isConfirming);
  };

  // Handle successful payment
  useEffect(() => {
    if (isConfirmed && txHash) {
      console.log('Payment confirmed:', txHash);
      setPayingEmployeeId(null);
      
      // Update employee's last paid status
      setEmployees(prev => prev.map(emp => 
        emp.id === payingEmployeeId 
          ? { ...emp, lastPayment: new Date() }
          : emp
      ));
      
      // Refetch balance after a short delay
      setTimeout(() => {
        refetchBalance();
      }, 1000);
    }
  }, [isConfirmed, txHash, payingEmployeeId, refetchBalance]);

  return {
    // State
    employees,
    payingEmployeeId,
    cycleOffset,
    isAddModalOpen,
    
    // Computed values
    totalPayroll: calculateTotalPayroll(),
    numericBalance: getNumericBalance(),
    
    // Balance data
    balance,
    formattedBalance,
    balanceLoading,
    
    // Transaction states
    isSending,
    isConfirming,
    isConfirmed,
    txHash,
    
    // Actions
    handleAddEmployee,
    handlePayEmployee,
    isPaymentInProgress,
    setCycleOffset,
    setIsAddModalOpen,
    refetchBalance,
    
    // Account info
    address,
  };
};