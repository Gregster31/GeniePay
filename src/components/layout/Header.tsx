import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        {/* Right side can be used for page-specific actions */}
        <div className="flex items-center gap-4">
          {/* Future: Add page-specific action buttons here */}
        </div>
      </div>
    </header>
  );
};