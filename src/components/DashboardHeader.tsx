import React from 'react';
import { Wallet } from 'lucide-react';

interface DashboardHeaderProps {
  walletAddress: string;
  isConnected: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  walletAddress, 
  isConnected 
}) => {
  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar-placeholder w-10 h-10">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Crypto Payroll
              </h1>
              <p className="text-sm text-gray-500">
                {truncateAddress(walletAddress)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && (
              <div className="status-connected">
                <div className="status-dot"></div>
                <span className="text-sm font-medium text-green-700">
                  Connected
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;