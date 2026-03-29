import React, { useState } from 'react';
import { UserPlus, Send, Copy, CheckCircle2, FileUp, Pencil, Trash2 } from 'lucide-react';
import type { Employee } from '@/models/EmployeeModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { formatCurrency, formatDate } from '@/utils/Format';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { EmployeeModal } from '@/pages/payroll/EmployeeModal';
import { BatchPaymentModal } from '@/pages/payroll/BatchPaymentModal';
import { CSVImportModal } from '@/pages/payroll/CsvImportModal';
import { useAuth } from '@/contexts/AuthContext';

export const Payroll: React.FC = () => {
  const { employees, addEmployee, updateEmployee, removeEmployee } = useAuth();

  const [selectedIds, setSelectedIds]           = useState<string[]>([]);
  const [showAddModal, setShowAddModal]          = useState(false);
  const [showBatchModal, setShowBatchModal]      = useState(false);
  const [showCSVModal, setShowCSVModal]          = useState(false);
  const [employeeToEdit, setEmployeeToEdit]      = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete]  = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting]              = useState(false);
  const { copy, copiedValue: copiedAddress }     = useCopyToClipboard();

  const selectedEmployees = employees.filter(emp => selectedIds.includes(emp.id));
  const totalAmount       = selectedEmployees.reduce((sum, emp) => sum + emp.payUsd, 0);
  const allSelected       = employees.length > 0 && selectedIds.length === employees.length;
  const hasSelection      = selectedIds.length > 0;

  const toggleEmployee  = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? [] : employees.map(e => e.id));

  const handleAdd = async (data: Omit<Employee, 'id' | 'dateAdded'>) => {
    await addEmployee(data);
    setShowAddModal(false);
  };

  const handleEdit = async (id: string, updates: Omit<Employee, 'id' | 'dateAdded'>) => {
    await updateEmployee(id, updates);
    setEmployeeToEdit(null);
  };

  const handleCSVImport = async (imported: Omit<Employee, 'id' | 'dateAdded'>[]) => {
    for (const emp of imported) await addEmployee(emp);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      await removeEmployee(employeeToDelete.id);
      setSelectedIds(prev => prev.filter(id => id !== employeeToDelete.id));
    } finally {
      setIsDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-6">

        {/* ── Header ────────────────────────────────────────────────────────
            Mobile : title on top, buttons in a 2-col grid below
            sm+    : title left, buttons right in a single row              */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Payroll</h1>
            <p className="text-gray-400 text-sm">Manage employees and run batch payments</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            {/* Import CSV */}
            <button
              onClick={() => setShowCSVModal(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa' }}
            >
              <FileUp className="w-4 h-4 shrink-0" />
              Import CSV
            </button>

            {/* Add Employee */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              Add Employee
            </button>

            {/* Run Payroll — full width on mobile */}
            <button
              onClick={() => setShowBatchModal(true)}
              disabled={!hasSelection}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: hasSelection ? 'rgba(124,58,237,0.8)' : 'rgba(124,58,237,0.2)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: 'white',
              }}
            >
              <Send className="w-4 h-4 shrink-0" />
              {hasSelection ? `Pay ${selectedIds.length} Employee${selectedIds.length > 1 ? 's' : ''}` : 'Run Payroll'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'rgba(26,27,34,0.8)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900"
                    />
                  </th>
                  {['Employee', 'Role', 'Wallet', 'Monthly Pay', 'Date Added', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                      style={{ borderBottom: index < employees.length - 1 ? '1px solid rgba(124,58,237,0.1)' : 'none' }}
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
                        <p className="text-white font-medium">{employee.name}</p>
                        {employee.email && <p className="text-sm text-gray-400">{employee.email}</p>}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-white">{employee.role}</p>
                        {employee.department && <p className="text-sm text-gray-400">{employee.department}</p>}
                      </td>

                      <td className="px-6 py-4">
                        <button onClick={() => copy(employee.walletAddress)} className="flex items-center gap-1 group" title="Click to copy address">
                          <code className="text-sm text-gray-300 font-mono group-hover:text-purple-400 transition-colors">
                            {sliceAddress(employee.walletAddress)}
                          </code>
                          {copiedAddress === employee.walletAddress
                            ? <CheckCircle2 className="w-3 h-3 text-green-400" />
                            : <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{formatCurrency(employee.payUsd)}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{formatDate(employee.dateAdded)}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEmployeeToEdit(employee)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ backgroundColor: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => setEmployeeToDelete(employee)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
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
      <EmployeeModal
        isOpen={showAddModal || Boolean(employeeToEdit)}
        onClose={() => { setShowAddModal(false); setEmployeeToEdit(null); }}
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

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: 'rgba(26,27,34,0.95)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <div>
              <h2 className="text-lg font-bold text-white">Remove Employee</h2>
              <p className="text-sm text-gray-400 mt-1">
                Are you sure you want to remove{' '}
                <span className="text-white font-medium">{employeeToDelete.name}</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEmployeeToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: 'rgba(239,68,68,0.8)', color: 'white' }}
              >
                {isDeleting ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;