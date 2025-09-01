// components/dashboard/CashRequirementCard.tsx
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface CashRequirementCardProps {
  totalPayroll: number;
  currentBalance: number;
}

const CashRequirementCard: React.FC<CashRequirementCardProps> = ({ 
  totalPayroll, 
  currentBalance 
}) => {
  const shortfall = totalPayroll - currentBalance;
  const hasEnoughFunds = currentBalance >= totalPayroll;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Cash Requirements</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Total Payroll Required</span>
            <span className="font-medium">{totalPayroll.toFixed(4)} ETH</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Current Balance</span>
            <span className="font-medium">{currentBalance.toFixed(4)} ETH</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {hasEnoughFunds ? 'Surplus' : 'Shortfall'}
              </span>
              <span className={`font-semibold ${hasEnoughFunds ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(shortfall).toFixed(4)} ETH
              </span>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-3 ${hasEnoughFunds ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start gap-2">
            {hasEnoughFunds ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${hasEnoughFunds ? 'text-green-800' : 'text-red-800'}`}>
                {hasEnoughFunds ? 'Sufficient Funds' : 'Insufficient Funds'}
              </p>
              <p className={`text-xs mt-1 ${hasEnoughFunds ? 'text-green-700' : 'text-red-700'}`}>
                {hasEnoughFunds 
                  ? 'You have enough funds to cover the payroll cycle.'
                  : `Please deposit ${shortfall.toFixed(4)} ETH to cover payroll.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashRequirementCard;