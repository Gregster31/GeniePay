
import React from 'react';
import { Loader2 } from "lucide-react";
import { useDashboard } from './hooks/UseDashboard';
import { PayCycleCard } from './components/PayCycleCard';
import { CashRequirementCard } from './components/CashRequirementCard';
import { EmployeeTable } from './components/EmployeeTable';
import { AddEmployeeModal } from './components/AddEmployeeModal';

const Dashboard: React.FC = () => {
  const {
    employees,
    totalPayroll,
    numericBalance,
    formattedBalance,
    balanceLoading,
    cycleOffset,
    isAddModalOpen,
    handleAddEmployee,
    handlePayEmployee,
    isPaymentInProgress,
    setCycleOffset,
    setIsAddModalOpen,
  } = useDashboard();

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
            {totalPayroll.toFixed(4)} ETH
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
          totalPayroll={totalPayroll}
          currentBalance={numericBalance}
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

export default Dashboard;