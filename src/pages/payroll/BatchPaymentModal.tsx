import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle2, Loader2, ExternalLink, Zap } from 'lucide-react';
import { useBulkPayment } from '@/hooks/useBulkPayment';
import type { Employee } from '@/models/EmployeeModel';

interface BatchPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  totalAmount: number;
}

export const BatchPaymentModal: React.FC<BatchPaymentModalProps> = ({
  isOpen,
  onClose,
  employees,
  totalAmount,
}) => {
  const {
    approvalHash,
    paymentHash,
    error,
    ethPrice,
    isApproving,
    isSuccess,
    isProcessing,
    execute,
    reset,
    estimateGasSavings
  } = useBulkPayment();

  const [gasSavings, setGasSavings] = useState('60%');
  const [selectedCurrency, setSelectedCurrency] = useState<'ETH' | 'USDC'>('USDC');

  useEffect(() => {
    if (employees.length > 0) {
      setGasSavings(estimateGasSavings(employees.length));
    }
  }, [employees.length, estimateGasSavings]);

  // Auto-close on success
  useEffect(() => {
    if (isSuccess && paymentHash) {
      setTimeout(() => {
        reset();
        onClose();
      }, 3000);
    }
  }, [isSuccess, paymentHash, reset, onClose]);

  const handleClose = () => {
    if (!isProcessing) {
      reset();
      onClose();
    }
  };

  const handleConfirm = async () => {
    try {
      await execute({ 
        employees, 
        currency: selectedCurrency 
      });
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatEthAmount = (usdAmount: number) => {
    const ethAmount = usdAmount / ethPrice;
    return ethAmount.toFixed(6); // 6 decimals for ETH
  };

  const getTotalInSelectedCurrency = () => {
    if (selectedCurrency === 'ETH') {
      const ethTotal = totalAmount / ethPrice;
      return `${ethTotal.toFixed(6)} ETH`;
    }
    return formatCurrency(totalAmount);
  };

  const shortenHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(26, 27, 34, 0.95)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">
              {isSuccess ? '✅ Payment Successful!' : 'Confirm Batch Payment'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {isSuccess 
                ? `${employees.length} employees paid successfully`
                : `Review and confirm payment to ${employees.length} employee${employees.length > 1 ? 's' : ''}`}
            </p>
          </div>
          {!isProcessing && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Currency Selector */}
          {!isSuccess && !isProcessing && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Payment Currency
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCurrency('ETH')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedCurrency === 'ETH'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Pay in ETH
                  <div className="text-xs opacity-70 mt-1">Native Ether</div>
                </button>
                <button
                  onClick={() => setSelectedCurrency('USDC')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedCurrency === 'USDC'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Pay in USDC
                  <div className="text-xs opacity-70 mt-1">Stablecoin</div>
                </button>
              </div>
            </div>
          )}
          
          {/* Success State */}
          {isSuccess && paymentHash && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-400 mb-2">Payment Completed!</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    {formatCurrency(totalAmount)} sent to {employees.length} recipient{employees.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-black/30 px-2 py-1 rounded font-mono text-green-400">
                      {shortenHash(paymentHash)}
                    </code>
                    <a
                      href={`https://etherscan.io/tx/${paymentHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                    >
                      View on Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isSuccess && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-1">Transaction Failed</h3>
                  <p className="text-sm text-gray-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          {!isSuccess && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400 uppercase">Total Amount</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{getTotalInSelectedCurrency()}</div>
                  {selectedCurrency === 'ETH' && (
                    <div className="text-xs text-gray-400 mt-1">
                      ≈ {formatCurrency(totalAmount)} @ ${ethPrice.toLocaleString()}/ETH
                    </div>
                  )}
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400 uppercase">Gas Savings</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">{gasSavings}</div>
                </div>
              </div>

              {/* Employee List (if 5 or fewer) */}
              {employees.length <= 5 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">Recipients</h3>
                  <div className="space-y-2">
                    {employees.map(emp => (
                      <div
                        key={emp.id}
                        className="flex justify-between items-center p-3 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div>
                          <div className="font-medium text-white">{emp.name}</div>
                          <div className="text-xs text-gray-400">{emp.role}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-purple-400">
                            {selectedCurrency === 'ETH' 
                              ? `${formatEthAmount(emp.payUsd)} ETH`
                              : formatCurrency(emp.payUsd)}
                          </div>
                          {selectedCurrency === 'ETH' && (
                            <div className="text-xs text-gray-400 text-right">
                              ≈ {formatCurrency(emp.payUsd)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Progress */}
          {isProcessing && !isSuccess && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-400 mb-1">
                    {isApproving 
                      ? `Step 1/2: Approving ${selectedCurrency}...` 
                      : selectedCurrency === 'ETH' 
                        ? 'Sending ETH Payment...'
                        : 'Step 2/2: Sending Payment...'}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {isApproving 
                      ? 'Confirm the approval transaction in your wallet' 
                      : 'Confirm the payment transaction in your wallet'}
                  </p>
                  {(approvalHash || paymentHash) && (
                    <a
                      href={`https://etherscan.io/tx/${paymentHash || approvalHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-flex items-center gap-1"
                    >
                      View Transaction <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div
            className="px-6 py-4 flex gap-4"
            style={{
              borderTop: '1px solid rgba(124, 58, 237, 0.2)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 py-2 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: isProcessing ? 'rgba(124, 58, 237, 0.5)' : '#7c3aed',
                color: 'white',
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isApproving ? 'Approving...' : 'Sending...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Pay {employees.length} Employee{employees.length > 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};