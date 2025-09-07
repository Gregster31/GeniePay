// contexts/AuthContext.tsx
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
  
  // Auth methods
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

  // Combined state - connected when we have both wallet and session
  const isConnected = !!session && isWalletConnected

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
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('❌ Error fetching profile:', error)
        // If profile doesn't exist, that's okay for new users
        if (error.code !== 'PGRST116') {
          throw error
        }
      } else {
        console.log('✅ Profile fetched:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error)
    }
  }

  // Save or update user profile in Supabase
  const upsertProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    try {
      console.log('💾 Upserting profile for user:', userId, profileData)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profileData,
          auth_provider: 'wallet', // Always wallet now
          updated_at: new Date().toISOString()
        })
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
        email: null // Wallet connections don't have email
      })
      
      console.log('🎉 Wallet sign in completed successfully!')
    } catch (error) {
      console.error('❌ Error during wallet sign in:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out - Clear session and disconnect wallet
  const signOut = async () => {
    try {
      console.log('👋 Signing out...')
      setIsLoading(true)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Error signing out from Supabase:', error)
        throw error
      }
      
      // Disconnect wallet
      disconnect()
      
      // Clear local state
      setSession(null)
      setProfile(null)
      
      console.log('✅ Successfully signed out')
    } catch (error) {
      console.error('❌ Error during sign out:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Disconnect wallet (without signing out from Supabase)
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