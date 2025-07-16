import React, { useState, useEffect, useCallback } from 'react';
import WalletConnection from './components/WalletConnection';
import DashboardHeader from './components/DashboardHeader';
import BalanceCards from './components/BalanceCards';
import EmployeeList from './components/EmployeeList';
import type { Employee } from './utils/AddEmployeeModalProps';
import PaymentModal from './components/PaymentModal';
import AddEmployeeModal from './components/AddEmployeeModal';
import { fetchEthBalance, getCurrentNetwork, type AccountBalance, isMetaMaskInstalled, getMetaMask } from './utils/balanceUtils';
import type { MetaMaskError } from './types/ethereum';

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState<string>('');

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showPayEmployee, setShowPayEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: 'John Doe',
      walletAddress: '0x742d35Cc6634C0532925a3b8D34EAB',
      avatar: null,
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      walletAddress: '0x892f45Bc7745D0643856a4c9E45FAC',
      avatar: null,
    },
  ]);

  const [accountBalance, setAccountBalance] = useState<AccountBalance>({
    symbol: 'ETH',
    balance: '0.0000',
    icon: '⚡',
    loading: false,
  });

  // Function to fetch account balance
  const fetchAccountBalance = useCallback(async () => {
    if (!walletAddress || !isConnected) return;

    setAccountBalance(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const balance = await fetchEthBalance(walletAddress);
      setAccountBalance(prev => ({
        ...prev,
        balance,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching account balance:', error);
      setAccountBalance(prev => ({
        ...prev,
        balance: '0.0000',
        loading: false,
        error: 'Failed to fetch balance',
      }));
    }
  }, [walletAddress, isConnected]);

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setConnectionError('MetaMask is not installed. Please install it to continue.');
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    try {
      const ethereum = getMetaMask();
      if (!ethereum) throw new Error('Ethereum provider not found');

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        
        // Get current network
        const network = await getCurrentNetwork();
        setCurrentNetwork(network);
      } else {
        setConnectionError('No accounts found. Please make sure MetaMask is unlocked.');
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      const err = error as MetaMaskError;

      if (err.code === 4001) {
        setConnectionError('Connection rejected. Please approve the connection request.');
      } else if (err.code === -32002) {
        setConnectionError('Connection request is already pending. Please check MetaMask.');
      } else {
        setConnectionError('Failed to connect to MetaMask. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setConnectionError('');
    setCurrentNetwork('');
    setAccountBalance({
      symbol: 'ETH',
      balance: '0.0000',
      icon: '⚡',
      loading: false,
    });
  };

  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const ethereum = getMetaMask();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        handleDisconnectWallet();
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    const handleChainChanged = async (chainId: string) => {
      console.log('Chain changed to:', chainId);
      
      // Update network name
      const network = await getCurrentNetwork();
      setCurrentNetwork(network);
      
      // Refetch balance when chain changes
      if (isConnected && walletAddress) {
        setTimeout(() => fetchAccountBalance(), 1000);
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [isConnected, walletAddress, fetchAccountBalance]);

  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      const ethereum = getMetaMask();
      if (!ethereum) return;

      try {
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          
          // Get current network
          const network = await getCurrentNetwork();
          setCurrentNetwork(network);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Fetch balance when connected or wallet address changes
  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchAccountBalance();
    }
  }, [isConnected, walletAddress, fetchAccountBalance]);

  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = { ...employeeData, id: employees.length + 1 };
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const handlePayEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPayEmployee(true);
  };

  const handleSendPayment = async (employee: Employee, token: string, amount: string) => {
    try {
      if (!isMetaMaskInstalled()) throw new Error('MetaMask is not installed');

      const ethereum = getMetaMask();
      if (!ethereum) throw new Error('Ethereum provider not found');

      console.log('Would send transaction from:', walletAddress);
      console.log('To:', employee.walletAddress);
      console.log('Amount:', amount, token);

      alert(`Payment of ${amount} ${token} sent to ${employee.name}!`);
      
      // Refresh balance after payment
      setTimeout(() => {
        fetchAccountBalance();
      }, 2000);
    } catch (error: any) {
      console.error('Payment failed:', error);
      alert('Payment failed: ' + error.message);
    }
  };

  const handleCloseAddEmployee = () => setShowAddEmployee(false);
  const handleClosePayEmployee = () => {
    setShowPayEmployee(false);
    setSelectedEmployee(null);
  };

  if (!isConnected) {
    return (
      <WalletConnection
        onConnect={handleConnectWallet}
        isConnecting={isConnecting}
        error={connectionError}
      />
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <DashboardHeader
        walletAddress={walletAddress}
        isConnected={isConnected}
        onDisconnect={handleDisconnectWallet}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Account Balance</h2>
            <div className="text-sm text-gray-500">
              Network: <span className="font-medium">{currentNetwork}</span>
            </div>
          </div>
        </div>
        
        <BalanceCards 
          accountBalance={accountBalance} 
          onRefresh={fetchAccountBalance}
        />
        
        <EmployeeList
          employees={employees}
          onAddEmployee={() => setShowAddEmployee(true)}
          onPayEmployee={handlePayEmployee}
        />
      </div>

      <AddEmployeeModal
        isOpen={showAddEmployee}
        onClose={handleCloseAddEmployee}
        onAddEmployee={handleAddEmployee}
      />
      <PaymentModal
        isOpen={showPayEmployee}
        onClose={handleClosePayEmployee}
        employee={selectedEmployee}
        stablecoins={[accountBalance]}
        onSendPayment={handleSendPayment}
      />
    </div>
  );
};

export default App;