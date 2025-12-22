import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Zap, Calendar, History, FileText, CreditCard, Settings, Copy, ExternalLink, RefreshCw, Wallet, Lock, AlertCircle} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { sliceAddress } from '@/utils/WalletAddressSlicer'

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
    path: '/'
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({
    address: address,
  });

  const handleRefreshBalance = async () => {
    await refetch();
    setLastUpdated(new Date());
  };
  
  const { isAuthenticated, logout } = useAuth();
    const hasFullAccess = isConnected && isAuthenticated;
  
  const handleNavigation = (path: string) => {
    const isProtected = !['/'].includes(path);
    
    if (isProtected && !hasFullAccess) {
      alert('Please connect your wallet and sign the message to access this feature.');
      return;
    }
    
    navigate(path);
  };
  
  const isActiveRoute = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname === path;
  };
  
  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };
  
  useEffect(() => {
    if (balance && !lastUpdated) {
      setLastUpdated(new Date());
    }
  }, [balance, lastUpdated]);
  
  const formattedBalance = balance ? 
    parseFloat(formatEther(balance.value)).toFixed(4) : 
    '0.0000';
  
  return (
    <>
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-800">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/geniepay_logov4.png" 
              alt="GeniePay Logo" 
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-xl font-bold">GeniePay</h1>
          </button>
        </div>

        {/* Wallet Info Section */}
        <div className="p-4 border-b border-gray-800">
          {hasFullAccess ? (
            <div className="space-y-3">
              {/* Wallet Address */}
              {address && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-400 mb-1">
                        Wallet Address
                      </p>
                      <p className="text-sm font-mono text-gray-300 truncate">
                        {sliceAddress(address)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={handleCopyAddress}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                      </button>
                      
                      <button
                        onClick={() => {
                          window.open(`https://etherscan.io/address/${address}`, '_blank');
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                        title="View on Etherscan"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Balance Display */}
              {isConnected && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-400 mb-1">Balance</p>
                      <div className="text-sm font-mono text-gray-200">
                        {balance === undefined ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Loading...</span>
                          </div>
                        ) : (
                          <span>{formattedBalance} ETH</span>
                        )}
                      </div>
                      {lastUpdated && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated {lastUpdated.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleRefreshBalance}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                      title="Refresh balance"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Show wallet connection prompt when not fully authenticated
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <Wallet className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">Connect Wallet</p>
                <p className="text-xs text-gray-500">
                  Connect to access all features
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            // Dashboard is always accessible, others require full auth
            const isProtected = !['/dashboard', '/'].includes(item.path);
            const isDisabled = isProtected && !hasFullAccess;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group relative
                  ${isActive ? 'bg-blue-600 text-white' : 
                    isDisabled ? 'text-gray-500 cursor-not-allowed' : 
                    'text-gray-300 hover:bg-gray-800 hover:text-white'}
                `}
                title={isDisabled ? 'Connect wallet and sign message to access this feature' : undefined}
              >
                <item.icon className={`w-5 h-5 ${
                  isActive ? 'text-white' : 
                  isDisabled ? 'text-gray-600' : 
                  'text-gray-400 group-hover:text-white'
                }`} />
                
                <span className="font-medium">{item.label}</span>
                
                {/* Lock icon for disabled protected routes */}
                {isDisabled && (
                  <Lock className="w-4 h-4 text-gray-600 ml-auto" />
                )}
                
                {/* Badge for soon-to-come features */}
                {item.badge && !isDisabled && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.badgeColor || 'bg-gray-600'
                  } text-white`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        {/* Wallet Connection Status */}
        {!hasFullAccess && (
          <div className="p-4 border-t border-gray-800">
            <div className="bg-orange-600/20 border border-orange-600/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-orange-300">
                    Limited Access
                  </p>
                  <p className="text-xs text-orange-400 mt-1">
                    Connect your wallet to unlock all GeniePay features
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Connection/Logout Button */}
        <div className="p-4 border-t border-gray-800">
          {hasFullAccess ? (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
            >
              <Wallet className="w-4 h-4" />
              Disconnect
            </button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </div>
    </>
  );
};