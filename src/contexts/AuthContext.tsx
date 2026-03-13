import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import type { AuthState } from '@/components/auth/auth';

interface AuthContextType extends AuthState {
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
  });

  useEffect(() => {
    setAuthState({ isAuthenticated: isConnected, isLoading: false });
  }, [isConnected]);

  const logout = useCallback(() => {
    disconnect();
    setAuthState({ isAuthenticated: false, isLoading: false });
  }, [disconnect]);

  return (
    <AuthContext.Provider value={{ ...authState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};