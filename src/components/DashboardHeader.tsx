/**
 * DashboardHeader Component
 * --------------------------
 * Displays the top navigation for the dashboard, including:
 * - App name and user wallet address
 * - Wallet connection status
 * - Option to disconnect the wallet
 *
 * Props:
 * - walletAddress: string — the connected wallet address to display (truncated)
 * - isConnected: boolean — whether the wallet is currently connected
 * - onDisconnect: () => void — callback function to disconnect the wallet
 */

import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { truncateAddress } from '../utils/EmployeeListProps';
import type { DashboardHeaderProps } from '../utils/DashboardHeaderProps';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  walletAddress, 
  isConnected,
  onDisconnect,
}) => {

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
              <>
                <div className="status-connected">
                  <div className="status-dot"></div>
                  <span className="text-sm font-medium text-green-700">
                    Connected
                  </span>
                </div>
                {/* Add a disconnect button */}
                <button
                  onClick={onDisconnect}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors text-sm font-medium"
                  title="Disconnect Wallet"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
