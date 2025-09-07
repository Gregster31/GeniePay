// contexts/AuthContext.tsx - Complete auth with proper Supabase saving
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { supabase, type UserProfile, type AuthSession } from '../lib/supabase'

interface AuthContextType {
  // Supabase auth state
  session: AuthSession | null
  profile: UserProfile | null
  isLoading: boolean
  
  // Wallet state
  isWalletConnected: boolean
  walletAddress?: string
  
  // Combined connection state
  isConnected: boolean
  connectionType: 'none' | 'wallet' | 'google' | 'magic_link'
  
  // Auth methods
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithWallet: (address: string, signature: string) => Promise<void>
  signOut: () => Promise<void>
  disconnectWallet: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Supabase auth state
  const [session, setSession] = useState<AuthSession | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Wagmi wallet state
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount()
  const { disconnect } = useDisconnect()

  // Combined state - Only connected if we have a Supabase session
  const isConnected = !!session
  const connectionType: AuthContextType['connectionType'] = 
    session?.user ? 
      (profile?.auth_provider || 'none') : 
      'none'

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 Initializing auth state...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('📋 Initial session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        error 
      })
      setSession(session as AuthSession | null)
      if (session) {
        fetchUserProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, { 
          hasSession: !!session,
          userId: session?.user?.id 
        })
        setSession(session as AuthSession | null)
        
        if (session) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('❌ Error fetching profile:', error)
        return
      }

      console.log('✅ Profile fetched:', data)
      setProfile(data)
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
    }
  }

  // Create or update user profile
  const upsertProfile = async (
    userId: string, 
    profileData: Partial<UserProfile>
  ) => {
    try {
      console.log('💾 Creating/updating profile:', { userId, profileData })
      
      const profileToSave = {
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileToSave)
        .select()
        .single()

      if (error) {
        console.error('❌ Profile upsert error:', error)
        throw error
      }

      console.log('✅ Profile saved successfully:', data)
      setProfile(data)
      return data
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      throw error
    }
  }

  // Google OAuth sign in
  const signInWithGoogle = async () => {
    try {
      console.log('🌐 Starting Google OAuth sign in...')
      setIsLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('❌ Google OAuth error:', error)
        throw error
      }
      
      console.log('✅ Google OAuth initiated')
    } catch (error) {
      console.error('❌ Error with Google sign in:', error)
      setIsLoading(false)
      throw error
    }
  }

  // Magic link sign in
  const signInWithMagicLink = async (email: string) => {
    try {
      console.log('✉️ Starting magic link sign in for:', email)
      setIsLoading(true)
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('❌ Magic link error:', error)
        throw error
      }
      
      console.log('✅ Magic link sent successfully')
    } catch (error) {
      console.error('❌ Error with magic link:', error)
      setIsLoading(false)
      throw error
    }
  }

  // Wallet sign in - Create anonymous user and save wallet data
  const signInWithWallet = async (address: string, signature: string) => {
    try {
      console.log('🦊 Starting wallet sign in for address:', address)
      console.log('✍️ Signature received:', signature.slice(0, 20) + '...')
      setIsLoading(true)
      
      // Step 1: Create anonymous user session in Supabase
      console.log('📝 Creating anonymous user session...')
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
      
      if (authError) {
        console.error('❌ Failed to create anonymous session:', authError)
        throw authError
      }
      
      if (!authData.user) {
        throw new Error('No user returned from anonymous sign in')
      }
      
      console.log('✅ Anonymous session created for user:', authData.user.id)
      
      // Step 2: Save wallet data to user_profiles table
      console.log('💾 Saving wallet data to profile...')
      await upsertProfile(authData.user.id, {
        wallet_address: address,
        display_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        auth_provider: 'wallet',
        email: null // Wallet connections don't have email
      })
      
      console.log('🎉 Wallet sign in completed successfully!')
      
    } catch (error) {
      console.error('❌ Wallet sign in failed:', error)
      setIsLoading(false)
      throw error
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...')
      setIsLoading(true)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('⚠️ Supabase signOut error (continuing anyway):', error)
      }
      
      // Clear local state
      setSession(null)
      setProfile(null)
      
      console.log('✅ Sign out completed')
    } catch (error) {
      console.error('❌ Error during sign out:', error)
      // Don't throw here, always complete the sign out
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    console.log('🔌 Disconnecting wallet...')
    disconnect()
  }

  const value: AuthContextType = {
    session,
    profile,
    isLoading,
    isWalletConnected,
    walletAddress,
    isConnected,
    connectionType,
    signInWithGoogle,
    signInWithMagicLink,
    signInWithWallet,
    signOut,
    disconnectWallet
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}