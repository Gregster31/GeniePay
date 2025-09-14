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
}