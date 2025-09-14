import { useState, useEffect, useRef } from 'react';
import { mockEmployees } from '@/data/MockData';
import type { Employee } from '@/types/EmployeeModel';
import { getStatusColor } from '@/utils/team/statusUtils';

export const useTeamManagement = () => {
  // State
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

  // Computed values
  const departments = [...new Set(employees.map(emp => emp.department))];
  const statuses = ['Active', 'Inactive', 'Terminated'];

  // Filter and search logic
  useEffect(() => {
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
      
      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
      
      // Handle strings and numbers
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [employees, searchTerm, filterDepartment, filterStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Employee management functions
  const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      id: Date.now(),
      ...employeeData
    };
    setEmployees(prev => [...prev, newEmployee]);
    setShowAddModal(false);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      setShowEmployeeDetail(false);
      setSelectedEmployee(null);
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
    setShowEmployeeDetail(false);
  };

  const handleCloseDetail = () => {
    setShowEmployeeDetail(false);
    setSelectedEmployee(null);
  };

  const handleSort = (field: keyof Employee) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Department', 'Wallet Address', 'Salary', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.email,
        emp.phone,
        emp.role,
        emp.department,
        emp.walletAddress,
        emp.salary,
        emp.status
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

  // CSV Import
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Simple CSV parsing (in real app, use a proper CSV library)
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        const importedEmployees = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: Date.now() + index,
              name: values[0] || '',
              email: values[1] || '',
              phone: values[2] || '',
              role: values[3] || '',
              department: values[4] || '',
              walletAddress: values[5] || '',
              salary: parseFloat(values[6]) || 0,
              status: (values[7] as Employee['status']) || 'Active',
              paymentFrequency: 'Bi-weekly' as Employee['paymentFrequency'],
              employmentType: 'Full-time' as Employee['employmentType'],
              joinDate: new Date(),
            };
          });

        setEmployees(prev => [...prev, ...importedEmployees]);
      };
      reader.readAsText(file);
    }
  };

  return {
    // State
    employees: paginatedEmployees,
    allEmployees: employees,
    filteredEmployees,
    selectedEmployee,
    showAddModal,
    showEditModal,
    showEmployeeDetail,
    searchTerm,
    filterDepartment,
    filterStatus,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    fileInputRef,

    // Computed values
    departments,
    statuses,
    totalPages,
    totalEmployees: filteredEmployees.length,

    // Actions
    setSearchTerm,
    setFilterDepartment,
    setFilterStatus,
    setCurrentPage,
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleViewEmployee,
    handleEditEmployee,
    handleCloseDetail,
    handleSort,
    handleExportCSV,
    handleImportCSV,
    setShowAddModal,
    setShowEditModal,

    // Utilities
    getStatusColor,
  };
};
