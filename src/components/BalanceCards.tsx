/**
 * BalanceCards Component
 * ----------------------
 * Displays a grid of balance cards for different coins in the current wallet.
 *
 * Props:
 * - stablecoins: An array of stablecoin objects, each containing:
 *    - symbol: string — the currency symbol (e.g., "USDC", "DAI")
 *    - icon: JSX.Element — a visual icon representing the coin
 *    - balance: string or number — the user's current balance of the coin
 */

import React from 'react';
import { type BalanceCardsProps } from '../utils/BalanceCardsProps';

const BalanceCards: React.FC<BalanceCardsProps> = ({ stablecoins }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stablecoins.map((coin) => (
        <div key={coin.symbol} className="balance-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{coin.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{coin.symbol}</h3>
                <p className="text-sm text-gray-500">Balance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{coin.balance}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BalanceCards;