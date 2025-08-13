import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { mockEmployees } from "../../Data/MockData";
import type { Employee } from "../../models/EmployeeModel";
import AddEmployeeModal from './AddEmployeeModal';
import PayCycleCard from './PayCycleCard.tsx';
import CashRequirementCard from './CashRequirementCard.tsx';
import EmployeeTable from './EmployeeTable.tsx';
import { config } from '../../utils/Environment';

const DashboardPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employees, setEmployees] = useState(mockEmployees);
  const [payingEmployeeId, setPayingEmployeeId] = useState<number | null>(null);
  const [cycleOffset, setCycleOffset] = useState(0); // 0 = current, -1 = previous, etc.
  
  const { address } = useAccount();
  
  // Wagmi hooks for transactions
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  // Get balance
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

  // Get numeric balance for calculations
  const getNumericBalance = () => {
    if (isError || !balanceData) return 0;
    return parseFloat(formatEther(balanceData.value));
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

      console.log(`Payment of ${employee.salary} ETH sent to ${employee.name}`);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setPayingEmployeeId(null);
    }
  };

  // Handle bulk payment
  const handleBulkPayment = async () => {
    const totalPayroll = calculateTotalPayroll();
    const availableBalance = getNumericBalance();
    
    if (availableBalance < totalPayroll) {
      alert('Insufficient funds for bulk payment');
      return;
    }

    const confirmPayment = window.confirm(
      `Are you sure you want to pay all ${employees.length} employees a total of ${totalPayroll.toFixed(4)} ETH?`
    );

    if (!confirmPayment) return;

    try {
      for (const employee of employees) {
        if (employee.walletAddress && employee.salary) {
          await handlePayEmployee(employee);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Bulk payment failed:', error);
      alert('Bulk payment failed. Some payments may have been processed.');
    }
  };

  // Pay cycle navigation
  const handlePreviousCycle = () => {
    setCycleOffset(prev => prev - 1);
  };

  const handleCurrentCycle = () => {
    setCycleOffset(0);
  };

  const totalPayrollAmount = calculateTotalPayroll();
  const availableBalance = getNumericBalance();

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

      {/* Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PayCycleCard 
          cycleOffset={cycleOffset}
          onPrevious={handlePreviousCycle}
          onCurrent={handleCurrentCycle}
        />
        
        <CashRequirementCard 
          totalPayroll={totalPayrollAmount}
          availableBalance={availableBalance}
          balanceLoading={isLoading}
          balanceError={isError}
          isSending={isSending}
          onBulkPayment={handleBulkPayment}
        />
      </div>

      {/* Employee Table */}
      <EmployeeTable 
        employees={employees}
        payingEmployeeId={payingEmployeeId}
        isSending={isSending}
        onPayEmployee={handlePayEmployee}
        onAddEmployee={() => setIsAddModalOpen(true)}
      />

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