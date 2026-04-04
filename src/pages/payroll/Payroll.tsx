import React, { useState, useMemo } from 'react';
import { UserPlus, Send, Copy, CheckCircle2, FileUp, Pencil, Trash2, Check, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import type { Employee } from '@/models/EmployeeModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { formatCurrency, formatDate } from '@/utils/Format';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { EmployeeModal } from '@/pages/payroll/EmployeeModal';
import { BatchPaymentModal } from '@/pages/payroll/BatchPaymentModal';
import { CSVImportModal } from '@/pages/payroll/CsvImportModal';
import { useAuth } from '@/contexts/AuthContext';
import { PageShell } from '@/components/layout/PageShell';

export const Payroll: React.FC = () => {
  const { employees, addEmployee, updateEmployee, removeEmployee } = useAuth();
  const [selectedIds, setSelectedIds]           = useState<string[]>([]);
  const [showAddModal, setShowAddModal]          = useState(false);
  const [showBatchModal, setShowBatchModal]      = useState(false);
  const [showCSVModal, setShowCSVModal]          = useState(false);
  const [employeeToEdit, setEmployeeToEdit]      = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete]  = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting]              = useState(false);
  const [groupByDept, setGroupByDept]            = useState(false);
  const [collapsedDepts, setCollapsedDepts]      = useState<Set<string>>(new Set());
  const { copy, copiedKey: copiedAddress }       = useCopyToClipboard();

  const selectedEmployees = employees.filter(emp => selectedIds.includes(emp.id));
  const totalAmount       = selectedEmployees.reduce((sum, emp) => sum + emp.payUsd, 0);
  const allSelected       = employees.length > 0 && selectedIds.length === employees.length;
  const hasSelection      = selectedIds.length > 0;

  const toggleEmployee  = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? [] : employees.map(e => e.id));

  // Department grouping
  const grouped = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const emp of employees) {
      const dept = emp.department?.trim() || 'Uncategorized';
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept)!.push(emp);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });
  }, [employees]);

  const toggleDept = (dept: string, deptEmployees: Employee[]) => {
    const ids = deptEmployees.map(e => e.id);
    const allDeptSelected = ids.every(id => selectedIds.includes(id));
    setSelectedIds(prev =>
      allDeptSelected
        ? prev.filter(id => !ids.includes(id))
        : [...new Set([...prev, ...ids])]
    );
  };

  const toggleCollapse = (dept: string) =>
    setCollapsedDepts(prev => {
      const next = new Set(prev);
      next.has(dept) ? next.delete(dept) : next.add(dept);
      return next;
    });

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

  const actions = (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
      <button onClick={() => setShowCSVModal(true)} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style={{ backgroundColor: 'rgba(93,0,242,0.08)', border: '1px solid rgba(93,0,242,0.25)', color: '#a78bfa' }}>
        <FileUp className="w-4 h-4 shrink-0" /> Import CSV
      </button>
      <button onClick={() => setShowAddModal(true)} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style={{ backgroundColor: 'rgba(93,0,242,0.10)', border: '1px solid rgba(93,0,242,0.30)', color: '#a78bfa' }}>
        <UserPlus className="w-4 h-4 shrink-0" /> Add Employee
      </button>
      <button
        onClick={() => setGroupByDept(p => !p)}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          backgroundColor: groupByDept ? 'rgba(93,0,242,0.18)' : 'rgba(93,0,242,0.06)',
          border: groupByDept ? '1px solid rgba(93,0,242,0.5)' : '1px solid rgba(93,0,242,0.20)',
          color: groupByDept ? '#c4b5fd' : '#a78bfa',
        }}>
        <Layers className="w-4 h-4 shrink-0" />
        {groupByDept ? 'Ungrouped' : 'By Dept'}
      </button>
      <button onClick={() => setShowBatchModal(true)} disabled={!hasSelection}
        className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: hasSelection ? 'rgba(93,0,242,0.9)' : 'rgba(255,255,255,0.05)', border: hasSelection ? '1px solid rgba(93,0,242,0.5)' : '1px solid rgba(255,255,255,0.1)', color: hasSelection ? '#fff' : '#6b7280' }}>
        <Send className="w-4 h-4 shrink-0" />
        {hasSelection ? `Run Payroll (${selectedIds.length})` : 'Run Payroll'}
      </button>
    </div>
  );

  return (
    <PageShell title="Payroll" subtitle="Manage employees and run batch payments" actions={actions}>

      {/* Table card */}
      <div className="rounded-xl border border-gray-200 dark:border-[#2e2d38] bg-white dark:bg-[#15141a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#1a1821] border-b border-gray-200 dark:border-[#2e2d38]">
                {/* Select all */}
                <th className="px-5 py-3.5 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className={[
                      'w-5 h-5 rounded flex items-center justify-center transition-all border',
                      allSelected
                        ? 'bg-[#5D00F2] border-[#5D00F2]'
                        : 'bg-white dark:bg-[#1c1b22] border-gray-300 dark:border-[#44414c] hover:border-[#5D00F2] dark:hover:border-[#5D00F2]',
                    ].join(' ')}
                    title={allSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </button>
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">Name</th>
                <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">Role</th>
                <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">Wallet</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">Pay / mo</th>
                <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">Added</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#5D00F2]/10 border border-[#5D00F2]/20">
                        <UserPlus className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">No employees yet</p>
                        <p className="text-sm text-gray-500">Add your first employee to get started</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : groupByDept ? (
                grouped.map(([dept, deptEmployees]) => {
                  const isCollapsed      = collapsedDepts.has(dept);
                  const deptIds          = deptEmployees.map(e => e.id);
                  const allDeptSelected  = deptIds.every(id => selectedIds.includes(id));
                  const someDeptSelected = deptIds.some(id => selectedIds.includes(id));
                  const deptTotal        = deptEmployees.reduce((s, e) => s + e.payUsd, 0);

                  return (
                    <React.Fragment key={dept}>
                      {/* Department header row */}
                      <tr className="bg-[#5D00F2]/[0.06] dark:bg-[#5D00F2]/[0.10] border-b border-t border-[#5D00F2]/20">
                        {/* Group checkbox */}
                        <td className="px-5 py-2.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => toggleDept(dept, deptEmployees)}
                            className={[
                              'w-5 h-5 rounded flex items-center justify-center transition-all border',
                              allDeptSelected
                                ? 'bg-[#5D00F2] border-[#5D00F2]'
                                : someDeptSelected
                                  ? 'bg-[#5D00F2]/40 border-[#5D00F2]'
                                  : 'bg-white dark:bg-[#1c1b22] border-gray-300 dark:border-[#44414c] hover:border-[#5D00F2]',
                            ].join(' ')}
                          >
                            {(allDeptSelected || someDeptSelected) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </button>
                        </td>

                        {/* Dept name + count + total */}
                        <td colSpan={5} className="px-2 py-2.5">
                          <button
                            onClick={() => toggleCollapse(dept)}
                            className="flex items-center gap-2 group"
                          >
                            {isCollapsed
                              ? <ChevronRight className="w-3.5 h-3.5 text-[#8b6cf7] shrink-0" />
                              : <ChevronDown  className="w-3.5 h-3.5 text-[#8b6cf7] shrink-0" />
                            }
                            <span className="text-xs font-bold uppercase tracking-widest text-[#8b6cf7] group-hover:text-[#c4b5fd] transition-colors">
                              {dept}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-[#6f6b77]">
                              {deptEmployees.length} {deptEmployees.length === 1 ? 'employee' : 'employees'}
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-[#9994a4]">
                              · {formatCurrency(deptTotal)}/mo
                            </span>
                          </button>
                        </td>
                        <td />
                      </tr>

                      {/* Employee rows */}
                      {!isCollapsed && deptEmployees.map((employee, index) => {
                        const isSelected = selectedIds.includes(employee.id);
                        const isLast     = index === deptEmployees.length - 1;
                        return (
                          <tr
                            key={employee.id}
                            onClick={() => toggleEmployee(employee.id)}
                            className={[
                              'transition-colors cursor-pointer',
                              isSelected
                                ? 'bg-[#5D00F2]/[0.05] dark:bg-[#5D00F2]/[0.08]'
                                : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]',
                              !isLast ? 'border-b border-gray-100 dark:border-[#2e2d38]/60' : '',
                            ].join(' ')}
                          >
                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => toggleEmployee(employee.id)}
                                className={[
                                  'w-5 h-5 rounded flex items-center justify-center transition-all border',
                                  isSelected
                                    ? 'bg-[#5D00F2] border-[#5D00F2]'
                                    : 'bg-white dark:bg-[#1c1b22] border-gray-300 dark:border-[#44414c] hover:border-[#5D00F2] dark:hover:border-[#5D00F2]',
                                ].join(' ')}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </button>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</span>
                              {employee.email && <p className="text-xs text-gray-400 dark:text-[#6f6b77] mt-0.5">{employee.email}</p>}
                            </td>
                            <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-600 dark:text-[#c4bfce]">{employee.role}</span>
                            </td>
                            <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-[#5D00F2] dark:text-[#8b6cf7]">{sliceAddress(employee.walletAddress)}</span>
                                <button onClick={() => copy(employee.id, employee.walletAddress)} className="text-gray-400 dark:text-[#6f6b77] hover:text-gray-700 dark:hover:text-[#c4bfce] transition-colors">
                                  {copiedAddress === employee.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(employee.payUsd)}</span>
                            </td>
                            <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500 dark:text-[#6f6b77]">{formatDate(employee.dateAdded)}</span>
                            </td>
                            <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setEmployeeToEdit(employee)} className="p-2 rounded-lg transition-colors text-purple hover:text-purple/80 hover:bg-purple/10" title="Edit">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEmployeeToDelete(employee)} className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]" title="Remove">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                employees.map((employee, index) => {
                  const isSelected = selectedIds.includes(employee.id);
                  const isLast = index === employees.length - 1;
                  return (
                    <tr
                      key={employee.id}
                      onClick={() => toggleEmployee(employee.id)}
                      className={[
                        'transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-[#5D00F2]/[0.05] dark:bg-[#5D00F2]/[0.08]'
                          : 'hover:bg-gray-50 dark:hover:bg-white/[0.03]',
                        !isLast ? 'border-b border-gray-100 dark:border-[#2e2d38]/60' : '',
                      ].join(' ')}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleEmployee(employee.id)}
                          className={[
                            'w-5 h-5 rounded flex items-center justify-center transition-all border',
                            isSelected
                              ? 'bg-[#5D00F2] border-[#5D00F2]'
                              : 'bg-white dark:bg-[#1c1b22] border-gray-300 dark:border-[#44414c] hover:border-[#5D00F2] dark:hover:border-[#5D00F2]',
                          ].join(' ')}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </button>
                      </td>

                      {/* Name */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</span>
                        {employee.email && (
                          <p className="text-xs text-gray-400 dark:text-[#6f6b77] mt-0.5">{employee.email}</p>
                        )}
                      </td>

                      {/* Role */}
                      <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#c4bfce]">{employee.role}</span>
                        {employee.department && (
                          <p className="text-xs text-gray-400 dark:text-[#6f6b77] mt-0.5">{employee.department}</p>
                        )}
                      </td>

                      {/* Wallet */}
                      <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-[#5D00F2] dark:text-[#8b6cf7]">
                            {sliceAddress(employee.walletAddress)}
                          </span>
                          <button
                            onClick={() => copy(employee.id, employee.walletAddress)}
                            className="text-gray-400 dark:text-[#6f6b77] hover:text-gray-700 dark:hover:text-[#c4bfce] transition-colors"
                          >
                            {copiedAddress === employee.id
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Pay */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(employee.payUsd)}
                        </span>
                      </td>

                      {/* Date added */}
                      <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-[#6f6b77]">{formatDate(employee.dateAdded)}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEmployeeToEdit(employee)}
                            className="p-2 rounded-lg transition-colors text-purple hover:text-purple/80 hover:bg-purple/10"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEmployeeToDelete(employee)}
                            className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Selection summary bar */}
        {hasSelection && (
          <div className="px-5 py-3 border-t border-gray-200 dark:border-[#2e2d38] bg-[#5D00F2]/[0.05] dark:bg-[#5D00F2]/[0.08] flex items-center justify-between">
            <span className="text-sm text-[#5D00F2] dark:text-[#8b6cf7] font-medium">
              {selectedIds.length} employee{selectedIds.length !== 1 ? 's' : ''} selected
              <span className="mx-2 text-gray-300 dark:text-[#44414c]">·</span>
              <span className="text-gray-600 dark:text-[#c4bfce]">{formatCurrency(totalAmount)} / mo</span>
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 dark:text-[#6f6b77] hover:text-gray-700 dark:hover:text-[#c4bfce] transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EmployeeModal
        isOpen={showAddModal || Boolean(employeeToEdit)}
        onClose={() => { setShowAddModal(false); setEmployeeToEdit(null); }}
        onAdd={handleAdd}
        onEdit={handleEdit}
        employeeToEdit={employeeToEdit}
      />
      <BatchPaymentModal isOpen={showBatchModal} onClose={() => setShowBatchModal(false)} employees={selectedEmployees} totalAmount={totalAmount} />
      <CSVImportModal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} onImport={handleCSVImport} />

      {/* Delete confirmation */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div>
              <h2 className="text-lg font-bold dark:text-white text-gray-900">Remove Employee</h2>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to remove <span className="dark:text-white text-gray-900 font-medium">{employeeToDelete.name}</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEmployeeToDelete(null)} disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--c-border)', color: '#6b7280' }}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: 'rgba(239,68,68,0.8)', color: 'white' }}>
                {isDeleting ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Payroll;