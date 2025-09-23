import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Enhanced Supabase client with proper typing
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // We handle auth manually via wallet signatures
    persistSession: false,   // No traditional sessions
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
})

// Authentication service class for wallet-based auth
export class WalletAuthService {
  
  /**
   * Create or get user by wallet address
   */
  static async getOrCreateUser(walletAddress: string) {
    const normalizedAddress = walletAddress.toLowerCase()
    
    const { data, error } = await supabase
      .from('wallet_users')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // User doesn't exist, return null
      return { data: null, error: null, isNewUser: true }
    }
    
    if (error) {
      return { data: null, error, isNewUser: false }
    }
    
    return { data, error: null, isNewUser: false }
  }

  /**
   * Create new user account after terms acceptance
   */
  static async createUser(params: {
    walletAddress: string
    termsVersion: string
    signatureNonce: string
  }) {
    const { walletAddress, termsVersion, signatureNonce } = params
    
    const { data, error } = await supabase
      .from('wallet_users')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        terms_accepted: true,
        terms_version: termsVersion,
        signature_nonce: signatureNonce,
        last_login: new Date().toISOString()
      })
      .select()
      .single()
    
    return { data, error }
  }

  /**
   * Update user's last login and signature nonce
   */
  static async updateUserLogin(userId: string, signatureNonce: string) {
    const { data, error } = await supabase
      .from('wallet_users')
      .update({
        signature_nonce: signatureNonce,
        last_login: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  }

  /**
   * Verify signature using Supabase RPC function
   */
  static async verifySignature(params: {
    walletAddress: string
    message: string
    signature: string
    nonce: string
  }) {
    const { walletAddress, message, signature, nonce } = params
    
    const { data, error } = await supabase
      .rpc('verify_signature', {
        wallet_address: walletAddress.toLowerCase(),
        message,
        signature,
        nonce
      })
    
    return { data, error }
  }

  /**
   * Get user's employees with proper filtering
   */
  static async getUserEmployees(userId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }

  /**
   * Create employee for user
   */
  static async createEmployee(params: {
    userId: string
    name: string
    email?: string
    walletAddress: string
    salaryAmount: number
    salaryCurrency: string
    paymentFrequency: string
  }) {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        user_id: params.userId,
        name: params.name,
        email: params.email,
        wallet_address: params.walletAddress.toLowerCase(),
        salary_amount: params.salaryAmount,
        salary_currency: params.salaryCurrency,
        payment_frequency: params.paymentFrequency
      })
      .select()
      .single()
    
    return { data, error }
  }

  /**
   * Update employee
   */
  static async updateEmployee(employeeId: string, updates: Partial<{
    name: string
    email: string
    walletAddress: string
    salaryAmount: number
    salaryCurrency: string
    paymentFrequency: string
  }>) {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.walletAddress && { wallet_address: updates.walletAddress.toLowerCase() }),
        ...(updates.salaryAmount && { salary_amount: updates.salaryAmount }),
        ...(updates.salaryCurrency && { salary_currency: updates.salaryCurrency }),
        ...(updates.paymentFrequency && { payment_frequency: updates.paymentFrequency }),
      })
      .eq('id', employeeId)
      .select()
      .single()
    
    return { data, error }
  }

  /**
   * Delete employee
   */
  static async deleteEmployee(employeeId: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId)
    
    return { error }
  }
}

// Utility functions for database operations
export const dbUtils = {
  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('wallet_users')
        .select('count')
        .limit(1)
      
      return { success: !error, error }
    } catch (error) {
      return { success: false, error }
    }
  },

  /**
   * Get database health status
   */
  async getHealthStatus() {
    try {
      const start = Date.now()
      await this.testConnection()
      const responseTime = Date.now() - start
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
}

export default supabase