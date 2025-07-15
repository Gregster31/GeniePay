import React, { useState } from 'react';
import WalletConnection from './components/WalletConnection';
import DashboardHeader from './components/DashboardHeader';
import BalanceCards from './components/BalanceCards';
import EmployeeList from './components/EmployeeList';
import AddEmployeeModal, { type Employee } from './components/AddEmployeeModal';
import PaymentModal from './components/PaymentModal';

const App: React.FC = () => {
  // Wallet state
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress] = useState('0x742d35Cc6634C0532925a3b8D34EAB');

  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPayEmployee, setShowPayEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Data state
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: 'John Doe',
      walletAddress: '0x742d35Cc6634C0532925a3b8D34EAB',
      avatar: null
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      walletAddress: '0x892f45Bc7745D0643856a4c9E45FAC',
      avatar: null
    }
  ]);

  const stablecoins = [
    { symbol: 'USDC', balance: '1,250.50', icon: '💰' },
    { symbol: 'USDT', balance: '850.25', icon: '💵' },
    { symbol: 'DAI', balance: '2,100.75', icon: '💲' }
  ];

  // Handlers
  const handleConnectWallet = () => {
    // TODO: Implement actual MetaMask connection
    console.log('Connecting to MetaMask...');
    setIsConnected(true);
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: employees.length + 1,
    };
    setEmployees(prev => [...prev, newEmployee]);
    console.log('Employee added:', newEmployee);
  };

  const handlePayEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPayEmployee(true);
  };

  const handleSendPayment = (employee: Employee, token: string, amount: string) => {
    // TODO: Implement actual payment logic
    console.log('Sending payment:', { employee, token, amount });
    // You would integrate with Web3 here
  };

  const handleCloseAddEmployee = () => {
    setShowAddEmployee(false);
  };

  const handleClosePayEmployee = () => {
    setShowPayEmployee(false);
    setSelectedEmployee(null);
  };

  // Render wallet connection screen if not connected
  if (!isConnected) {
    return (
      <WalletConnection
        onConnect={handleConnectWallet}
        isConnecting={false}
      />
    );
  }

  // Render main dashboard
  return (
    <div className="min-h-screen gradient-bg">
      <DashboardHeader
        walletAddress={walletAddress}
        isConnected={isConnected}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BalanceCards stablecoins={stablecoins} />
        
        <EmployeeList
          employees={employees}
          onAddEmployee={() => setShowAddEmployee(true)}
          onPayEmployee={handlePayEmployee}
        />
      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddEmployee}
        onClose={handleCloseAddEmployee}
        onAddEmployee={handleAddEmployee}
      />

      <PaymentModal
        isOpen={showPayEmployee}
        onClose={handleClosePayEmployee}
        employee={selectedEmployee}
        stablecoins={stablecoins}
        onSendPayment={handleSendPayment}
      />
    </div>
  );
};

export default App;