import React, { useState, useMemo } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  ExternalLink, 
  Download, 
  Calendar, 
  Users, 
  Settings,
  AlertTriangle,
  Check,
  Loader2,
  FileText,
  Search,
  X
} from 'lucide-react';
import { type PayrollEmployee, mockPayrollEmployees, type PayrollRun, availableCurrencies, mockPayrollRuns } from '../../Data/MockPayrollData';

const PayrollPage: React.FC = () => {
  // State management
  const [employees, setEmployees] = useState<PayrollEmployee[]>(mockPayrollEmployees);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [payrollFrequency, setPayrollFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Filtered employees based on search and filter
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, departmentFilter]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    return [...new Set(employees.map(emp => emp.department))];
  }, [employees]);

  // Calculate totals
  const calculations = useMemo(() => {
    const selectedEmps = employees.filter(emp => selectedEmployees.includes(emp.id));
    const totalGross = selectedEmps.reduce((sum, emp) => sum + emp.salary, 0);
    const totalNet = selectedEmps.reduce((sum, emp) => sum + emp.netPay, 0);
    const totalTax = selectedEmps.reduce((sum, emp) => sum + (emp.salary * emp.taxRate), 0);
    const totalDeductions = selectedEmps.reduce((sum, emp) => sum + emp.deductionsAmount, 0);
    const estimatedGas = selectedEmps.length * 0.002; // Mock gas calculation

    return {
      totalGross,
      totalNet,
      totalTax,
      totalDeductions,
      estimatedGas,
      employeeCount: selectedEmps.length
    };
  }, [selectedEmployees, employees]);

  // Utility functions
  const shortenAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatCurrency = (amount: number, symbol: string = selectedCurrency) => 
    `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;

  const formatDate = (date: Date) => 
    date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Event handlers
  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleEmployeeSelect = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleRunPayroll = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to pay.');
      return;
    }
    setShowConfirmModal(true);
  };

  const executePayroll = async () => {
    setIsProcessing(true);
    setShowConfirmModal(false);

    // Update employee statuses to processing
    setEmployees(prev => prev.map(emp => 
      selectedEmployees.includes(emp.id) 
        ? { ...emp, payrollStatus: 'processing' as const }
        : emp
    ));

    // Simulate batch transaction processing with delays
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate random success/failure for demo
    setEmployees(prev => prev.map(emp => {
      if (selectedEmployees.includes(emp.id)) {
        const success = Math.random() > 0.1; // 90% success rate
        return { ...emp, payrollStatus: success ? 'success' as const : 'failed' as const };
      }
      return emp;
    }));

    setIsProcessing(false);
    setSelectedEmployees([]);
  };

  const getStatusBadge = (status: PayrollEmployee['payrollStatus']) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: 'Pending' },
      processing: { icon: Loader2, color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Processing' },
      success: { icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200', text: 'Success' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200', text: 'Failed' }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className={`w-3 h-3 mr-1 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {config.text}
      </span>
    );
  };

  const getRunStatusBadge = (status: PayrollRun['status']) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-700', text: 'Completed' },
      failed: { color: 'bg-red-100 text-red-700', text: 'Failed' },
      partial: { color: 'bg-orange-100 text-orange-700', text: 'Partial' }
    };

    const config = statusConfig[status];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
            <p className="text-gray-600 mt-1">Manage batch payments and team payroll runs</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableCurrencies.map(currency => (
                <option key={currency.symbol} value={currency.symbol}>
                  {currency.symbol} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payroll Setup Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Run Payroll</h2>
                <p className="text-gray-600 text-sm">Select employees and process batch payments</p>
              </div>
              <button
                onClick={handleRunPayroll}
                disabled={selectedEmployees.length === 0 || isProcessing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Payroll ({selectedEmployees.length})
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleEmployeeSelect(employee.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.role}</div>
                        <div className="text-xs text-gray-400">{employee.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600">
                          {shortenAddress(employee.walletAddress)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(employee.walletAddress)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <a
                          href={`https://etherscan.io/address/${employee.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(employee.salary)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(employee.taxRate * 100).toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(employee.deductionsAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(employee.netPay)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(employee.payrollStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payroll Summary */}
          {selectedEmployees.length > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Employees Selected</div>
                  <div className="text-lg font-semibold text-gray-900">{calculations.employeeCount}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Total Gross</div>
                  <div className="text-lg font-semibold text-gray-900">{formatCurrency(calculations.totalGross)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Total Net</div>
                  <div className="text-lg font-semibold text-green-600">{formatCurrency(calculations.totalNet)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Est. Gas Fee</div>
                  <div className="text-lg font-semibold text-gray-900">{calculations.estimatedGas.toFixed(4)} ETH</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recurring Schedule Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payroll Schedule</h2>
            <p className="text-gray-600 text-sm">Set up automatic recurring payments</p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={payrollFrequency}
                  onChange={(e) => setPayrollFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Run Date</label>
                <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Sep 15, 2025 10:00 AM</span>
                </div>
              </div>
              <div className="flex items-end">
                <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll History Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payroll History</h2>
            <p className="text-gray-600 text-sm">Previous payroll runs and transaction records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockPayrollRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(run.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        {run.employeesCount} employees
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(run.totalNetAmount, run.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Gross: {formatCurrency(run.totalGrossAmount, run.currency)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRunStatusBadge(run.status)}
                    </td>
                    <td className="px-6 py-4">
                      {run.batchTxHash ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-600">
                            {shortenAddress(run.batchTxHash)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(run.batchTxHash!)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${run.batchTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No transaction</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(run.invoiceUrl, '_blank')}
                          className="text-gray-400 hover:text-gray-600"
                          title="Download Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(run.reportUrl, '_blank')}
                          className="text-gray-400 hover:text-gray-600"
                          title="Download CSV Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Payroll Run</h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Confirm Batch Payment</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You are about to process payroll for {calculations.employeeCount} employees.
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Employees:</span>
                    <span className="ml-2 font-medium">{calculations.employeeCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Currency:</span>
                    <span className="ml-2 font-medium">{selectedCurrency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Net Amount:</span>
                    <span className="ml-2 font-medium text-green-600">{formatCurrency(calculations.totalNet)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Est. Gas Fee:</span>
                    <span className="ml-2 font-medium">{calculations.estimatedGas.toFixed(4)} ETH</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executePayroll}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Confirm & Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;