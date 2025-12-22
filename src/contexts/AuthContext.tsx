/**
 * Simple Authentication Context
 * Auto-requests signature when wallet connects
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import type { AuthState } from '@/types/auth';
import { createSignatureMessage } from '@/types/auth';

interface AuthContextType extends AuthState {
  authenticate: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
  });

  /**
   * Authenticate: Request wallet signature
   */
  const authenticate = useCallback(async () => {
    if (!address) throw new Error('No wallet connected');

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const message = createSignatureMessage(address);
      await signMessageAsync({ message });
      
      // Signature successful = user owns the wallet
      setAuthState({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      setAuthState({ isAuthenticated: false, isLoading: false });
      throw error;
    }
  }, [address, signMessageAsync]);

  /**
   * Logout: Disconnect wallet and clear auth
   */
  const logout = useCallback(() => {
    disconnect();
    setAuthState({ isAuthenticated: false, isLoading: false });
  }, [disconnect]);

  // Reset auth when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setAuthState({ isAuthenticated: false, isLoading: false });
    }
  }, [isConnected]);

  // Auto-request signature when wallet connects (if not already authenticated)
  useEffect(() => {
    if (isConnected && address && !authState.isAuthenticated && !authState.isLoading) {
      // Small delay to let wallet connection UI settle
      const timer = setTimeout(() => {
        authenticate().catch((error) => {
          // User rejected signature - that's ok, they can try again later
          console.log('Signature rejected:', error);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, address, authState.isAuthenticated, authState.isLoading, authenticate]);

  const value: AuthContextType = {
    ...authState,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};