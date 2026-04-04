import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Send, Users, FileText, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'pay',       label: 'Quick Pay', path: '/pay',       icon: Send            },
  { id: 'payroll',   label: 'Payroll',   path: '/payroll',   icon: Users           },
  { id: 'documents', label: 'Documents', path: '/documents', icon: FileText        },
  { id: 'transactions',   label: 'Transactions',   path: '/transactions',   icon: ArrowRightLeft         },
];

interface SidebarProps {
  onNavigate?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, isMobile }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div
      className={`sidebar-panel flex flex-col h-full overflow-hidden flex-shrink-0 rounded-2xl
        border dark:border-white/[0.09] border-black/[0.09]
        dark:bg-[linear-gradient(180deg,rgba(22,20,31,0.97),rgba(16,14,24,0.95))]
        bg-[linear-gradient(180deg,rgba(248,245,240,0.97),rgba(238,234,227,0.95))]
        ${isMobile ? 'w-full rounded-2xl' : collapsed ? 'w-16' : 'w-[220px]'}`}
    >
      <nav className="flex-1 flex flex-col gap-0.5 p-2.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ id, label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={id}
              onClick={() => { navigate(path); onNavigate?.(); }}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-[13px] font-bold tracking-[0.06em] uppercase text-left whitespace-nowrap overflow-hidden transition-all duration-150
                ${active
                  ? 'bg-[#5D00F2] border-transparent text-white shadow-[0_4px_14px_rgba(93,0,242,0.45)]'
                  : 'bg-transparent border-transparent text-gray-500 dark:hover:bg-white/[0.06] dark:hover:text-white hover:bg-black/[0.05] hover:text-gray-900'
                }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      {!isMobile && (
        <button
          onClick={() => setCollapsed(p => !p)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center w-full h-12 shrink-0 border-t text-gray-500 transition-all duration-150
            dark:border-white/[0.07] border-black/[0.09]
            dark:hover:bg-white/[0.04] dark:hover:text-white
            hover:bg-black/[0.04] hover:text-gray-900"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}
    </div>
  );
};