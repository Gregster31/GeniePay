import React from 'react';
import { Check, Copy, ExternalLink, Download, X } from "lucide-react";
import { Modal } from '@/components/ui/Modal';
import type { AccountHistoryTransaction } from '@/models/AccountHistoryTransactionModel';

export const InvoiceModal: React.FC<{
  transaction: AccountHistoryTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ transaction, isOpen, onClose }) => {
  if (!transaction) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadPDF = () => {
    // Mock PDF download functionality
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Invoice for transaction ${transaction.id}`));
    element.setAttribute('download', `invoice-${transaction.id}.pdf`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openBlockExplorer = (txHash: string) => {
    // Open transaction in block explorer (Etherscan)
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Invoice"
      footer={
        <div className="flex space-x-3">
          <button
            onClick={downloadPDF}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Company Header */}
        <div className="text-center border-b border-gray-100 pb-4">
          <h3 className="text-2xl font-bold text-gray-900">{transaction.companyName}</h3>
          <p className="text-gray-500 mt-1">Crypto Payroll Transaction Receipt</p>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
              <p className="text-gray-900 font-mono text-sm">{transaction.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date & Time</label>
              <p className="text-gray-900">{formatDate(transaction.date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Payment Type</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {transaction.type}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Recipient</label>
              <p className="text-gray-900">{transaction.recipientName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Wallet Address</label>
              <p className="text-gray-900 font-mono text-sm break-all">{transaction.recipientAddress}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transaction.status === 'Success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {transaction.status === 'Success' ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <X className="w-3 h-3 mr-1" />
                )}
                {transaction.status}
              </span>
            </div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount Paid</span>
            <span className="text-2xl font-bold text-gray-900">
              {transaction.amount} {transaction.token}
            </span>
          </div>
          {transaction.gasUsed && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">Gas Used</span>
              <span className="text-sm text-gray-900">{transaction.gasUsed} wei</span>
            </div>
          )}
        </div>

        {/* Blockchain Details */}
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-500 mb-2">Transaction Hash</label>
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
            <p className="text-xs font-mono text-gray-700 break-all flex-1">{transaction.txHash}</p>
            <button 
              onClick={() => copyToClipboard(transaction.txHash)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy transaction hash"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button 
              onClick={() => openBlockExplorer(transaction.txHash)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="View on block explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};