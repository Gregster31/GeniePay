import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeService } from '@/services/EmployeeService';
import type { Employee } from '@/types/EmployeeModel';
import { useAccount } from 'wagmi';

export const useTeamManagement = () => {
  // Auth
  const { address: walletAddress, isConnected } = useAccount();
  
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
  
  const queryClient = useQueryClient();

  // Query for employees from database
  const { 
    data: allEmployees = [], 
    isLoading: employeesLoading, 
    error: employeesError,
    refetch: refetchEmployees 
  } = useQuery({
    queryKey: ['employees', walletAddress],
    queryFn: () => walletAddress ? EmployeeService.getUserEmployees(walletAddress) : Promise.resolve([]),
    enabled: !!walletAddress && isConnected,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for adding employee
  const addEmployeeMutation = useMutation({
    mutationFn: (employeeData: Omit<Employee, 'id' | 'user_id'>) => {
      if (!walletAddress) throw new Error('No wallet connected');
      
      return EmployeeService.createEmployee({
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone || undefined,
        role: employeeData.role,
        department: employeeData.department,
        wallet_address: employeeData.wallet_address,
        salary: employeeData.salary,
        employment_type: employeeData.employment_type,
        avatar_url: employeeData.avatar_url || undefined
      }, walletAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowAddModal(false);
    },
    onError: (error) => {
      console.error('Failed to add employee:', error);
      alert(`Failed to add employee: ${error.message}`);
    }
  });

  // Mutation for updating employee
  const updateEmployeeMutation = useMutation({
    mutationFn: (updatedEmployee: Employee) => {
      if (!walletAddress) throw new Error('No wallet connected');
      
      return EmployeeService.updateEmployee(updatedEmployee.id, {
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone || undefined,
        role: updatedEmployee.role,
        department: updatedEmployee.department,
        wallet_address: updatedEmployee.wallet_address,
        salary: updatedEmployee.salary,
        employment_type: updatedEmployee.employment_type,
        avatar_url: updatedEmployee.avatar_url || undefined
      }, walletAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowEditModal(false);
      setSelectedEmployee(null);
    },
    onError: (error) => {
      console.error('Failed to update employee:', error);
      alert(`Failed to update employee: ${error.message}`);
    }
  });

  // Mutation for deleting employee
  const deleteEmployeeMutation = useMutation({
    mutationFn: (employeeId: string) => {
      if (!walletAddress) throw new Error('No wallet connected');
      return EmployeeService.deleteEmployee(employeeId, walletAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setShowEmployeeDetail(false);
      setSelectedEmployee(null);
    },
    onError: (error) => {
      console.error('Failed to delete employee:', error);
      alert(`Failed to delete employee: ${error.message}`);
    }
  });

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
    
    try {
      await addEmployeeMutation.mutateAsync(employeeData);
      console.log('✅ Employee added successfully');
    } catch (error) {
      console.error('❌ Failed to add employee:', error);
      throw error;
    }
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    try {
      await updateEmployeeMutation.mutateAsync(updatedEmployee);
    } catch (error) {
      // Error is already handled in mutation
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      try {
        await deleteEmployeeMutation.mutateAsync(employeeId);
      } catch (error) {
        // Error is already handled in mutation
      }
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
    isLoading: employeesLoading,
    isAddingEmployee: addEmployeeMutation.isPending,
    isUpdatingEmployee: updateEmployeeMutation.isPending,
    isDeletingEmployee: deleteEmployeeMutation.isPending,
    
    // Error states
    error: employeesError,
    
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