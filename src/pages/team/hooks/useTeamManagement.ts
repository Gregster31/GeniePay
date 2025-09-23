import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeService } from '@/services/EmployeeService';
import type { Employee } from '@/types/EmployeeModel';
import { useAuth } from '@/hooks/UseAuth';

export const useTeamManagement = () => {
  // Auth
  const { isAuthenticated, walletAddress } = useAuth();
  
  // UI state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
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
    enabled: !!walletAddress && isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Mutation for adding employee
  const addEmployeeMutation = useMutation({
    mutationFn: (employeeData: Omit<Employee, 'id'>) => {
      if (!walletAddress) throw new Error('No wallet connected');
      
      return EmployeeService.createEmployee({
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        role: employeeData.role,
        department: employeeData.department,
        wallet_address: employeeData.walletAddress,
        salary: employeeData.salary,
        payment_frequency: employeeData.paymentFrequency,
        employment_type: employeeData.employmentType,
        join_date: employeeData.joinDate?.toISOString().split('T')[0]
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
    mutationFn: ({ employee, updates }: { employee: Employee, updates: Partial<Employee> }) => {
      if (!walletAddress) throw new Error('No wallet connected');
      
      // Convert Employee updates to database format
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.walletAddress) dbUpdates.wallet_address = updates.walletAddress;
      if (updates.salary !== undefined) dbUpdates.salary = updates.salary;
      if (updates.paymentFrequency) dbUpdates.payment_frequency = updates.paymentFrequency;
      if (updates.employmentType) dbUpdates.employment_type = updates.employmentType;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.joinDate) dbUpdates.join_date = updates.joinDate.toISOString().split('T')[0];
      
      return EmployeeService.updateEmployee(employee.id.toString(), dbUpdates, walletAddress);
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
      const matchesStatus = !filterStatus || employee.status === filterStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
      if (bValue == null) return sortOrder === 'asc' ? 1 : -1;
      
      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
      
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
  }, [searchTerm, filterDepartment, filterStatus, sortBy, sortOrder]);

  // Get unique departments and statuses for filters
  const departments = Array.from(new Set(allEmployees.map(emp => emp.department))).sort();
  const statuses = Array.from(new Set(allEmployees.map(emp => emp.status))).sort();

  // Employee management functions
  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<void> => {
    console.log('🔄 handleAddEmployee called with:', employeeData);
    
    try {
      await addEmployeeMutation.mutateAsync(employeeData);
      console.log('✅ Employee added successfully');
    } catch (error) {
      console.error('❌ Failed to add employee:', error);
      // Re-throw the error so the modal can catch it
      throw error;
    }
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    if (!selectedEmployee) return;
    
    try {
      await updateEmployeeMutation.mutateAsync({
        employee: selectedEmployee,
        updates: updatedEmployee
      });
    } catch (error) {
      // Error is already handled in mutation
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployeeMutation.mutateAsync(employeeId.toString());
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
        'Salary', 'Payment Frequency', 'Employment Type', 'Status', 'Join Date', 'Total Paid'
      ];
      
      const csvData = filteredEmployees.map(emp => [
        emp.name,
        emp.email,
        emp.phone || '',
        emp.role,
        emp.department,
        emp.walletAddress,
        emp.salary,
        emp.paymentFrequency,
        emp.employmentType,
        emp.status,
        emp.joinDate.toISOString().split('T')[0],
        emp.totalPaid || 0
      ]);
      
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
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
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        // Parse CSV and add employees
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length < headers.length) continue;
          
          const employeeData: Omit<Employee, 'id'> = {
            name: values[0],
            email: values[1],
            phone: values[2],
            role: values[3],
            department: values[4],
            walletAddress: values[5],
            salary: parseFloat(values[6]) || 0,
            paymentFrequency: values[7] as any || 'Monthly',
            employmentType: values[8] as any || 'Full-time',
            status: values[9] as any || 'Active',
            joinDate: new Date(values[10]) || new Date(),
            totalPaid: 0,
            paymentHistory: []
          };
          
          // Add employee (this will trigger the mutation)
          handleAddEmployee(employeeData);
        }
        
        alert(`Successfully imported ${lines.length - 1} employees`);
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
    filterStatus,
    currentPage,
    totalPages,
    totalEmployees: filteredEmployees.length,
    departments,
    statuses,
    sortBy,
    sortOrder,
    
    // File handling
    fileInputRef,
    
    // Employee management functions - ADD THESE!
    handleAddEmployee,      // ✅ ADD THIS LINE
    handleUpdateEmployee,   // ✅ ADD THIS LINE  
    handleDeleteEmployee,   // ✅ ADD THIS LINE
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
    setFilterStatus,
    setCurrentPage,
    setShowAddModal,
    setShowEditModal,
  };
};