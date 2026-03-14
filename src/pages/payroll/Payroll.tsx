import React, { useState } from 'react';
import { UserPlus, Send, Copy, CheckCircle2, FileUp, Pencil } from 'lucide-react';
import type { Employee } from '@/models/EmployeeModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { copyToClipboard } from '@/utils/ClipboardCopy';
import { EmployeeModal } from '@/pages/payroll/EmployeeModal';
import { BatchPaymentModal } from '@/pages/payroll/BatchPaymentModal';
import { CSVImportModal } from '@/pages/payroll/CsvImportModal';
import { useAuth } from '@/contexts/AuthContext';

export const Payroll: React.FC = () => {
  const {
    employees,
    addEmployee: addEmployeeToContext,
    updateEmployee: updateEmployeeInContext,
  } = useAuth();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

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

  const handleAdd = (newEmployee: Omit<Employee, 'id' | 'dateAdded'>) => {
    addEmployeeToContext(newEmployee);
    setShowAddModal(false);
  };

  const handleEdit = (id: number, updates: Omit<Employee, 'id' | 'dateAdded'>) => {
    updateEmployeeInContext(id, updates);
    setEmployeeToEdit(null);
  };

  const openEditModal = (employee: Employee) => {
    setEmployeeToEdit(employee);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEmployeeToEdit(null);
  };

  const handleCSVImport = (imported: Omit<Employee, 'id' | 'dateAdded'>[]) => {
    imported.forEach(emp => addEmployeeToContext(emp));
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
            <p className="text-gray-400 text-sm">Manage employees and run batch payments</p>
          </div>
          <div className="flex gap-3">
            {/* CSV Import */}
            <button
              onClick={() => setShowCSVModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'rgba(124, 58, 237, 0.08)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                color: '#a78bfa',
              }}
            >
              <FileUp className="w-4 h-4" />
              Import CSV
            </button>

            {/* Add Employee */}
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

            {/* Run Batch Payment */}
            <button
              onClick={() => setShowBatchModal(true)}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: selectedIds.length > 0
                  ? 'rgba(124, 58, 237, 0.8)'
                  : 'rgba(124, 58, 237, 0.2)',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                color: 'white',
              }}
            >
              <Send className="w-4 h-4" />
              {selectedIds.length > 0
                ? `Pay ${selectedIds.length} Employee${selectedIds.length > 1 ? 's' : ''}`
                : 'Run Payroll'}
            </button>
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(26, 27, 34, 0.8)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(124, 58, 237, 0.2)' }}>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                    />
                  </th>
                  {['Employee', 'Role', 'Wallet', 'Monthly Pay', 'Date Added', ''].map(h => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <p className="text-gray-400">No employees added yet</p>
                    </td>
                  </tr>
                ) : (
                  employees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className="transition-all hover:bg-white/5"
                      style={{
                        borderBottom:
                          index < employees.length - 1
                            ? '1px solid rgba(124, 58, 237, 0.1)'
                            : 'none',
                      }}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(employee.id)}
                          onChange={() => toggleEmployee(employee.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                        />
                      </td>

                      {/* Name / Email */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{employee.name}</p>
                          {employee.email && (
                            <p className="text-sm text-gray-400">{employee.email}</p>
                          )}
                        </div>
                      </td>

                      {/* Role / Department */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white">{employee.role}</p>
                          {employee.department && (
                            <p className="text-sm text-gray-400">{employee.department}</p>
                          )}
                        </div>
                      </td>

                      {/* Wallet */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCopy(employee.walletAddress)}
                          className="flex items-center gap-1 group"
                          title="Click to copy address"
                        >
                          <code className="text-sm text-gray-300 font-mono group-hover:text-purple-400 transition-colors">
                            {sliceAddress(employee.walletAddress)}
                          </code>
                          {copiedAddress === employee.walletAddress ? (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </td>

                      {/* Monthly Pay */}
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {formatCurrency(employee.payUsd)}
                        </span>
                      </td>

                      {/* Date Added */}
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {formatDate(employee.dateAdded)}
                        </span>
                      </td>

                      {/* Edit action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openEditModal(employee)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{
                            backgroundColor: 'rgba(124, 58, 237, 0.08)',
                            border: '1px solid rgba(124, 58, 237, 0.2)',
                            color: '#a78bfa',
                          }}
                          title="Edit employee"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Single modal instance handles both Add and Edit */}
      <EmployeeModal
        isOpen={showAddModal || Boolean(employeeToEdit)}
        onClose={handleModalClose}
        onAdd={handleAdd}
        onEdit={handleEdit}
        employeeToEdit={employeeToEdit}
      />

      <BatchPaymentModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        employees={selectedEmployees}
        totalAmount={totalAmount}
      />

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImport={handleCSVImport}
      />
    </div>
  );
};

export default Payroll;