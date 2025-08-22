import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  User,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  Building,
  Clock,
  FileText
} from 'lucide-react';
import type { Employee } from '../../models/EmployeeModel';
import { mockEmployees } from '../../Data/MockData';
import { EmployeeFormModal } from './EmployeeFormModal';
import { getStatusColor } from '../../utils/team/getStatusColor';


const TeamManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<keyof Employee>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique departments and statuses for filters
  const departments = [...new Set(employees.map(emp => emp.department))];
  const statuses = ['Active', 'Inactive', 'Terminated'];

  // Filter and search logic
  React.useEffect(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
      const matchesStatus = !filterStatus || employee.status === filterStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
      if (bValue == null) return sortOrder === 'asc' ? 1 : -1;
      
      // Handle Date objects
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Compare values
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [employees, searchTerm, filterDepartment, filterStatus, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handleSort = (column: keyof Employee) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employeeId: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id' | 'joinDate' | 'paymentHistory'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: Date.now(),
      joinDate: new Date(),
      paymentHistory: []
    };
    setEmployees(prev => [...prev, newEmployee]);
    setShowAddModal(false);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Role', 'Department', 'Wallet Address', 
      'Salary (ETH)', 'Payment Frequency', 'Employment Type', 'Status', 'Join Date'
    ];
    
    const csvContent = [
      headers.join(','),
      ...employees.map(emp => [
        emp.name,
        emp.email,
        emp.phone,
        emp.role,
        emp.department,
        emp.walletAddress,
        emp.salary,
        emp.paymentFrequency,
        emp.employmentType,
        emp.status,
        emp.joinDate.toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const importedEmployees = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',');
          return {
            id: Date.now() + index,
            name: values[0]?.trim() || '',
            email: values[1]?.trim() || '',
            phone: values[2]?.trim() || '',
            role: values[3]?.trim() || '',
            department: values[4]?.trim() || '',
            walletAddress: values[5]?.trim() || '',
            salary: parseFloat(values[6]) || 0,
            paymentFrequency: (values[7]?.trim() as any) || 'Bi-weekly',
            employmentType: (values[8]?.trim() as any) || 'Full-time',
            status: (values[9]?.trim() as any) || 'Active',
            joinDate: new Date(values[10]?.trim() || Date.now()),
            avatar: null,
            paymentHistory: []
          };
        });

      setEmployees(prev => [...prev, ...importedEmployees]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage your employees and their crypto wallet information</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'role', label: 'Role' },
                  { key: 'department', label: 'Department' },
                  { key: 'walletAddress', label: 'Wallet Address' },
                  { key: 'salary', label: 'Salary (ETH)' },
                  { key: 'employmentType', label: 'Employment Type' },
                  { key: 'status', label: 'Status' },
                  { key: 'joinDate', label: 'Join Date' },
                ].map(column => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof Employee)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {sortBy === column.key && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {employee.walletAddress.slice(0, 8)}...{employee.walletAddress.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {employee.salary} ETH
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.employmentType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.joinDate.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} results
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Detail Drawer */}
      {showEmployeeDetail && selectedEmployee && (
        <EmployeeDetailDrawer
          employee={selectedEmployee}
          onClose={() => {
            setShowEmployeeDetail(false);
            setSelectedEmployee(null);
          }}
          onEdit={() => {
            setShowEmployeeDetail(false);
            setShowEditModal(true);
          }}
        />
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <EmployeeFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEmployee}
          title="Add New Employee"
        />
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <EmployeeFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          onSave={handleUpdateEmployee}
          employee={selectedEmployee}
          title="Edit Employee"
        />
      )}
    </div>
  );
};

// Employee Detail Drawer Component
const EmployeeDetailDrawer: React.FC<{
  employee: Employee;
  onClose: () => void;
  onEdit: () => void;
}> = ({ employee, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-2xl overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
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
                  src={employee.avatar}
                  alt={employee.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{employee.name}</h3>
              <p className="text-lg text-gray-600">{employee.role}</p>
              <p className="text-sm text-gray-500">{employee.department}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(employee.status)}`}>
                {employee.status}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
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

          {/* Payroll Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payroll Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="text-xl font-bold text-gray-900">{employee.salary} ETH</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Payment Frequency</p>
                  <p className="text-gray-900">{employee.paymentFrequency}</p>
                </div>
              </div>
              <div className="col-span-full">
                <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
                <p className="text-gray-900 font-mono text-sm bg-white px-3 py-2 rounded border">
                  {employee.walletAddress}
                </p>
              </div>
              {employee.totalPaid && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total Paid</p>
                    <p className="text-lg font-semibold text-green-600">{employee.totalPaid} ETH</p>
                  </div>
                </div>
              )}
              {employee.lastPayment && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Last Payment</p>
                    <p className="text-gray-900">{employee.lastPayment.toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h4>
            {employee.paymentHistory && employee.paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {employee.paymentHistory.map((payment) => (
                  <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          payment.status === 'Completed' ? 'bg-green-500' : 
                          payment.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{payment.amount} ETH</p>
                          <p className="text-sm text-gray-500">{payment.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Transaction Hash</p>
                        <p className="text-sm font-mono text-gray-900">{payment.txHash}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No payment history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default TeamManagementPage;