import React, { useState } from 'react';
import { UserPlus, Send, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { mockEmployees } from '@/data/MockEmployeeData';
import type { Employee } from '@/models/EmployeeModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { copyToClipboard } from '@/utils/ClipboardCopy';
import { AddEmployeeModal } from '@/pages/payroll/AddEmployeeModal';
import { BatchPaymentModal } from '@/pages/payroll/BatchPaymentModal';

export const Payroll: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const selectedEmployees = employees.filter(emp => selectedIds.includes(emp.id));
  const totalAmount = selectedEmployees.reduce((sum, emp) => sum + emp.payUsd, 0);
  const allSelected = employees.length > 0 && selectedIds.length === employees.length;

  const handleCopy = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  const toggleEmployee = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : employees.map(emp => emp.id));
  };

  const addEmployee = (newEmployee: Omit<Employee, 'id' | 'dateAdded'>) => {
    const employee: Employee = {
      ...newEmployee,
      id: Math.max(0, ...employees.map(e => e.id)) + 1,
      dateAdded: new Date(),
    };
    setEmployees([...employees, employee]);
    setShowAddModal(false);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Payroll</h1>
            <p className="text-gray-400 mt-1">Manage employees and run batch payments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                color: '#a78bfa',
              }}
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedIds.length > 0 ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)',
                color: 'white',
              }}
            >
              <Send className="w-4 h-4" />
              Run Batch Payment ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedIds.length > 0 && (
          <div
            className="p-4 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
            }}
          >
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Selected Employees</p>
                <p className="text-lg font-semibold text-white">{selectedIds.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Amount</p>
                <p className="text-lg font-semibold text-purple-400">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Employee Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(26, 27, 34, 0.6)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    backgroundColor: 'rgba(15, 13, 22, 0.6)',
                    borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
                  }}
                >
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Wallet Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Pay (USD)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date Added</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <p className="text-gray-400">No employees added yet</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Add your first employee
                      </button>
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className="transition-all hover:bg-white/5"
                      style={{
                        borderBottom:
                          index < employees.length - 1 ? '1px solid rgba(124, 58, 237, 0.1)' : 'none',
                      }}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(employee.id)}
                          onChange={() => toggleEmployee(employee.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{employee.name}</p>
                          {employee.email && <p className="text-sm text-gray-400">{employee.email}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">{employee.role}</p>
                          {employee.department && <p className="text-sm text-gray-400">{employee.department}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-gray-300 font-mono">
                            {sliceAddress(employee.walletAddress)}
                          </code>
                          <button
                            onClick={() => handleCopy(employee.walletAddress)}
                            className="text-gray-400 hover:text-purple-400 transition-colors"
                            title="Copy address"
                          >
                            {copiedAddress === employee.walletAddress ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={`https://etherscan.io/address/${employee.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-purple-400 transition-colors"
                            title="View on Etherscan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{formatCurrency(employee.payUsd)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{formatDate(employee.dateAdded)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addEmployee} />
      <BatchPaymentModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        employees={selectedEmployees}
        totalAmount={totalAmount}
      />
    </div>
  );
};

export default Payroll;