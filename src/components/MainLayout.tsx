import React, { useState } from 'react';
import { 
  Settings, 
  TrendingUp,
  FileText,
  CreditCard,
} from 'lucide-react';
import Sidebar from './SidebarNavigationComponent';
import Header from './HeaderComponent';
import DashboardPage from './dashboard/DashboardComponent';
import TeamManagementPage from './team/TeamComponent';
import PlaceholderPage from './PlaceholderComponent';
import PayPage from './pay/PayComponent';
import AccountHistoryPage from './accountHistory/AccountHistoryPage';

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const getPageContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'team':
        return <TeamManagementPage />; 
      case 'pay':
        return <PayPage />; 
      case 'payroll':
        return (
          <PlaceholderPage
            title="Payroll"
            description="View your blockchain payroll"
            icon={<TrendingUp className="w-8 h-8 text-gray-400" />}
          />
        );  
      case 'account-history':
        return <AccountHistoryPage/>
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
        return <DashboardPage />;
    }
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
    return titles[activeTab] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-64">
        <Header title={getPageTitle()} />
        <main className="min-h-screen">
          {getPageContent()}
        </main>
      </div>
    </div>
  );
};