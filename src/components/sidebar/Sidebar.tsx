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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Check
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

// Sidebar width constants
const SIDEBAR_WIDTH_EXPANDED = '19rem'; // 304px
const SIDEBAR_WIDTH_COLLAPSED = '6rem';  // 96px

// ========================= CHILD COMPONENTS =========================

/** Logo/Brand Header */
const SidebarHeader: React.FC<{ isCollapsed: boolean; isMobile: boolean; onToggle: () => void }> = ({ 
  isCollapsed, 
  isMobile, 
  onToggle 
}) => (
  <div className={`p-6 border-b ${isCollapsed && !isMobile ? 'px-3' : ''}`} style={{ borderColor: '#2a2438' }}>
    <div className="flex items-center justify-between">
      <button 
        onClick={() => window.location.href = '/'}
        className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${isCollapsed && !isMobile ? 'justify-center' : ''}`}
      >
        <img src="/geniepay_logov4.png" alt="GeniePay Logo" className="h-8 w-8 object-contain flex-shrink-0" />
        {(!isCollapsed || isMobile) && (
          <h1 className="text-xl font-bold whitespace-nowrap tracking-wide" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif", letterSpacing: '0.02em' }}>
            GeniePay
          </h1>
        )}
      </button>
      
      {!isMobile && (
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors ml-auto"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}
    </div>
  </div>
);

/** Wallet Balance Display */
const WalletBalance: React.FC<{ 
  balance: string; 
  balanceUSD: string; 
  lastUpdated: Date | null; 
  onRefresh: () => void;
  isCollapsed: boolean;
  isMobile: boolean;
}> = ({ balance, balanceUSD, lastUpdated, onRefresh, isCollapsed, isMobile }) => (
  <div className={`p-4 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
    <div 
      className="rounded-xl p-4 relative overflow-hidden"
      style={{ 
        backgroundColor: 'rgba(26, 27, 34, 0.6)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
      }}
    >
      {(!isCollapsed || isMobile) && (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Wallet Balance</span>
            <button
              onClick={onRefresh}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title="Refresh balance"
            >
              <RefreshCw className="w-3 h-3 text-gray-400" />
            </button>
          </div>
          <div className="mb-1">
            <p className="text-lg font-bold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
              CA${balanceUSD}
            </p>
          </div>
          <p className="text-xs text-gray-500">{balance} ETH</p>
          {lastUpdated && (
            <p className="text-xs text-gray-600 mt-2">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </>
      )}
      {isCollapsed && !isMobile && (
        <div className="flex flex-col items-center">
          <Wallet className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-xs font-bold text-white">{balance.slice(0, 5)}</p>
        </div>
      )}
    </div>
  </div>
);

/** Connected Wallet Display */
const ConnectedWalletDisplay: React.FC<{ 
  address: string; 
  isCollapsed: boolean;
  isMobile: boolean;
}> = ({ address, isCollapsed, isMobile }) => {
  const [copied, setCopied] = useState(false);
  const shortenedAddress = sliceAddress(address);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isCollapsed && !isMobile) {
    return (
      <div className="px-2 mb-2 mt-4">
        <div 
          className="rounded-lg p-2 flex flex-col items-center gap-2"
          style={{ 
            backgroundColor: 'rgba(26, 27, 34, 0.6)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <Wallet className="w-4 h-4 text-purple-400" />
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-white/5 rounded transition-colors"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-2 mt-4">
      <div 
        className="rounded-lg p-3"
        style={{ 
          backgroundColor: 'rgba(26, 27, 34, 0.6)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Connected Wallet</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title={copied ? 'Copied!' : 'Copy address'}
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
            </button>
            <a
              href={`https://etherscan.io/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title="View on Etherscan"
            >
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>
        <p className="text-sm font-mono text-white">{shortenedAddress}</p>
      </div>
    </div>
  );
};

/** Limited Access Banner */
const LimitedAccessBanner: React.FC = () => (
  <div className="px-4 py-3 mx-4 mb-4 rounded-lg" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
    <div className="flex items-start gap-2">
      <Lock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-medium text-orange-500 mb-1">Limited Access</p>
        <p className="text-xs text-gray-400">Connect wallet and sign to unlock all features</p>
      </div>
    </div>
  </div>
);

/** Navigation Button */
const NavButton: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  isDisabled: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  onClick: () => void;
}> = ({ item, isActive, isDisabled, isCollapsed, isMobile, onClick }) => {
  const Icon = item.icon;
  
  const baseClasses = `
    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
    ${isCollapsed && !isMobile ? 'justify-center px-3' : ''}
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const activeClasses = isActive
    ? 'text-white font-semibold' // Brighter white and semibold for active
    : 'text-gray-400 hover:text-white hover:bg-white/5';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${activeClasses} w-full text-left relative`}
      title={isCollapsed && !isMobile ? item.label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {(!isCollapsed || isMobile) && (
        <>
          <span className="flex-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
            {item.label}
          </span>
          {item.badge && (
            <span 
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.badgeColor || 'bg-purple-600'} text-white`}
            >
              {item.badge}
            </span>
          )}
          {isDisabled && <Lock className="w-4 h-4 text-gray-500" />}
        </>
      )}
    </button>
  );
};

/** Connection Button */
const ConnectionButton: React.FC<{ 
  hasFullAccess: boolean; 
  isCollapsed: boolean; 
  isMobile: boolean; 
  onLogout: () => void;
}> = ({ hasFullAccess, isCollapsed, isMobile, onLogout }) => {
  const buttonClasses = `
    w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
    ${isCollapsed && !isMobile ? 'justify-center px-3 py-3' : 'justify-center px-4 py-3'}
  `;

  const fontStyle = { fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' };

  if (hasFullAccess) {
    return (
      <button
        onClick={onLogout}
        className={`${buttonClasses} bg-red-800 hover:bg-red-700 text-white`}
        style={fontStyle}
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
          className={`${buttonClasses} text-white`}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            ...fontStyle
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
          }}
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

  // Update CSS custom property when collapse state changes
  useEffect(() => {
    const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [isCollapsed]);

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
    const isProtected = !['/dashboard', '/'].includes(path);
    if (isProtected && !hasFullAccess) {
      return;
    }
    navigate(path);
    if (isMobile) setIsMobileOpen(false);
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/';
    // Exact match or match with trailing slash to prevent /pay from matching /payroll
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const currentBalance = balance 
    ? parseFloat(formatEther(balance.value)).toFixed(4)
    : '0.0000';
  
  const currentBalanceUSD = (parseFloat(currentBalance) * 3000).toFixed(2);

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden"
          style={{ backgroundColor: '#1A1B22', border: '1px solid #2a2438' }}
        >
          {isMobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          sidebar
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'fixed left-0 top-0 h-screen'}
          transition-all duration-300 ease-in-out
          ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{
          backgroundColor: '#1A1B22',
          width: isMobile ? SIDEBAR_WIDTH_EXPANDED : isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
          margin: isMobile ? '0' : '1rem',
          height: isMobile ? '100vh' : 'calc(100vh - 2rem)',
          borderRadius: isMobile ? '0' : '1.5rem',
          border: '1px solid #2a2438',
        }}
      >
        <div className="h-full flex flex-col text-white overflow-hidden">
          <SidebarHeader isCollapsed={isCollapsed} isMobile={isMobile} onToggle={() => setIsCollapsed(!isCollapsed)} />
          
          {hasFullAccess && address && (
            <ConnectedWalletDisplay address={address} isCollapsed={isCollapsed} isMobile={isMobile} />
          )}
          
          {hasFullAccess && (
            <WalletBalance 
              balance={currentBalance}
              balanceUSD={currentBalanceUSD}
              lastUpdated={lastUpdated}
              onRefresh={handleRefreshBalance}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
          )}

          <nav className={`flex-1 py-4 overflow-y-auto ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
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
          
          <div className={`p-4 ${isCollapsed && !isMobile ? 'px-2' : ''}`} style={{ borderTop: '1px solid #2a2438' }}>
            <ConnectionButton 
              hasFullAccess={hasFullAccess} 
              isCollapsed={isCollapsed} 
              isMobile={isMobile} 
              onLogout={logout} 
            />
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};