// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface UserProfile {
  id: string
  email?: string
  wallet_address?: string
  display_name?: string
  avatar_url?: string
  auth_provider: 'wallet' | 'google' | 'magic_link'
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: {
    id: string
    email?: string
    user_metadata?: Record<string, any>
  }
  access_token: string
  refresh_token: string
}