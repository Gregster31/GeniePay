/**
 * Batch Payment Modal
 * Confirmation modal for batch payments - no logic implemented yet
 */

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Employee } from '@/models/EmployeeModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';

interface BatchPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  totalAmount: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const BatchPaymentModal: React.FC<BatchPaymentModalProps> = ({
  isOpen,
  onClose,
  employees,
  totalAmount,
}) => {
  if (!isOpen) return null;

  const handleExecutePayment = () => {
    // TODO: Implement batch payment logic with Wagmi/Viem
    console.log('Executing batch payment for employees:', employees);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'rgba(26, 27, 34, 0.95)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'rgba(124, 58, 237, 0.2)' }}
        >
          <h2 className="text-2xl font-bold text-white">Confirm Batch Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div
            className="flex items-start gap-3 p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-500 font-medium">Payment Confirmation Required</p>
              <p className="text-yellow-200/70 text-sm mt-1">
                You are about to send payments to {employees.length} employee
                {employees.length !== 1 ? 's' : ''}. This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          <div
            className="p-4 rounded-lg space-y-3"
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Employees</span>
              <span className="text-white font-semibold">{employees.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-2xl font-bold text-purple-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-purple-500/20">
              <span className="text-gray-400 text-sm">Estimated Gas Fee</span>
              <span className="text-gray-300 text-sm">~$5.00 USD</span>
            </div>
          </div>

          {/* Employee List */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Payment Recipients
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{employee.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-gray-400 font-mono">
                        {sliceAddress(employee.walletAddress)}
                      </code>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{employee.role}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(employee.payUsd)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="text-sm text-gray-400 space-y-2">
            <p className="font-medium text-gray-300">Before proceeding:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Ensure all wallet addresses are correct</li>
              <li>Verify you have sufficient balance for payments and gas fees</li>
              <li>Transactions will be processed on-chain and are irreversible</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#9ca3af' }}
            >
              Cancel
            </button>
            <button
              onClick={handleExecutePayment}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#7c3aed', color: 'white' }}
            >
              Execute Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};