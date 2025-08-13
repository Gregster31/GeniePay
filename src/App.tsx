import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  Calendar, 
  DollarSign,
  Users, 
  Settings, 
  TrendingUp,
  FileText,
  History,
  CreditCard,
  Wallet,
} from 'lucide-react';
import Sidebar from './components/SidebarNavigationComponent';
import Header from './components/HeaderComponent';
import PayrollPage from './components/payroll/PayrollComponent';
import PlaceholderPage from './components/PlaceholderComponent';

// Wallet Connection Component using RainbowKit
const WalletConnection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          GeniePay Crypto Payroll
        </h1>

        <p className="text-gray-600 mb-8">
          Connect your wallet to get started with blockchain payroll management
        </p>

        <div className="mb-8 flex justify-center">
          <ConnectButton />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Supported Features:</p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span>• ETH Payments</span>
            <span>• Team Management</span>
            <span>• Transaction History</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('payroll');

  // Show wallet connection screen if not connected
  if (!isConnected) {
    return <WalletConnection />;
  }

  const getPageContent = () => {
    switch (activeTab) {
      case 'payroll':
        return <PayrollPage />;
      case 'dashboard':
        return (
          <PlaceholderPage
            title="Dashboard"
            description="View your blockchain payroll analytics and overview"
            icon={<TrendingUp className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'action-items':
        return (
          <PlaceholderPage
            title="Action Items"
            description="Manage pending payroll actions and approvals"
            icon={<Calendar className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'team':
        return (
          <PlaceholderPage
            title="Team Management"
            description="Add, edit, and manage your team members and their crypto wallets"
            icon={<Users className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'pay':
        return (
          <PlaceholderPage
            title="Quick Pay"
            description="Send instant crypto payments to employees"
            icon={<DollarSign className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'invoices':
        return (
          <PlaceholderPage
            title="Invoices"
            description="Manage and track blockchain-based invoices"
            icon={<FileText className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'account-history':
        return (
          <PlaceholderPage
            title="Account History"
            description="View all blockchain transactions and payment history"
            icon={<History className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'documents':
        return (
          <PlaceholderPage
            title="Documents"
            description="Store and manage payroll documents on IPFS"
            icon={<FileText className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'deposit':
        return (
          <PlaceholderPage
            title="Deposit Funds"
            description="Add cryptocurrency to your payroll account"
            icon={<CreditCard className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'settings':
        return (
          <PlaceholderPage
            title="Settings"
            description="Configure your blockchain payroll preferences"
            icon={<Settings className="w-8 h-8 text-gray-400" />}
          />
        );
      default:
        return <PayrollPage />;
    }
  };

  const getHeaderActions = () => {
    if (activeTab === 'payroll') {
      return (
        <>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Quick Pay
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Fund Account
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Invite Team
          </button>
        </>
      );
    }
    return null;
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      'action-items': 'Action Items',
      team: 'Team Management',
      pay: 'Quick Pay',
      payroll: 'Payroll',
      invoices: 'Invoices',
      'account-history': 'Account History',
      documents: 'Documents',
      deposit: 'Deposit Funds',
      settings: 'Settings',
    };
    return titles[activeTab] || 'Payroll';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header 
          title={getPageTitle()}
          actions={getHeaderActions()}
          walletAddress={address || ''} onDisconnect={function (): void {
            throw new Error('Function not implemented.');
          } }        />
        {getPageContent()}
      </div>
    </div>
  );
};

export default App;