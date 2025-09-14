import React, { createContext, useContext } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

interface AuthContextType {
  isWalletConnected: boolean
  walletAddress?: string
    disconnect: () => void
    displayName: string
  displayAddress?: string
  isAuthenticated: boolean
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
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()

  const displayAddress = walletAddress
  const displayName = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
    : 'User'
  
  const isAuthenticated = isWalletConnected

  const disconnect = () => {
    wagmiDisconnect()
  }

  const value: AuthContextType = {
    isWalletConnected,
    walletAddress,
    disconnect,
    displayName,
    displayAddress,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}