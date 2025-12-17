import { supabase } from '@/lib/Supabase'
import type { Employee } from '@/types/EmployeeModel'

export interface CreateEmployeeData {
  name: string
  email: string
  phone?: string
  role: string
  department: string
  wallet_address: string
  salary: number
  employment_type: string // 'employee' or 'contractor'
  avatar_url?: string
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {}

// Transform database employee to frontend Employee type
function transformDbEmployee(dbEmployee: any): Employee {
  return {
    id: dbEmployee.id,
    user_id: dbEmployee.user_id,
    name: dbEmployee.name,
    email: dbEmployee.email,
    phone: dbEmployee.phone || null,
    role: dbEmployee.role,
    department: dbEmployee.department,
    wallet_address: dbEmployee.wallet_address,
    avatar_url: dbEmployee.avatar_url || null,
    salary: dbEmployee.salary,
    employment_type: dbEmployee.employment_type
  }
}

export class EmployeeService {
  /**
   * Get all employees for the authenticated user
   */
  static async getUserEmployees(userWalletAddress: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userWalletAddress.toLowerCase())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching employees:', error)
        throw new Error(`Failed to fetch employees: ${error.message}`)
      }

      return (data || []).map(transformDbEmployee)
    } catch (error) {
      console.error('Error in getUserEmployees:', error)
      throw error
    }
  }

  /**
   * Create a new employee
   */
  static async createEmployee(
    employeeData: CreateEmployeeData,
    userWalletAddress: string
  ): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          user_id: userWalletAddress.toLowerCase(),
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone || null,
          role: employeeData.role,
          department: employeeData.department,
          wallet_address: employeeData.wallet_address.toLowerCase(),
          salary: employeeData.salary,
          employment_type: employeeData.employment_type,
          avatar_url: employeeData.avatar_url || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating employee:', error)
        throw new Error(`Failed to create employee: ${error.message}`)
      }

      return transformDbEmployee(data)
    } catch (error) {
      console.error('Error in createEmployee:', error)
      throw error
    }
  }

  /**
   * Update an existing employee
   */
  static async updateEmployee(
    employeeId: string,
    updates: UpdateEmployeeData,
    userWalletAddress: string
  ): Promise<Employee> {
    try {
      // Prepare update data - only include fields that were provided
      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.email !== undefined) updateData.email = updates.email
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.role !== undefined) updateData.role = updates.role
      if (updates.department !== undefined) updateData.department = updates.department
      if (updates.wallet_address !== undefined) updateData.wallet_address = updates.wallet_address.toLowerCase()
      if (updates.salary !== undefined) updateData.salary = updates.salary
      if (updates.employment_type !== undefined) updateData.employment_type = updates.employment_type
      if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employeeId)
        .eq('user_id', userWalletAddress.toLowerCase()) // Ensure user owns this employee
        .select()
        .single()

      if (error) {
        console.error('Error updating employee:', error)
        throw new Error(`Failed to update employee: ${error.message}`)
      }

      if (!data) {
        throw new Error('Employee not found or you do not have permission to update it')
      }

      return transformDbEmployee(data)
    } catch (error) {
      console.error('Error in updateEmployee:', error)
      throw error
    }
  }

  /**
   * Delete an employee
   */
  static async deleteEmployee(employeeId: string, userWalletAddress: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)
        .eq('user_id', userWalletAddress.toLowerCase()) // Ensure user owns this employee

      if (error) {
        console.error('Error deleting employee:', error)
        throw new Error(`Failed to delete employee: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in deleteEmployee:', error)
      throw error
    }
  }

  /**
   * Get employee by ID
   */
  static async getEmployeeById(employeeId: string, userWalletAddress: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('user_id', userWalletAddress.toLowerCase())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Employee not found
        }
        throw new Error(`Failed to fetch employee: ${error.message}`)
      }

      return transformDbEmployee(data)
    } catch (error) {
      console.error('Error in getEmployeeById:', error)
      throw error
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(userWalletAddress: string) {
    try {
      const employees = await this.getUserEmployees(userWalletAddress)
      
      const totalEmployees = employees.length
      const employeeCount = employees.filter(emp => emp.employment_type === 'employee').length
      const contractorCount = employees.filter(emp => emp.employment_type === 'contractor').length
      const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0)

      return {
        totalEmployees,
        employeeCount,
        contractorCount,
        totalPayroll,
        employees
      }
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      throw error
    }
  }

  /**
   * Bulk delete employees
   */
  static async bulkDeleteEmployees(employeeIds: string[], userWalletAddress: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .in('id', employeeIds)
        .eq('user_id', userWalletAddress.toLowerCase())

      if (error) {
        console.error('Error bulk deleting employees:', error)
        throw new Error(`Failed to delete employees: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in bulkDeleteEmployees:', error)
      throw error
    }
  }

  /**
   * Search employees by name, email, or wallet address
   */
  static async searchEmployees(
    searchTerm: string,
    userWalletAddress: string
  ): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userWalletAddress.toLowerCase())
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,wallet_address.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching employees:', error)
        throw new Error(`Failed to search employees: ${error.message}`)
      }

      return (data || []).map(transformDbEmployee)
    } catch (error) {
      console.error('Error in searchEmployees:', error)
      throw error
    }
  }
}