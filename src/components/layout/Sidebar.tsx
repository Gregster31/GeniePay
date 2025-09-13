import React, { useState } from 'react';
import { 
  Calendar, 
  CreditCard, 
  DollarSign, 
  FileText, 
  LogOut, 
  Settings, 
  TrendingUp, 
  Users, 
  History, 
  RefreshCw,
  Link as LinkIcon,
  Wallet,
  Copy,
  ExternalLink
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalBalance } from '@/contexts/BalanceContext';
import { ConnectionModal } from '@/components/auth/ConnectionModal';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  
  // Auth context
  const { 
    isConnected, 
    connectionType, 
    profile,
    walletAddress,
    session,
    signOut, 
    disconnectWallet 
  } = useAuth();
  
  // Balance context (your existing one)
  const { formattedBalance, isLoading, refetch, lastUpdated } = useGlobalBalance();

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

  const handleConnectionClick = () => {
    if (isConnected) {
      handleDisconnect();
    } else {
      setShowConnectionModal(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (connectionType === 'wallet') {
        disconnectWallet();
      } else {
        await signOut();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleCopyAddress = () => {
    const address = walletAddress || profile?.wallet_address;
    if (address) {
      navigator.clipboard.writeText(address);
      setCopyMessage('Address copied!');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const getConnectionButtonText = () => {
    if (!isConnected) return 'Connect';
    
    switch (connectionType) {
      case 'wallet':
        return 'Disconnect Wallet';
      case 'google':
        return 'Sign Out';
      case 'magic_link':
        return 'Sign Out';
      default:
        return 'Disconnect';
    }
  };

  const getConnectionButtonIcon = () => {
    if (!isConnected) return <LinkIcon className="w-4 h-4" />;
    
    switch (connectionType) {
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      default:
        return <LogOut className="w-4 h-4" />;
    }
  };

  const displayAddress = walletAddress || profile?.wallet_address;
  const displayName = profile?.display_name || profile?.email || 'User';

  return (
    <>
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

        {/* Balance Display - Only show when connected */}
        {isConnected && (
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
        )}

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

        {/* Connection Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleConnectionClick}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isConnected 
                ? 'bg-red-900/50 text-red-300 border border-red-800 hover:bg-red-900/70'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {getConnectionButtonIcon()}
            {getConnectionButtonText()}
          </button>

          {/* Copy Success Message */}
          {copyMessage && (
            <p className="text-xs text-green-400 text-center mt-2 font-medium">
              {copyMessage}
            </p>
          )}
        </div>

        {/* User Account Section - Only shown when connected */}
        {isConnected && (
          <div className="border-t border-gray-800 p-4 bg-gray-800/50">
            {/* User Info */}
            <div className="flex items-start gap-3 mb-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-700 shadow-sm">
                    <span className="text-xs text-white font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {connectionType === 'wallet' && <Wallet className="w-3 h-3 text-blue-400" />}
                  {connectionType === 'google' && <span className="text-xs">🌐</span>}
                  {connectionType === 'magic_link' && <span className="text-xs">✉️</span>}
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {connectionType === 'wallet' ? 'Wallet' : 
                     connectionType === 'google' ? 'Google' : 
                     connectionType === 'magic_link' ? 'Email' : 'Connected'}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-200 truncate text-sm">
                  {displayName}
                </h3>
                
                {profile?.email && connectionType !== 'magic_link' && (
                  <p className="text-xs text-gray-500 truncate">
                    {profile.email}
                  </p>
                )}
              </div>
            </div>

            {/* Wallet Address (if available) */}
            {displayAddress && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-400 mb-1">
                      Wallet Address
                    </p>
                    <p className="text-sm font-mono text-gray-300 truncate">
                      {`${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Copy Button */}
                    <button
                      onClick={handleCopyAddress}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
                      title="Copy address"
                    >
                      <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                    </button>
                    
                    {/* Explorer Link */}
                    <button
                      onClick={() => window.open(`https://etherscan.io/address/${displayAddress}`, '_blank')}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors group"
                      title="View on Etherscan"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Modal */}
      <ConnectionModal 
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />
    </>
  );
};