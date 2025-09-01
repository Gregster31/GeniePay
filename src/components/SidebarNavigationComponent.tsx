// components/SidebarNavigationComponent.tsx
import React from 'react';
import { Calendar, CreditCard, DollarSign, FileText, LogOut, Settings, TrendingUp, Users, History, RefreshCw } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import { useGlobalBalance } from '../contexts/BalanceContext';

const Sidebar: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Use global balance context instead of local hook
  const { formattedBalance, isLoading, refetch, lastUpdated } = useGlobalBalance();

  const handleDisconnect = () => {
    disconnect();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'pay', label: 'Pay', icon: DollarSign, badge: 'New', badgeColor: 'bg-orange-500' },
    { id: 'payroll', label: 'Payroll', icon: Calendar },
    { id: 'account-history', label: 'Account History', icon: History },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'deposit', label: 'Deposit', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="/geniepay_logov2.png" 
            alt="GeniePay Logo" 
            className="w-8 h-8 object-contain" 
          />
          <span className="text-xl font-bold">GeniePay</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">Online Crypto Payroll</div>
      </div>

      {/* Balance Display */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 mb-1">Wallet Balance</div>
            <div className="text-lg font-semibold">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <span>{formattedBalance} ETH</span>
              )}
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-500 mt-1">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh balance"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-gray-700'
                    } text-white`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xs">👤</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;