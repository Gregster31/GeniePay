import type { AuthContextType } from '@/types/AuthContextType'
import { sliceAddress } from '@/utils/WalletAddressSlicer'
import React, { createContext, useMemo } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider manages wallet connection state and provides authentication context
 * - Tracks wallet connection status and address
 * - Provides formatted display name and address
 * - Handles wallet disconnection
 * - Tracks chain ID and connection states
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    address: walletAddress, 
    isConnected: isWalletConnected,
    chainId,
    isConnecting,
    isReconnecting
  } = useAccount()
  
  const { disconnect: wagmiDisconnect } = useDisconnect()

  const authValue = useMemo((): AuthContextType => {
    const displayName = walletAddress 
      ? sliceAddress(walletAddress) 
      : 'User'
    
    return {
      isWalletConnected,
      walletAddress,
      disconnect: wagmiDisconnect,
      displayName,
      displayAddress: walletAddress,
      isAuthenticated: isWalletConnected,
      chainId,
      isConnecting,
      isReconnecting
    }
  }, [walletAddress, isWalletConnected, wagmiDisconnect, chainId, isConnecting, isReconnecting])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}