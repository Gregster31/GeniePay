
import React from 'react';
import { 
  X, 
  Edit2, 
  Trash2, 
  Calendar, 
  Mail, 
  Phone, 
  DollarSign, 
  Building, 
  Clock, 
  Copy,
  ExternalLink
} from 'lucide-react';
import type { Employee } from '@/types/EmployeeModel';
import { getStatusColor } from '@/utils/team/statusUtils';

interface EmployeeDetailDrawerProps {
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const EmployeeDetailDrawer: React.FC<EmployeeDetailDrawerProps> = ({ 
  employee, 
  onClose, 
  onEdit,
  onDelete 
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const openInExplorer = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-2xl overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {employee.avatar ? (
                <img
                  className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
                  src={employee.avatar}
                  alt={employee.name}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-200">
                  <span className="text-xl font-semibold text-blue-600">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-gray-900">{employee.name}</h3>
              <p className="text-lg text-gray-600">{employee.role}</p>
              <p className="text-gray-500">{employee.department}</p>
              <div className="mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="text-gray-900">{employee.joinDate.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Employment Type</p>
                  <p className="text-gray-900">{employee.employmentType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
                  <code className="flex-1 text-sm font-mono text-gray-900 break-all">
                    {employee.walletAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(employee.walletAddress)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    title="Copy Address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openInExplorer(employee.walletAddress)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payroll Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payroll Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="text-xl font-bold text-gray-900">{employee.salary} ETH</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Payment Frequency</p>
                  <p className="text-gray-900">{employee.paymentFrequency}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Last Payment</p>
                  <p className="text-gray-900">
                    {employee.lastPayment 
                      ? employee.lastPayment.toLocaleDateString() 
                      : 'No payments yet'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {employee.totalPaid && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Paid to Date:</span>
                  <span className="text-lg font-semibold text-green-700">
                    {employee.totalPaid} ETH
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment History */}
          {employee.paymentHistory && employee.paymentHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Payment History</h4>
              <div className="space-y-3">
                {employee.paymentHistory.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        payment.status === 'Completed' ? 'bg-green-500' :
                        payment.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.amount} ETH
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900 font-mono">
                        {payment.txHash.slice(0, 8)}...{payment.txHash.slice(-6)}
                      </p>
                      <p className={`text-xs ${
                        payment.status === 'Completed' ? 'text-green-600' :
                        payment.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};