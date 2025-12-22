import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useGlobalBalance } from '@/hooks/useGlobalBalance';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Dashboard Hook - No Database Version
 * 
 * For MVP without backend:
 * - Shows wallet balance
 * - All employee/payroll data will come from local state or blockchain later
 * - Quick actions based on wallet state
 */
export const useDashboard = () => {
  // State
  const [cycleOffset, setCycleOffset] = useState(0);
  
  // Hooks
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const { 
    balance, 
    formattedBalance, 
    isLoading: balanceLoading, 
    refetch: refetchBalance 
  } = useGlobalBalance();

  // Get numeric balance for calculations
  const getNumericBalance = () => {
    if (!balance) return 0;
    return parseFloat(formattedBalance);
  };

  // Mock stats for now - will be replaced with real data later
  // TODO: Replace with actual employee data when you add it
  const stats = {
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
    totalPaid: 0,
    averageSalary: 0,
    payrollCoverage: 0,
    inactiveEmployees: 0,
  };

  // Quick actions based on current state
  const quickActions = {
    canRunPayroll: false, // Will be true when you have employees
    needsFunding: getNumericBalance() === 0,
    hasEmployees: false, // Will be true when you add employees
    hasBalance: getNumericBalance() > 0,
  };

  return {
    // Dashboard metrics (all zeros for now)
    stats,
    quickActions,
    
    // Loading states
    isLoading: balanceLoading,
    
    // No errors for now
    error: null,
    
    // UI state
    cycleOffset,
    
    // Balance info
    balance,
    formattedBalance,
    balanceLoading,
    walletAddress: address,
    isAuthenticated,
    
    // Actions
    refetchBalance,
    refetchStats: () => {
      // No stats to refetch yet - just refresh balance
      refetchBalance();
    },
    
    // Calculations
    getNumericBalance,
    
    // UI actions
    setCycleOffset,
  };
};