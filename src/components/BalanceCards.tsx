/**
 * BalanceCards Component
 * ----------------------
 * Displays the account balance for the connected wallet.
 * Shows ETH balance with loading states and refresh functionality.
 *
 * Props:
 * - accountBalance: Object containing:
 *    - symbol: string — the currency symbol (ETH)
 *    - balance: string — the user's current balance
 *    - icon: string — visual icon representing the currency
 *    - loading: boolean — whether the balance is currently being fetched
 *    - error?: string — error message if balance fetch failed
 * - onRefresh: function — callback to refresh the balance
 */

import React from 'react';

interface AccountBalance {
  symbol: string;
  balance: string;
  icon: string;
  loading: boolean;
  error?: string;
}

interface BalanceCardsProps {
  accountBalance: AccountBalance;
  onRefresh: () => void;
}

const BalanceCards: React.FC<BalanceCardsProps> = ({ accountBalance, onRefresh }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Wallet Balance</h3>

        {/* BUTTON TO REFRESH THE WALLET AMOUNT. SEEMS REPETITIVE... */}
        {/* <button
          onClick={onRefresh}
          disabled={accountBalance.loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            accountBalance.loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {accountBalance.loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </div>
          ) : (
            '🔄 Refresh'
          )}
        </button> */}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="balance-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{accountBalance.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{accountBalance.symbol}</h3>
                <p className="text-sm text-gray-500">Available Balance</p>
              </div>
            </div>
            <div className="text-right">
              {accountBalance.loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : accountBalance.error ? (
                <div className="text-right">
                  <p className="text-sm text-red-500 mb-1">Error</p>
                  <button
                    onClick={onRefresh}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{accountBalance.balance}</p>
                  <p className="text-sm text-gray-500">{accountBalance.symbol}</p>
                </div>
              )}
            </div>
          </div>
          
          {accountBalance.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{accountBalance.error}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Balance is fetched in real-time from the blockchain. 
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 underline ml-1"
          >
            Click here to refresh
          </button>
        </p>
      </div>
    </div>
  );
};

export default BalanceCards;