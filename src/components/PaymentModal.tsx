/**
 * PaymentModal Component
 * ----------------------
 * A modal form to send cryptocurrency payments to employees.
 * Allows selection of a stablecoin, entry of payment amount, 
 * and validation against available balance.
 *
 * Props (PaymentModalProps):
 * - isOpen: boolean — controls the visibility of the modal
 * - employee: Employee — the employee receiving the payment
 * - stablecoins: Array<{ symbol: string; balance: string }> — list of supported stablecoins and their balances
 * - onClose: () => void — called when the modal is closed
 * - onSendPayment: (employee, tokenSymbol, amount) => void — called when the payment is confirmed
 *
 * Features:
 * - Input validation for amount and balance checks
 * - Truncates employee wallet address for UI clarity
 * - Displays mock network fee estimate
 * - Uses TailwindCSS utility classes for styling
 */

import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import type { PaymentModalProps } from '../utils/PaymentModalProps';


const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  employee,
  stablecoins,
  onClose,
  onSendPayment,
}) => {
  const [selectedToken, setSelectedToken] = useState(stablecoins[0]?.symbol || '');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({
    amount: '',
  });

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setErrors({ amount: 'Please enter a valid amount' });
      return false;
    }
    
    const selectedCoin = stablecoins.find(coin => coin.symbol === selectedToken);
    const balance = parseFloat(selectedCoin?.balance.replace(/,/g, '') || '0');
    
    if (numValue > balance) {
      setErrors({ amount: 'Insufficient balance' });
      return false;
    }
    
    setErrors({ amount: '' });
    return true;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (errors.amount) {
      validateAmount(value);
    }
  };

  const handleSendPayment = () => {
    if (!employee || !validateAmount(amount)) return;
    
    onSendPayment(employee, selectedToken, amount);
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setErrors({ amount: '' });
    onClose();
  };

  if (!isOpen || !employee) return null;

  const estimatedFee = 2.50; // Mock fee calculation

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Send Payment</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Employee Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="avatar-placeholder">
            {employee.avatar ? (
              <img 
                src={employee.avatar} 
                alt={employee.name} 
                className="w-12 h-12 rounded-full object-cover" 
              />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-500">
              {truncateAddress(employee.walletAddress)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Token
            </label>
            <select 
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="input-field"
            >
              {stablecoins.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.symbol} - {coin.balance} available
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Fee Information */}
          <div className="fee-info">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Network Fee (Est.)</span>
              <span className="font-medium">${estimatedFee.toFixed(2)}</span>
            </div>
            {amount && (
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-yellow-200">
                <span className="text-gray-600">Total Cost</span>
                <span className="font-medium">
                  {amount} {selectedToken} + ${estimatedFee.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSendPayment}
            disabled={!amount || !!errors.amount}
            className={`flex-1 px-4 py-2 btn-primary ${
              !amount || !!errors.amount 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            Send Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;