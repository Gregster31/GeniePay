import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EmployeeService } from '@/services/EmployeeService';
import { useGlobalBalance } from '@/contexts/BalanceContext';
import { useAuth } from '@/hooks/UseAuth';

export const useDashboard = () => {
  // State
  const [cycleOffset, setCycleOffset] = useState(0);
  
  // Hooks
  const { address } = useAccount();
  const { isAuthenticated, walletAddress } = useAuth();
  const { balance, formattedBalance, isLoading: balanceLoading, refetch: refetchBalance } = useGlobalBalance();
  
  const queryClient = useQueryClient();

  // Query for dashboard statistics only
  const { 
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['dashboard-stats', walletAddress],
    queryFn: () => walletAddress ? EmployeeService.getDashboardStats(walletAddress) : Promise.resolve(null),
    enabled: !!walletAddress && isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
  });

  // Calculations from stats
  const calculateTotalPayroll = () => {
    return dashboardStats?.totalPayroll || 0;
  };

  const getNumericBalance = () => {
    if (!balance) return 0;
    return parseFloat(formattedBalance);
  };

  // Get stats with defaults
  const stats = dashboardStats || {
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
    totalPaid: 0,
    employees: []
  };

  // Dashboard-specific calculations
  const dashboardMetrics = {
    totalEmployees: stats.totalEmployees,
    activeEmployees: stats.activeEmployees,
    totalPayroll: stats.totalPayroll,
    totalPaid: stats.totalPaid,
    averageSalary: stats.totalEmployees > 0 ? stats.totalPayroll / stats.totalEmployees : 0,
    payrollCoverage: getNumericBalance() > 0 ? (getNumericBalance() / stats.totalPayroll * 100) : 0,
    inactiveEmployees: stats.totalEmployees - stats.activeEmployees,
  };

  // Quick actions for dashboard
  const quickActions = {
    canRunPayroll: getNumericBalance() >= stats.totalPayroll && stats.activeEmployees > 0,
    needsFunding: getNumericBalance() < stats.totalPayroll,
    hasEmployees: stats.totalEmployees > 0,
  };

  return {
    // Dashboard metrics
    stats: dashboardMetrics,
    quickActions,
    
    // Loading states
    isLoading: statsLoading,
    
    // Error states
    error: statsError,
    
    // UI state
    cycleOffset,
    
    // Balance
    balance,
    formattedBalance,
    balanceLoading,
    
    // Actions
    refetchBalance,
    refetchStats: () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
    
    // Calculations
    calculateTotalPayroll,
    getNumericBalance,
    
    // UI actions
    setCycleOffset,
  };
};