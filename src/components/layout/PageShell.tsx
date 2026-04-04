import React from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

export const PageShell: React.FC<PageShellProps> = ({ title, subtitle, children, actions, maxWidth = '1400px' }) => (
  <div className="p-6 w-full">
    <div style={{ maxWidth }} className="mx-auto">
      {(title || actions) && (
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] mb-1 dark:text-white text-gray-900">{title}</h1>
            {subtitle && <p className="text-[14px] dark:text-gray-400 text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  </div>
);