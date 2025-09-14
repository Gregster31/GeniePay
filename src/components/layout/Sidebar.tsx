import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  Calendar, 
  History, 
  FileText,
  CreditCard,
  Settings,
  Copy,
  ExternalLink,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { ConnectionModal } from '@/components/auth/ConnectionModal';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  badgeColor?: string;
}

const navigationItems: NavigationItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard' 
  },
  { 
    id: 'team', 
    label: 'Team', 
    icon: Users, 
    path: '/team' 
  },
  { 
    id: 'pay', 
    label: 'Quick Pay', 
    icon: Zap, 
    path: '/pay' 
  },
  { 
    id: 'payroll', 
    label: 'Payroll', 
    icon: Calendar, 
    path: '/payroll' 
  },
  { 
    id: 'account-history', 
    label: 'History', 
    icon: History, 
    path: '/account-history' 
  },
  { 
    id: 'documents', 
    label: 'Documents', 
    icon: FileText, 
    path: '/documents',
    badge: 'Soon',
    badgeColor: 'bg-yellow-600'
  },
  { 
    id: 'deposit', 
    label: 'Deposit', 
    icon: CreditCard, 
    path: '/deposit',
    badge: 'Soon',
    badgeColor: 'bg-yellow-600'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/settings',
    badge: 'Soon',
    badgeColor: 'bg-yellow-600'
  },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Wallet connection
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({
    address: address,
  });

  // Auth hook for user profile
  const { 
    profile, 
    connectionType, 
    isAuthenticated, 
    displayName, 
    displayAddress,
    logout 
  } = useAuth();

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Check if current path matches navigation item
  const isActiveRoute = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path;
  };

  // Handle connection click
  const handleConnectionClick = () => {
    if (isAuthenticated || isConnected) {
      logout();
    } else {
      setShowConnectionModal(true);
    }
  };

  // Handle copy address
  const handleCopyAddress = async () => {
    if (displayAddress) {
      try {
        await navigator.clipboard.writeText(displayAddress);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  // Update last updated time when balance changes
  useEffect(() => {
    if (balance) {
      setLastUpdated(new Date());
    }
  }, [balance]);

  // Format balance for display
  const formattedBalance = balance ? 
    parseFloat(formatEther(balance.value)).toFixed(4) : 
    '0.0000';

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GP</span>
            </div>
            <h1 className="text-xl font-bold">GeniePay</h1>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-800">
          {(isAuthenticated || isConnected) && (
            <div className="space-y-3">
              {/* Profile Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      connectionType === 'wallet' ? 'bg-green-600' : 
                      connectionType === 'google' ? 'bg-blue-600' : 'bg-purple-600'
                    } text-white`}>
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

              {/* Balance Display (for wallet connections) */}
              {isConnected && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-400 mb-1">Balance</p>
                      <div className="text-sm font-mono text-gray-200">
                        {balance === undefined ? (
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
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
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
              isAuthenticated || isConnected 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {isAuthenticated || isConnected ? 'Disconnect' : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* Connection Modal */}
      <ConnectionModal 
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />
    </>
  );
};