import { supabase } from '@/lib/Supabase'
import type { Employee } from '@/types/EmployeeModel'

export interface DatabaseEmployee {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
  role: string
  department: string
  wallet_address: string
  avatar_url: string | null
  salary: number
  salary_currency: string
  payment_frequency: string
  employment_type: string
  status: string
  join_date: string
  termination_date: string | null
  last_payment_date: string | null
  total_paid: number
  created_at: string
  updated_at: string
  payment_count?: number
}

export interface CreateEmployeeData {
  name: string
  email: string
  phone?: string
  role: string
  department: string
  wallet_address: string
  salary: number
  salary_currency?: string
  payment_frequency?: string
  employment_type?: string
  join_date?: string
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  status?: string
  termination_date?: string
}

export interface PaymentRecord {
  id: string
  employee_id: string
  amount: number
  currency: string
  tx_hash: string | null
  status: string
  payment_date: string
  gas_used: number | null
  notes: string | null
}

// Transform database employee to frontend Employee type
function transformDbEmployee(dbEmployee: DatabaseEmployee): Employee {
  return {
    id: parseInt(dbEmployee.id.replace(/-/g, '').slice(0, 8), 16), // Convert UUID to number for compatibility
    name: dbEmployee.name,
    email: dbEmployee.email,
    phone: dbEmployee.phone || '',
    role: dbEmployee.role,
    department: dbEmployee.department,
    walletAddress: dbEmployee.wallet_address,
    avatar: dbEmployee.avatar_url,
    salary: dbEmployee.salary,
    paymentFrequency: dbEmployee.payment_frequency as any,
    employmentType: dbEmployee.employment_type as any,
    status: dbEmployee.status as any,
    joinDate: new Date(dbEmployee.join_date),
    lastPayment: dbEmployee.last_payment_date ? new Date(dbEmployee.last_payment_date) : undefined,
    totalPaid: dbEmployee.total_paid,
    paymentHistory: [] // Will be loaded separately if needed
  }
}

export class EmployeeService {
  /**
   * Get all employees for the authenticated user
   */
  static async getUserEmployees(userWalletAddress: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_employees', { 
          user_wallet_address: userWalletAddress.toLowerCase() 
        })

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
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('wallet_users')
        .select('id')
        .eq('wallet_address', userWalletAddress.toLowerCase())
        .single()

      if (userError || !userData) {
        throw new Error('User not found')
      }

      // Create the employee
      const { data, error } = await supabase
        .from('employees')
        .insert({
          user_id: userData.id,
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          role: employeeData.role,
          department: employeeData.department,
          wallet_address: employeeData.wallet_address.toLowerCase(),
          salary: employeeData.salary,
          salary_currency: employeeData.salary_currency || 'ETH',
          payment_frequency: employeeData.payment_frequency || 'Monthly',
          employment_type: employeeData.employment_type || 'Full-time',
          join_date: employeeData.join_date || new Date().toISOString().split('T')[0]
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
      // Get user ID for security
      const { data: userData, error: userError } = await supabase
        .from('wallet_users')
        .select('id')
        .eq('wallet_address', userWalletAddress.toLowerCase())
        .single()

      if (userError || !userData) {
        throw new Error('User not found')
      }

      // Prepare update data
      const updateData: any = {}
      if (updates.name) updateData.name = updates.name
      if (updates.email) updateData.email = updates.email
      if (updates.phone !== undefined) updateData.phone = updates.phone
      if (updates.role) updateData.role = updates.role
      if (updates.department) updateData.department = updates.department
      if (updates.wallet_address) updateData.wallet_address = updates.wallet_address.toLowerCase()
      if (updates.salary !== undefined) updateData.salary = updates.salary
      if (updates.salary_currency) updateData.salary_currency = updates.salary_currency
      if (updates.payment_frequency) updateData.payment_frequency = updates.payment_frequency
      if (updates.employment_type) updateData.employment_type = updates.employment_type
      if (updates.status) updateData.status = updates.status
      if (updates.join_date) updateData.join_date = updates.join_date
      if (updates.termination_date) updateData.termination_date = updates.termination_date

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employeeId)
        .eq('user_id', userData.id) // Ensure user owns this employee
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
      // Get user ID for security
      const { data: userData, error: userError } = await supabase
        .from('wallet_users')
        .select('id')
        .eq('wallet_address', userWalletAddress.toLowerCase())
        .single()

      if (userError || !userData) {
        throw new Error('User not found')
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId)
        .eq('user_id', userData.id) // Ensure user owns this employee

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
      // Get user ID for security
      const { data: userData, error: userError } = await supabase
        .from('wallet_users')
        .select('id')
        .eq('wallet_address', userWalletAddress.toLowerCase())
        .single()

      if (userError || !userData) {
        throw new Error('User not found')
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('user_id', userData.id)
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
   * Record a payment for an employee
   */
  static async recordPayment(
    employeeId: string,
    amount: number,
    currency: string = 'ETH',
    txHash?: string,
    userWalletAddress?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('record_payment', {
          employee_id_param: employeeId,
          amount_param: amount,
          currency_param: currency,
          tx_hash_param: txHash,
          user_wallet_address: userWalletAddress?.toLowerCase()
        })

      if (error) {
        console.error('Error recording payment:', error)
        throw new Error(`Failed to record payment: ${error.message}`)
      }

      return data // Returns payment ID
    } catch (error) {
      console.error('Error in recordPayment:', error)
      throw error
    }
  }

  /**
   * Get payment history for an employee
   */
  static async getEmployeePaymentHistory(
    employeeId: string,
    userWalletAddress: string
  ): Promise<PaymentRecord[]> {
    try {
      // Get user ID for security
      const { data: userData, error: userError } = await supabase
        .from('wallet_users')
        .select('id')
        .eq('wallet_address', userWalletAddress.toLowerCase())
        .single()

      if (userError || !userData) {
        throw new Error('User not found')
      }

      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('user_id', userData.id)
        .order('payment_date', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch payment history: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error in getEmployeePaymentHistory:', error)
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
      const activeEmployees = employees.filter(emp => emp.status === 'Active').length
      const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0)
      const totalPaid = employees.reduce((sum, emp) => sum + (emp.totalPaid || 0), 0)

      return {
        totalEmployees,
        activeEmployees,
        totalPayroll,
        totalPaid,
        employees
      }
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      throw error
    }
  }
}