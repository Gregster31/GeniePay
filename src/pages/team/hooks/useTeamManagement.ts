import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import type { Employee } from '@/types/EmployeeModel';

/**
 * Team Management Hook - No Database Version
 * 
 * For MVP without backend:
 * - Stores employees in localStorage (per wallet address)
 * - All CRUD operations work locally
 * - Data persists in browser
 * - Can export/import CSV
 */

// localStorage key helper
const getStorageKey = (walletAddress: string) => `geniepay_employees_${walletAddress.toLowerCase()}`;

export const useTeamManagement = () => {
  // Auth
  const { address: walletAddress, isConnected } = useAccount();
  
  // Employee data (loaded from localStorage)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterEmploymentType, setFilterEmploymentType] = useState('');
  const [sortBy, setSortBy] = useState<keyof Employee>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // File input ref for CSV import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load employees from localStorage when wallet connects
  useEffect(() => {
    if (!walletAddress || !isConnected) {
      setAllEmployees([]);
      setIsLoading(false);
      return;
    }

    try {
      const storageKey = getStorageKey(walletAddress);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const employees = JSON.parse(stored) as Employee[];
        setAllEmployees(employees);
      } else {
        setAllEmployees([]);
      }
    } catch (error) {
      console.error('Failed to load employees from localStorage:', error);
      setAllEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, isConnected]);

  // Save employees to localStorage whenever they change
  const saveEmployees = (employees: Employee[]) => {
    if (!walletAddress) return;

    try {
      const storageKey = getStorageKey(walletAddress);
      localStorage.setItem(storageKey, JSON.stringify(employees));
      setAllEmployees(employees);
    } catch (error) {
      console.error('Failed to save employees to localStorage:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  // Filter and sort employees
  const filteredEmployees = allEmployees
    .filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
      const matchesEmploymentType = !filterEmploymentType || employee.employment_type === filterEmploymentType;
      
      return matchesSearch && matchesDepartment && matchesEmploymentType;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
      if (bValue == null) return sortOrder === 'asc' ? 1 : -1;
      
      // Handle strings and numbers
      let normalizedA = aValue;
      let normalizedB = bValue;
      if (typeof aValue === 'string') normalizedA = aValue.toLowerCase();
      if (typeof bValue === 'string') normalizedB = bValue.toLowerCase();
      
      if (normalizedA < normalizedB) return sortOrder === 'asc' ? -1 : 1;
      if (normalizedA > normalizedB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterEmploymentType, sortBy, sortOrder]);

  // Get unique departments and employment types for filters
  const departments = Array.from(new Set(allEmployees.map(emp => emp.department))).sort();
  const employmentTypes = Array.from(new Set(allEmployees.map(emp => emp.employment_type))).sort();

  // Employee management functions
  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'user_id'>): Promise<void> => {
    console.log('🔄 handleAddEmployee called with:', employeeData);
    
    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    try {
      // Create new employee with generated ID
      const newEmployee: Employee = {
        ...employeeData,
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: walletAddress,
      };

      // Add to array and save
      const updatedEmployees = [...allEmployees, newEmployee];
      saveEmployees(updatedEmployees);
      
      setShowAddModal(false);
      console.log('✅ Employee added successfully');
    } catch (error) {
      console.error('❌ Failed to add employee:', error);
      throw error;
    }
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    try {
      const updatedEmployees = allEmployees.map(emp =>
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      );
      
      saveEmployees(updatedEmployees);
      setShowEditModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert(`Failed to update employee: ${error}`);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!walletAddress) {
      throw new Error('No wallet connected');
    }

    if (!window.confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      return;
    }

    try {
      const updatedEmployees = allEmployees.filter(emp => emp.id !== employeeId);
      saveEmployees(updatedEmployees);
      
      setShowEmployeeDetail(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
      alert(`Failed to delete employee: ${error}`);
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

  // Refetch function (just reloads from localStorage)
  const refetchEmployees = () => {
    if (!walletAddress) return;
    
    try {
      const storageKey = getStorageKey(walletAddress);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const employees = JSON.parse(stored) as Employee[];
        setAllEmployees(employees);
      }
    } catch (error) {
      console.error('Failed to reload employees:', error);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    try {
      const headers = [
        'Name', 'Email', 'Phone', 'Role', 'Department', 'Wallet Address',
        'Salary', 'Employment Type'
      ];
      
      const csvData = filteredEmployees.map(emp => [
        emp.name,
        emp.email,
        emp.phone || '',
        emp.role,
        emp.department,
        emp.wallet_address,
        emp.salary,
        emp.employment_type
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `team_members_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV file');
    }
  };

  // CSV Import
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('CSV file is empty or invalid');
          return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        // Skip header row, start from index 1
        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
            
            if (values.length < 8) continue;
            
            const employeeData: Omit<Employee, 'id' | 'user_id'> = {
              name: values[0],
              email: values[1],
              phone: values[2] || null,
              role: values[3],
              department: values[4],
              wallet_address: values[5],
              salary: parseFloat(values[6]) || 0,
              employment_type: values[7] as 'employee' | 'contractor',
              avatar_url: null
            };
            
            await handleAddEmployee(employeeData);
            successCount++;
          } catch (error) {
            console.error(`Error importing row ${i}:`, error);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          alert(`Successfully imported ${successCount} team member${successCount !== 1 ? 's' : ''}${errorCount > 0 ? `. ${errorCount} failed.` : ''}`);
        } else {
          alert('Failed to import any team members. Please check the CSV format.');
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Failed to import CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    // Data
    employees: paginatedEmployees,
    allEmployees,
    selectedEmployee,
    
    // Loading states
    isLoading,
    isAddingEmployee: false, // No async operations with localStorage
    isUpdatingEmployee: false,
    isDeletingEmployee: false,
    
    // Error states
    error: null, // No async errors with localStorage
    
    // UI state
    showAddModal,
    showEditModal,
    showEmployeeDetail,
    
    // Filters and pagination
    searchTerm,
    filterDepartment,
    filterEmploymentType,
    currentPage,
    totalPages,
    totalEmployees: filteredEmployees.length,
    departments,
    employmentTypes,
    sortBy,
    sortOrder,
    
    // File handling
    fileInputRef,
    
    // Employee management functions
    handleAddEmployee,
    handleUpdateEmployee,
    handleDeleteEmployee,
    handleViewEmployee,
    handleEditEmployee,
    handleCloseDetail,
    handleSort,
    handleExportCSV,
    handleImportCSV,
    refetchEmployees,
    
    // UI setters
    setSearchTerm,
    setFilterDepartment,
    setFilterEmploymentType,
    setCurrentPage,
    setShowAddModal,
    setShowEditModal,
  };
};