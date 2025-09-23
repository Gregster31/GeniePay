export interface AuthContextType {
  isWalletConnected: boolean
  walletAddress?: string
  disconnect: () => void
  displayName: string
  displayAddress?: string
  isAuthenticated: boolean
  chainId?: number
  isConnecting: boolean
  isReconnecting: boolean
  authState: 'disconnected' | 'pending_signature' | 'pending_terms' | 'authenticated'
  error: string | null
  isLoading: boolean
  session: AuthSession | null
  
  // New authentication methods
  requestSignature: () => Promise<void>
  acceptTerms: () => Promise<void>
  declineTerms: () => void
  refreshSession: () => Promise<void>
  clearError: () => void
}

export interface AuthSession {
  userId: string
  walletAddress: string
  nonce: string
  expiresAt: number
  isNewUser: boolean
}