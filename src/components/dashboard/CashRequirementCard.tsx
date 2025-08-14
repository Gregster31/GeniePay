import React from 'react';
import { DollarSign, Calendar, Download, Loader2 } from 'lucide-react';
import { config } from '../../utils/Environment';

interface CashRequirementCardProps {
  totalPayroll: number;
  availableBalance: number;
  balanceLoading: boolean;
  balanceError: boolean;
  isSending: boolean;
  onBulkPayment: () => void;
}

const CashRequirementCard: React.FC<CashRequirementCardProps> = ({
  totalPayroll,
  availableBalance,
  balanceLoading,
  balanceError,
  isSending,
  onBulkPayment
}) => {
  const requiredAmount = Math.max(0, totalPayroll - availableBalance);
  const hasEnoughFunds = availableBalance >= totalPayroll;

  //TODO: MAKE THIS SHIT GLOBAL IN UTILS
  const getFormattedBalance = () => {
    if (balanceLoading) return "Loading...";
    if (balanceError) return "0.00 ETH";
    return `${availableBalance.toFixed(4)} ETH`;
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Cash Requirement</h3>
        </div>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Payroll Amount</div>
          <div className="text-2xl font-bold text-gray-900">{totalPayroll.toFixed(4)} ETH</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">
            Available Balance {!config.isProduction && '(Sepolia)'}
          </div>
          <div className={`text-2xl font-bold ${balanceLoading ? 'text-gray-400' : 'text-gray-900'}`}>
            {getFormattedBalance()}
          </div>
          {balanceError && (
            <div className="text-xs text-red-500 mt-1">Error loading balance</div>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Amount Needed</div>
          <div className={`text-2xl font-bold ${requiredAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {requiredAmount > 0 ? `${requiredAmount.toFixed(4)} ETH` : '0.00 ETH'}
          </div>
        </div>
      </div>
      
      <div className={`rounded-lg p-4 text-white ${
        hasEnoughFunds 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">Total Amount to Pay</div>
            <div className="text-2xl font-bold">{totalPayroll.toFixed(4)} ETH</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Due by</div>
            <div className="text-lg font-semibold">Next Sunday</div>
          </div>
          <button 
            onClick={onBulkPayment}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              hasEnoughFunds && !isSending
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
                : 'bg-white bg-opacity-20 hover:bg-opacity-30 cursor-not-allowed opacity-75'
            }`}
            disabled={!hasEnoughFunds || isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {hasEnoughFunds 
              ? (isSending ? 'Processing...' : 'Pay now') 
              : 'Insufficient funds'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashRequirementCard;