export interface Database {
  public: {
    Tables: {
      wallet_users: {
        Row: {
          id: string
          wallet_address: string
          terms_accepted: boolean
          terms_version: string
          created_at: string
          updated_at: string
          last_login: string
          signature_nonce: string | null
        }
        Insert: {
          id?: string
          wallet_address: string
          terms_accepted: boolean
          terms_version: string
          created_at?: string
          updated_at?: string
          last_login?: string
          signature_nonce?: string | null
        }
        Update: {
          id?: string
          wallet_address?: string
          terms_accepted?: boolean
          terms_version?: string
          created_at?: string
          updated_at?: string
          last_login?: string
          signature_nonce?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          wallet_address: string
          salary_amount: number
          salary_currency: string
          payment_frequency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          wallet_address: string
          salary_amount: number
          salary_currency: string
          payment_frequency: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          wallet_address?: string
          salary_amount?: number
          salary_currency?: string
          payment_frequency?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verify_signature: {
        Args: {
          wallet_address: string
          message: string
          signature: string
          nonce: string
        }
        Returns: {
          success: boolean
          user_id: string | null
          is_new_user: boolean
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Authentication state types
export type AuthState = 
  | 'disconnected'
  | 'pending_signature'
  | 'pending_terms'
  | 'authenticated'

export interface AuthSession {
  userId: string
  walletAddress: string
  nonce: string
  expiresAt: number
  isNewUser: boolean
}

export interface SignatureData {
  message: string
  signature: string
  nonce: string
  timestamp: number
}