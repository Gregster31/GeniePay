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
 * - Real network fee estimation for Sepolia testnet
 * - Ethereum transaction support
 * - Uses TailwindCSS utility classes for styling
 */

import React, { useState, useEffect } from 'react';
import { X, User, Loader2 } from 'lucide-react';
import type { PaymentModalProps } from '../utils/PaymentModalProps';
import { truncateAddress } from '../utils/EmployeeListProps';
import { getMetaMask, estimateGasPrice } from '../utils/balanceUtils';

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
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<string>('0.00');
  const [gasPrice, setGasPrice] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');

  useEffect(() => {
    const fetchGasEstimate = async () => {
      if (!isOpen || !employee?.walletAddress) return;

      try {
        console.log('Fetching gas estimate...');
        
        const ethereum = await getMetaMask();
        if (!ethereum) {
          throw new Error('MetaMask not available');
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          throw new Error('No accounts found');
        }

        const fromAddress = accounts[0];

        const gasEstimate = await estimateGasPrice(
          employee.walletAddress, 
          selectedToken, 
          amount || '0.001',
          fromAddress
        );
        
        console.log('Gas estimate received:', gasEstimate);
        
        setGasPrice(gasEstimate.gasPrice);
        setEstimatedFee(gasEstimate.estimatedFee);

        const balance = await ethereum.request({
          method: 'eth_getBalance',
          params: [fromAddress, 'latest']
        });
        const ethBal = parseInt(balance, 16) / Math.pow(10, 18);
        console.log('ETH balance:', ethBal);
        setEthBalance(ethBal.toString());

      } catch (error) {
        console.error('Error fetching gas estimate:', error);
        setEstimatedFee('0.002'); 
        setGasPrice('25'); 
        
        try {
          const ethereum = await getMetaMask();
          if (ethereum) {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              const balance = await ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
              });
              const ethBal = parseInt(balance, 16) / Math.pow(10, 18);
              setEthBalance(ethBal.toString());
            }
          }
        } catch (balanceError) {
          console.error('Failed to get balance:', balanceError);
        }
      }
    };

    const timeoutId = setTimeout(fetchGasEstimate, 300);
    return () => clearTimeout(timeoutId);
  }, [isOpen, employee?.walletAddress, selectedToken, amount]);

  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setErrors({ amount: 'Please enter a valid amount' });
      return false;
    }
    
    const selectedCoin = stablecoins.find(coin => coin.symbol === selectedToken);
    const balance = parseFloat(selectedCoin?.balance.replace(/,/g, '') || '0');
    const currentEthBalance = parseFloat(ethBalance) || 0;
    let feeAmount = parseFloat(estimatedFee) || 0;
    
    if (feeAmount < 0.001) {
      feeAmount = 0.002; 
      setEstimatedFee(feeAmount.toString());
    }
    
    console.log('Validation Details:');
    console.log('- Selected Token:', selectedToken);
    console.log('- Payment Amount:', numValue);
    console.log('- ETH Balance:', currentEthBalance);
    console.log('- Estimated Fee:', feeAmount);
    console.log('- Token Balance:', balance);
    
    if (selectedToken === 'ETH') {
      const totalRequired = numValue + feeAmount;
      if (totalRequired > currentEthBalance) {
        setErrors({ 
          amount: `Insufficient ETH. Need ${totalRequired.toFixed(6)} ETH (${numValue} payment + ${feeAmount.toFixed(6)} gas) but you have ${currentEthBalance.toFixed(6)} ETH` 
        });
        return false;
      }
    } else {
      if (numValue > balance) {
        setErrors({ amount: `Insufficient ${selectedToken} balance. Need ${numValue} but you have ${balance}` });
        return false;
      }
      
      if (currentEthBalance < feeAmount) {
        setErrors({ 
          amount: `Insufficient ETH for gas fees. Need ${feeAmount.toFixed(6)} ETH for gas but you have ${currentEthBalance.toFixed(6)} ETH` 
        });
        return false;
      }
    }
    
    setErrors({ amount: '' });
    return true;
  };

  const validateWalletAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (errors.amount) {
      validateAmount(value);
    }
  };

  const handleSendPayment = async () => {
    if (!employee || !validateAmount(amount)) return;
    
    if (!validateWalletAddress(employee.walletAddress)) {
      setErrors({ amount: 'Invalid wallet address' });
      return;
    }

    const currentEthBalance = parseFloat(ethBalance);
    const feeAmount = parseFloat(estimatedFee);
    const paymentAmount = parseFloat(amount);

    if (selectedToken === 'ETH' && (paymentAmount + feeAmount) > currentEthBalance) {
      setErrors({ amount: 'Insufficient balance for payment + gas fees' });
      return;
    }

    if (currentEthBalance < feeAmount) {
      setErrors({ amount: 'Insufficient ETH for gas fees' });
      return;
    }

    setIsLoading(true);
    
    try {
      await onSendPayment(employee, selectedToken, amount);
      handleClose();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setErrors({ amount: '' });
    setIsLoading(false);
    onClose();
  };

  if (!isOpen || !employee) return null;

  const totalCost = amount && selectedToken === 'ETH' 
    ? (parseFloat(amount) + parseFloat(estimatedFee)).toFixed(6)
    : amount;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Send Payment</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
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
          {/* Current Balances */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Balances</h4>
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>ETH (for gas):</span>
                <span className="font-medium">{parseFloat(ethBalance).toFixed(6)} ETH</span>
              </div>
              {stablecoins.map((coin) => (
                <div key={coin.symbol} className="flex justify-between">
                  <span>{coin.symbol}:</span>
                  <span className="font-medium">{coin.balance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Token
            </label>
            <select 
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="input-field"
              disabled={isLoading}
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
              Amount ({selectedToken})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0.00"
              min="0"
              step="0.000001"
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Fee Information */}
          <div className="fee-info">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Network Fee (Sepolia)</span>
              <span className="font-medium">{estimatedFee} ETH</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Gas Price</span>
              <span>{parseFloat(gasPrice).toFixed(2)} Gwei</span>
            </div>
            {amount && selectedToken === 'ETH' && (
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-yellow-200">
                <span className="text-gray-600 font-medium">Total Required</span>
                <span className="font-medium text-gray-900">
                  {totalCost} ETH
                </span>
              </div>
            )}
            {amount && selectedToken !== 'ETH' && (
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-yellow-200">
                <span className="text-gray-600 font-medium">Total Required</span>
                <span className="font-medium text-gray-900">
                  {amount} {selectedToken} + {estimatedFee} ETH
                </span>
              </div>
            )}
          </div>

          {/* Network Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 You're sending on Sepolia testnet. This transaction will use test ETH for gas fees.
              {parseFloat(ethBalance) < parseFloat(estimatedFee) && (
                <span className="block mt-1 text-red-600 font-medium">
                  ⚠️ You need more ETH to cover gas fees!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSendPayment}
            disabled={!amount || !!errors.amount || isLoading}
            className={`flex-1 px-4 py-2 btn-primary ${
              !amount || !!errors.amount || isLoading
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;