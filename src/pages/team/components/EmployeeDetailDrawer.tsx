import React from 'react';
import { 
  X, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  DollarSign, 
  Building, 
  Briefcase,
  Copy,
  ExternalLink,
  User
} from 'lucide-react';
import type { Employee } from '@/types/EmployeeModel';

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

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const getEmploymentTypeBadge = (type: string) => {
    const colors = {
      employee: 'bg-blue-100 text-blue-800',
      contractor: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-2xl overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Team Member Details</h2>
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
              {employee.avatar_url ? (
                <img
                  className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
                  src={employee.avatar_url}
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
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEmploymentTypeBadge(employee.employment_type)}`}>
                  {employee.employment_type.charAt(0).toUpperCase() + employee.employment_type.slice(1)}
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
                  <p className="text-gray-900">{employee.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-gray-900">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-gray-900">{employee.role}</p>
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
                    {employee.wallet_address}
                  </code>
                  <button
                    onClick={() => copyToClipboard(employee.wallet_address)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    title="Copy Address"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openInExplorer(employee.wallet_address)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compensation Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Compensation</h4>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">
                  {employee.employment_type === 'employee' ? 'Annual Salary' : 'Rate'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatSalary(employee.salary)}</p>
                {employee.employment_type === 'contractor' && (
                  <p className="text-xs text-gray-500 mt-1">Per month or project</p>
                )}
              </div>
            </div>
          </div>

          {/* Employee ID */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="text-sm font-mono text-gray-900">{employee.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};