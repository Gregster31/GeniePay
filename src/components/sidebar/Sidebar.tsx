import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  LayoutDashboard,
  Send,
  Users,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Copy,
  Check,
  ExternalLink,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

const SIDEBAR_WIDTH_EXPANDED  = '240px';
const SIDEBAR_WIDTH_COLLAPSED = '72px';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard',  icon: LayoutDashboard },
  { id: 'pay',       label: 'Quick Pay', path: '/pay',        icon: Send },
  { id: 'payroll',   label: 'Payroll',   path: '/payroll',    icon: Users },
  { id: 'documents', label: 'Documents', path: '/documents',   icon: FileText },
  { id: 'history',   label: 'History',   path: '/history',    icon: History },
];

const SidebarHeader: React.FC<{
  isCollapsed: boolean;
  isMobile: boolean;
  onToggle: () => void;
}> = ({ isCollapsed, isMobile, onToggle }) => (
  <div
    className="flex items-center justify-between p-4"
    style={{ borderBottom: '1px solid #2a2438' }}
  >
    {(!isCollapsed || isMobile) && (
      <div className="flex items-center gap-3">
        <img src="/geniepay_logov4.png" alt="GeniePay" className="w-8 h-8 object-contain" />
        <span className="text-white font-bold text-lg" style={{ letterSpacing: '-0.02em' }}>
          GeniePay
        </span>
      </div>
    )}
    {!isMobile && (
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    )}
  </div>
);

const ConnectedWalletDisplay: React.FC<{
  address: string;
  isCollapsed: boolean;
  isMobile: boolean;
}> = ({ address, isCollapsed, isMobile }) => {
  const { copy, copiedValue: copied } = useCopyToClipboard();
  const shortened = sliceAddress(address);

  if (isCollapsed && !isMobile) {
    return (
      <div className="px-2 mb-2 mt-4">
        <div
          className="rounded-lg p-2 flex flex-col items-center gap-2"
          style={{ backgroundColor: 'rgba(26,27,34,0.6)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <Wallet className="w-4 h-4 text-purple-400" />
          <button
            onClick={() => copy(address)}
            className="p-1 hover:bg-white/5 rounded transition-colors"
            title={copied ? 'Copied!' : 'Copy address'}
          >
            {copied
              ? <Check className="w-3 h-3 text-green-400" />
              : <Copy className="w-3 h-3 text-gray-400" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-2 mt-4">
      <div
        className="rounded-lg p-3"
        style={{ backgroundColor: 'rgba(26,27,34,0.6)', border: '1px solid rgba(124,58,237,0.2)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Connected Wallet</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => copy(address)}
              className="p-1 hover:bg-white/5 rounded transition-colors"
              title={copied ? 'Copied!' : 'Copy address'}
            >
              {copied
                ? <Check className="w-3 h-3 text-green-400" />
                : <Copy className="w-3 h-3 text-gray-400" />}
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
        <p className="text-sm font-mono text-white">{shortened}</p>
      </div>
    </div>
  );
};

const NavButton: React.FC<{
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  onClick: () => void;
}> = ({ item, isActive, isCollapsed, isMobile, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left
        ${isCollapsed && !isMobile ? 'justify-center px-3' : ''}
        ${isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}
      `}
      title={isCollapsed && !isMobile ? item.label : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute left-0 w-1 h-6 rounded-r-full"
          style={{ background: 'linear-gradient(180deg, #7c3aed, #a855f7)' }}
        />
      )}
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
      {(!isCollapsed || isMobile) && (
        <span className="text-sm">{item.label}</span>
      )}
    </button>
  );
};

const ConnectionButton: React.FC<{
  isConnected: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  onLogout: () => void;
}> = ({ isConnected, isCollapsed, isMobile, onLogout }) => {
  if (isConnected) {
    return (
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        title={isCollapsed && !isMobile ? 'Disconnect' : undefined}
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        {(!isCollapsed || isMobile) && <span className="text-sm">Disconnect</span>}
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        <button
          onClick={openConnectModal}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-purple-400 hover:text-purple-300 hover:bg-purple-500/5 transition-all duration-200"
          title={isCollapsed && !isMobile ? 'Connect Wallet' : undefined}
        >
          <Wallet className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span>Connect Wallet</span>}
        </button>
      )}
    </ConnectButton.Custom>
  );
};

export const Sidebar: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { address, isConnected } = useAccount();
  const { logout } = useAuth();

  const [isCollapsed,   setIsCollapsed]   = useState(false);
  const [isMobileOpen,  setIsMobileOpen]  = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setIsMobileOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    );
  }, [isCollapsed]);

  const isActiveRoute = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden"
          style={{ backgroundColor: '#1A1B22', border: '1px solid #2a2438' }}
        >
          {isMobileOpen
            ? <X    className="w-6 h-6 text-white" />
            : <Menu className="w-6 h-6 text-white" />}
        </button>
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          sidebar
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'fixed left-0 top-0 h-screen'}
          transition-all duration-300 ease-in-out
          ${isMobile && !isMobileOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{
          backgroundColor: '#1A1B22',
          width:  isMobile ? SIDEBAR_WIDTH_EXPANDED : isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
          margin: isMobile ? '0' : '1rem',
          height: isMobile ? '100vh' : 'calc(100vh - 2rem)',
          borderRadius: isMobile ? '0' : '1.5rem',
          border: '1px solid #2a2438',
        }}
      >
        <div className="h-full flex flex-col text-white overflow-hidden">
          <SidebarHeader
            isCollapsed={isCollapsed}
            isMobile={isMobile}
            onToggle={() => setIsCollapsed(!isCollapsed)}
          />

          {/* Wallet address display */}
          {isConnected && address && (
            <ConnectedWalletDisplay
              address={address}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
            />
          )}

          {/* Navigation */}
          <nav className={`flex-1 py-4 overflow-y-auto relative ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
            {navigationItems.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={isActiveRoute(item.path)}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                onClick={() => handleNavigation(item.path)}
              />
            ))}
          </nav>

          {/* Footer */}
          <div
            className={`p-4 ${isCollapsed && !isMobile ? 'px-2' : ''}`}
            style={{ borderTop: '1px solid #2a2438' }}
          >
            <ConnectionButton
              isConnected={isConnected}
              isCollapsed={isCollapsed}
              isMobile={isMobile}
              onLogout={logout}
            />
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};