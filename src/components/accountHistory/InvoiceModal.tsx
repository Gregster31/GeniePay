import { X, Check, Copy, ExternalLink, Download } from "lucide-react";
import type { InvoiceModalProps } from "../../utils/InvoiceModalProps";

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Transaction Invoice</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
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
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
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
        </div>
      </div>
    </div>
  );
};