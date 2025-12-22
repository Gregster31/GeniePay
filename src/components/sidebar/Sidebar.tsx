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
  Wallet, 
  Lock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { sliceAddress } from '@/utils/WalletAddressSlicer';

// ========================= TYPES & CONSTANTS =========================

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  badgeColor?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'team', label: 'Team', icon: Users, path: '/team' },
  { id: 'pay', label: 'Quick Pay', icon: Zap, path: '/pay' },
  { id: 'payroll', label: 'Payroll', icon: Calendar, path: '/payroll' },
  { id: 'account-history', label: 'History', icon: History, path: '/account-history' },
  { id: 'documents', label: 'Documents', icon: FileText, path: '/documents', badge: 'Soon', badgeColor: 'bg-yellow-600' },
  { id: 'deposit', label: 'Deposit', icon: CreditCard, path: '/deposit', badge: 'Soon', badgeColor: 'bg-yellow-600' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', badge: 'Soon', badgeColor: 'bg-yellow-600' },
];

// ========================= CHILD COMPONENTS =========================

/** Logo/Brand Header */
const SidebarHeader: React.FC<{ isCollapsed: boolean; isMobile: boolean; onToggle: () => void }> = ({ 
  isCollapsed, 
  isMobile, 
  onToggle 
}) => (
  <div className={`p-6 border-b border-gray-800 ${isCollapsed && !isMobile ? 'px-3' : ''}`}>
    <div className="flex items-center justify-between">
      <button 
        onClick={() => window.location.href = '/'}
        className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
      >
        <img src="/geniepay_logov4.png" alt="GeniePay Logo" className="h-8 w-8 object-contain flex-shrink-0" />
        {(!isCollapsed || isMobile) && <h1 className="text-xl font-bold whitespace-nowrap">GeniePay</h1>}
      </button>
      
      {!isMobile && (
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors ml-auto"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5 text-gray-400" /> : <ChevronLeft className="w-5 h-5 text-gray-400" />}
        </button>
      )}
    </div>
  </div>
);

/** Wallet Address Display Card */
const WalletAddressCard: React.FC<{ address: string; isCollapsed: boolean; isMobile: boolean }> = ({ 
  address, 
  isCollapsed, 
  isMobile 
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (isCollapsed && !isMobile) {
    return (
      <div className="flex justify-center">
        <div className="relative group">
          <Wallet className="w-6 h-6 text-gray-400" />
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-950 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-xl hidden group-hover:block">
            {sliceAddress(address)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 mb-1">Wallet Address</p>
        <p className="text-sm font-mono text-gray-300 truncate">{sliceAddress(address)}</p>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={handleCopy} className="p-2 hover:bg-gray-700 rounded-lg transition-colors group" title="Copy address">
          <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
        </button>
        <button
          onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
          title="View on Etherscan"
        >
          <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

/** Balance Display Card */
const BalanceCard: React.FC<{ 
  balance: any; 
  lastUpdated: Date | null; 
  isCollapsed: boolean; 
  isMobile: boolean; 
  onRefresh: () => void 
}> = ({ balance, lastUpdated, isCollapsed, isMobile, onRefresh }) => {
  const formattedBalance = balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000';

  if (isCollapsed && !isMobile) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative group">
          <p className="text-xs font-mono text-gray-200 text-center">{formattedBalance.split('.')[0]}</p>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-950 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-xl hidden group-hover:block">
            {formattedBalance} ETH
          </div>
        </div>
        <button onClick={onRefresh} className="p-1 hover:bg-gray-700 rounded transition-colors" title="Refresh balance">
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
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
          <p className="text-xs text-gray-500 mt-1">Updated {lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>
      <button onClick={onRefresh} className="p-2 hover:bg-gray-700 rounded-lg transition-colors group" title="Refresh balance">
        <RefreshCw className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
      </button>
    </div>
  );
};

/** Wallet Info Section - Authenticated */
const WalletInfoSection: React.FC<{ 
  hasFullAccess: boolean; 
  address: string | undefined; 
  isConnected: boolean;
  balance: any;
  lastUpdated: Date | null;
  isCollapsed: boolean;
  isMobile: boolean;
  onRefreshBalance: () => void;
}> = ({ hasFullAccess, address, isConnected, balance, lastUpdated, isCollapsed, isMobile, onRefreshBalance }) => {
  if (!hasFullAccess) {
    return (
      <div className={`text-center ${isCollapsed && !isMobile ? 'space-y-2' : 'space-y-3'}`}>
        <div className={`bg-gray-800 rounded-full flex items-center justify-center mx-auto ${isCollapsed && !isMobile ? 'w-10 h-10' : 'w-12 h-12'}`}>
          <Wallet className={`text-gray-400 ${isCollapsed && !isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
        </div>
        {(!isCollapsed || isMobile) && (
          <div>
            <p className="text-sm font-medium text-gray-300">Connect Wallet</p>
            <p className="text-xs text-gray-500">Connect to access all features</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {address && (
        <div className={`bg-gray-800 rounded-lg ${isCollapsed && !isMobile ? 'p-2' : 'p-3'}`}>
          <WalletAddressCard address={address} isCollapsed={isCollapsed} isMobile={isMobile} />
        </div>
      )}
      
      {isConnected && (
        <div className={`bg-gray-800 rounded-lg ${isCollapsed && !isMobile ? 'p-2' : 'p-3'}`}>
          <BalanceCard 
            balance={balance} 
            lastUpdated={lastUpdated} 
            isCollapsed={isCollapsed} 
            isMobile={isMobile} 
            onRefresh={onRefreshBalance} 
          />
        </div>
      )}
    </div>
  );
};

/** Navigation Item Button */
const NavButton: React.FC<{ 
  item: NavigationItem; 
  isActive: boolean; 
  isDisabled: boolean; 
  isCollapsed: boolean; 
  isMobile: boolean; 
  onClick: () => void 
}> = ({ item, isActive, isDisabled, isCollapsed, isMobile, onClick }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full flex items-center gap-3 rounded-lg text-left transition-all duration-200 relative
        ${isCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
        ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 
          isDisabled ? 'text-gray-500 cursor-not-allowed' : 
          'text-gray-300 hover:bg-gray-800 hover:text-white'}
      `}
      title={isDisabled ? 'Connect wallet and sign message to access this feature' : undefined}
    >
      <item.icon className={`flex-shrink-0 ${isCollapsed && !isMobile ? 'w-6 h-6' : 'w-5 h-5'} ${
        isActive ? 'text-white' : isDisabled ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'
      }`} />
      
      {(!isCollapsed || isMobile) && (
        <>
          <span className="font-medium flex-1">{item.label}</span>
          {isDisabled && <Lock className="w-4 h-4 text-gray-600 ml-auto flex-shrink-0" />}
          {item.badge && !isDisabled && (
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${item.badgeColor || 'bg-gray-600'} text-white`}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </button>
    
    {/* Tooltip for collapsed state */}
    {isCollapsed && !isMobile && (
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-950 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] shadow-xl hidden group-hover:block">
        {item.label}
        {item.badge && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-gray-600'}`}>{item.badge}</span>}
      </div>
    )}
  </div>
);

/** Limited Access Warning Banner */
const LimitedAccessBanner: React.FC = () => (
  <div className="p-4 border-t border-gray-800">
    <div className="bg-orange-600/20 border border-orange-600/30 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-orange-300">Limited Access</p>
          <p className="text-xs text-orange-400 mt-1">Connect your wallet to unlock all GeniePay features</p>
        </div>
      </div>
    </div>
  </div>
);

/** Connection/Disconnect Button */
const ConnectionButton: React.FC<{ 
  hasFullAccess: boolean; 
  isCollapsed: boolean; 
  isMobile: boolean; 
  onLogout: () => void 
}> = ({ hasFullAccess, isCollapsed, isMobile, onLogout }) => {
  const buttonClasses = `w-full flex items-center gap-2 rounded-lg font-medium transition-all duration-200 ${
    isCollapsed && !isMobile ? 'justify-center px-3 py-3' : 'justify-center px-4 py-3'
  }`;

  if (hasFullAccess) {
    return (
      <button
        onClick={onLogout}
        className={`${buttonClasses} bg-red-600 hover:bg-red-700 text-white`}
        title={isCollapsed && !isMobile ? 'Disconnect' : undefined}
      >
        <Wallet className="w-4 h-4 flex-shrink-0" />
        {(!isCollapsed || isMobile) && <span>Disconnect</span>}
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <button
          onClick={openConnectModal}
          className={`${buttonClasses} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white`}
          title={isCollapsed && !isMobile ? 'Connect Wallet' : undefined}
        >
          <Wallet className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span>Connect Wallet</span>}
        </button>
      )}
    </ConnectButton.Custom>
  );
};

// ========================= MAIN SIDEBAR COMPONENT =========================

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { data: balance, refetch } = useBalance({ address });
  const { isAuthenticated, logout } = useAuth();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const hasFullAccess = isConnected && isAuthenticated;

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent horizontal overflow on desktop
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflowX = 'hidden';
      return () => { document.body.style.overflowX = ''; };
    }
  }, [isMobile]);

  // Set initial balance timestamp
  useEffect(() => {
    if (balance && !lastUpdated) setLastUpdated(new Date());
  }, [balance, lastUpdated]);

  const handleRefreshBalance = async () => {
    await refetch();
    setLastUpdated(new Date());
  };
  
  const handleNavigation = (path: string) => {
    const isProtected = !['/'].includes(path);
    
    if (isProtected && !hasFullAccess) {
      alert('Please connect your wallet and sign the message to access this feature.');
      return;
    }
    
    navigate(path);
    if (isMobile) setIsMobileOpen(false);
  };
  
  const isActiveRoute = (path: string) => path === '/' ? location.pathname === '/' : location.pathname === path;

  return (
    <>
      {/* Mobile Hamburger Menu */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Mobile Backdrop */}
      {isMobile && isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          fixed bg-gray-900 text-white flex flex-col shadow-2xl z-40 transition-all duration-300 ease-in-out
          ${isMobile ? 
            `left-0 top-0 h-full w-72 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}` :
            `left-4 top-4 bottom-4 h-[calc(100vh-2rem)] rounded-2xl ${isCollapsed ? 'w-20' : 'w-72'}`
          }
        `}
      >
        <SidebarHeader isCollapsed={isCollapsed} isMobile={isMobile} onToggle={() => setIsCollapsed(!isCollapsed)} />

        <div className={`p-4 border-b border-gray-800 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
          <WalletInfoSection
            hasFullAccess={hasFullAccess}
            address={address}
            isConnected={isConnected}
            balance={balance}
            lastUpdated={lastUpdated}
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            onRefreshBalance={handleRefreshBalance}
          />
        </div>
        
        {/* Navigation Menu */}
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.path);
            const isProtected = !['/dashboard', '/'].includes(item.path);
            const isDisabled = isProtected && !hasFullAccess;
            
            return (
              <NavButton
                key={item.id}
                item={item}
                isActive={isActive}
                isDisabled={isDisabled}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                onClick={() => handleNavigation(item.path)}
              />
            );
          })}
        </nav>
        
        {!hasFullAccess && (!isCollapsed || isMobile) && <LimitedAccessBanner />}
        
        <div className={`p-4 border-t border-gray-800 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
          <ConnectionButton 
            hasFullAccess={hasFullAccess} 
            isCollapsed={isCollapsed} 
            isMobile={isMobile} 
            onLogout={logout} 
          />
        </div>
      </div>
    </>
  );
};