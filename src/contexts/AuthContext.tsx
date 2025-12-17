import type { AuthContextType, AuthSession } from '@/types/AuthContextType'
import { sliceAddress } from '@/utils/WalletAddressSlicer'
import React, { createContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/Supabase'
import { 
  generateNonce, 
  createSignatureMessage, 
  normalizeWalletAddress,
  isSessionExpired,
  getSessionExpiry,
  TERMS_CONFIG
} from '@/utils/Auth'

// Authentication state for reducer
interface AuthState {
  authState: 'disconnected' | 'pending_signature' | 'pending_terms' | 'authenticated'
  session: AuthSession | null
  error: string | null
  isLoading: boolean
  pendingNonce: string | null
}

// Authentication actions
type AuthAction =
  | { type: 'SET_AUTH_STATE'; payload: AuthState['authState'] }
  | { type: 'SET_SESSION'; payload: AuthSession | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PENDING_NONCE'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }

// Initial state
const initialState: AuthState = {
  authState: 'disconnected',
  session: null,
  error: null,
  isLoading: false,
  pendingNonce: null,
}

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTH_STATE':
      return { ...state, authState: action.payload }
    case 'SET_SESSION':
      return { ...state, session: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_PENDING_NONCE':
      return { ...state, pendingNonce: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider manages wallet connection state and provides authentication context
 * - Tracks wallet connection status and address
 * - Handles signature-based authentication flow
 * - Manages user sessions and terms acceptance
 * - Provides formatted display name and address
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authStateData, dispatch] = useReducer(authReducer, initialState)
  const queryClient = useQueryClient()
  
  // Wagmi hooks
  const { 
    address: walletAddress, 
    isConnected: isWalletConnected,
    chainId,
    isConnecting,
    isReconnecting
  } = useAccount()
  
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { signMessageAsync, isPending: isSigningPending } = useSignMessage()

  // Helper functions
  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // Check if user exists in database
  const { data: existingUser, refetch: refetchUser } = useQuery({
    queryKey: ['user', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null
      
      const { data, error } = await supabase
        .from('wallet_users')
        .select('*')
        .eq('wallet_address', normalizeWalletAddress(walletAddress))
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      return data
    },
    enabled: !!walletAddress && authStateData.authState !== 'disconnected',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const requestSignature = useCallback(async () => {
    if (authStateData.isLoading || isSigningPending) {
      return
    }

    if (!walletAddress) {
      setError('No wallet connected')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const nonce = generateNonce()
      const timestamp = Date.now()
      const message = createSignatureMessage(walletAddress, nonce, timestamp)
      
      dispatch({ type: 'SET_PENDING_NONCE', payload: nonce })
      
      // Request signature - if this succeeds, the user owns the wallet
      const signature = await signMessageAsync({ message })
      
      // Signature is valid if we got here - now check if user exists
      const { data: existingUserData, error: userError } = await supabase
        .from('wallet_users')
        .select('id')
        .eq('wallet_address', normalizeWalletAddress(walletAddress))
        .maybeSingle() // Use maybeSingle instead of single to avoid error on no rows
      
      const isNewUser = !existingUserData
      
      // Create session
      const session: AuthSession = {
        userId: existingUserData?.id || '',
        walletAddress: normalizeWalletAddress(walletAddress),
        nonce,
        expiresAt: getSessionExpiry(),
        isNewUser
      }
      
      dispatch({ type: 'SET_SESSION', payload: session })
      
      // Route to appropriate state
      if (isNewUser) {
        dispatch({ type: 'SET_AUTH_STATE', payload: 'pending_terms' })
      } else {
        // Update last login for existing users
        await supabase
          .from('wallet_users')
          .update({ 
            last_login: new Date().toISOString(),
            signature_nonce: nonce // Store the latest nonce
          })
          .eq('id', existingUserData.id)
        
        dispatch({ type: 'SET_AUTH_STATE', payload: 'authenticated' })
      }
      
    } catch (error: any) {
      console.error('Signature request failed:', error)
      
      if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
        setError('Signature request was rejected. Please sign the message to continue.')
        wagmiDisconnect()
      } else {
        setError(error.message || 'Failed to verify signature')
      }
      
      dispatch({ type: 'SET_AUTH_STATE', payload: 'disconnected' })
      dispatch({ type: 'SET_SESSION', payload: null })
    } finally {
      setLoading(false)
      dispatch({ type: 'SET_PENDING_NONCE', payload: null })
    }
  }, [walletAddress, signMessageAsync, wagmiDisconnect, setError, setLoading, authStateData.isLoading, isSigningPending])

  // Accept terms of service
  const acceptTerms = useCallback(async () => {
    if (!authStateData.session || !walletAddress) {
      setError('No active session')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Create new user account
      const { data, error } = await supabase
        .from('wallet_users')
        .insert({
          wallet_address: normalizeWalletAddress(walletAddress),
          terms_accepted: true,
          terms_version: TERMS_CONFIG.version,
          signature_nonce: authStateData.session.nonce,
          last_login: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        throw new Error(`Failed to create user account: ${error.message}`)
      }
      
      // Update session with user ID
      const updatedSession: AuthSession = {
        ...authStateData.session,
        userId: data.id,
        isNewUser: false
      }
      
      dispatch({ type: 'SET_SESSION', payload: updatedSession })
      dispatch({ type: 'SET_AUTH_STATE', payload: 'authenticated' })
      
      // Invalidate user query to refresh
      queryClient.invalidateQueries({ queryKey: ['user', walletAddress] })
      
    } catch (error: any) {
      console.error('Terms acceptance failed:', error)
      setError(error.message || 'Failed to accept terms')
    } finally {
      setLoading(false)
    }
  }, [authStateData.session, walletAddress, setError, setLoading, queryClient])

  // Decline terms of service
  const declineTerms = useCallback(() => {
    setError('Terms of service must be accepted to use GeniePay')
    // Auto-disconnect and reset state
    wagmiDisconnect()
    dispatch({ type: 'RESET' })
  }, [wagmiDisconnect])

  // Enhanced disconnect function
  const disconnect = useCallback(() => {
    wagmiDisconnect()
    dispatch({ type: 'RESET' })
    queryClient.clear()
  }, [wagmiDisconnect, queryClient])

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (!authStateData.session || !walletAddress) return
    
    // Check if session is expired
    if (isSessionExpired(authStateData.session.expiresAt)) {
      setError('Session expired. Please sign in again.')
      dispatch({ type: 'SET_AUTH_STATE', payload: 'pending_signature' })
      return
    }
    
    // Refresh user data
    await refetchUser()
  }, [authStateData.session, walletAddress, refetchUser, setError])

  // Handle wallet connection changes
  useEffect(() => {
    if (!isWalletConnected || !walletAddress) {
      dispatch({ type: 'RESET' })
      return
    }

    // If wallet is connected but not authenticated, request signature
    if (authStateData.authState === 'disconnected') {
      dispatch({ type: 'SET_AUTH_STATE', payload: 'pending_signature' })
    }
  }, [isWalletConnected, walletAddress, authStateData.authState])

  // Check for existing session on mount
  useEffect(() => {
    if (existingUser && walletAddress && authStateData.authState === 'pending_signature') {
      // User exists, create session without terms flow
      const session: AuthSession = {
        userId: existingUser.id,
        walletAddress: normalizeWalletAddress(walletAddress),
        nonce: existingUser.signature_nonce || '',
        expiresAt: getSessionExpiry(),
        isNewUser: false
      }
      
      dispatch({ type: 'SET_SESSION', payload: session })
      dispatch({ type: 'SET_AUTH_STATE', payload: 'authenticated' })
    }
  }, [existingUser, walletAddress, authStateData.authState])

  // Session expiry check
  useEffect(() => {
    if (!authStateData.session) return
    
    const checkExpiry = () => {
      if (isSessionExpired(authStateData.session!.expiresAt)) {
        setError('Session expired. Please sign in again.')
        dispatch({ type: 'SET_AUTH_STATE', payload: 'pending_signature' })
      }
    }
    
    // Check every minute
    const interval = setInterval(checkExpiry, 60 * 1000)
    return () => clearInterval(interval)
  }, [authStateData.session, setError])

  // Compute authentication status
  const isAuthenticated = authStateData.authState === 'authenticated' && !!authStateData.session && isWalletConnected

  // Memoized context value
  const authValue = useMemo((): AuthContextType => {
    const displayName = walletAddress 
      ? sliceAddress(walletAddress) 
      : 'User'
    
    return {
      // Existing properties
      isWalletConnected,
      walletAddress,
      disconnect,
      displayName,
      displayAddress: walletAddress,
      isAuthenticated,
      chainId,
      isConnecting,
      isReconnecting,
      
      // New authentication properties
      authState: authStateData.authState,
      error: authStateData.error,
      isLoading: authStateData.isLoading,
      session: authStateData.session,
      
      // New authentication methods
      requestSignature,
      acceptTerms,
      declineTerms,
      refreshSession,
      clearError,
    }
  }, [
    walletAddress, 
    isWalletConnected, 
    disconnect, 
    isAuthenticated, 
    chainId, 
    isConnecting, 
    isReconnecting,
    authStateData,
    requestSignature,
    acceptTerms,
    declineTerms,
    refreshSession,
    clearError
  ])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}