import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign,
  Users, 
  Settings, 
  TrendingUp,
  FileText,
  History,
  CreditCard,
} from 'lucide-react';
import Sidebar from './SidebarNavigationComponent';
import Header from './HeaderComponent';
import DashboardPage from './dashboard/DashboardComponent';
import TeamManagementPage from './team/TeamComponent';
import PlaceholderPage from './PlaceholderComponent';

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const getPageContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'action-items':
        return (
          <PlaceholderPage
            title="Action Items"
            description="Manage pending payroll actions and approvals"
            icon={<Calendar className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'team':
        return <TeamManagementPage />; // Use the new team management page
      case 'pay':
        return (
          <PlaceholderPage
            title="Quick Pay"
            description="Send instant crypto payments to employees"
            icon={<DollarSign className="w-8 h-8 text-gray-400" />}
          />
        );
      case 'payroll':
        return (
          <PlaceholderPage
            title="Payroll"
            description="View your blockchain payroll"
            icon={<TrendingUp className="w-8 h-8 text-gray-400" />}
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header title={getPageTitle()} />
        {getPageContent()}
      </div>
    </div>
  );
};