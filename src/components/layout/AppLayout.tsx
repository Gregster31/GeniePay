//TODO CHANGE TO ROUTE BASED PAGES

import React, { useState } from 'react';
import { 
  Settings, 
  FileText,
  CreditCard,
} from 'lucide-react';
import { Sidebar } from '@/components/layout';
import { Header } from '@/components/layout';
import Dashboard from '@/pages/Dashboard';
import Team from '@/pages/Team';
import Pay from '@/pages/Pay';
import Payroll from '@/pages/Payroll';
import AccountHistory from '@/pages/AccountHistory';
import PlaceholderPage from '@/components/shared/PlaceholderComponent';


export const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const getPageContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'team':
        return <Team />; 
      case 'pay':
        return <Pay />; 
      case 'payroll':
        return <Payroll />
      case 'account-history':
        return <AccountHistory/>
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
        return <Dashboard />;
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