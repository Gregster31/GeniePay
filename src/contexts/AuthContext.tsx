import React, {
  createContext, useContext, useState,
  useCallback, useEffect,
} from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import type { Employee } from '@/models/EmployeeModel';
import {
  signInWithWallet,
  signOutWallet,
  fetchEmployees,
  insertEmployee,
  updateEmployee as dbUpdateEmployee,
  deleteEmployee,
} from '@/services/EmployeeService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  logout: () => void;
  employees: Employee[];
  isLoadingEmployees: boolean;
  addEmployee:    (employee: Omit<Employee, 'id' | 'dateAdded'>) => Promise<void>;
  updateEmployee: (id: string, updates: Omit<Employee, 'id' | 'dateAdded'>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, status } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const [isLoading,          setIsLoading]          = useState(false);
  const [isAuthenticated,    setIsAuthenticated]    = useState(false);
  const [authError,          setAuthError]          = useState<string | null>(null);
  const [employees,          setEmployees]          = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  useEffect(() => {
    if (status === 'connected' && address) {
      let cancelled = false;

      (async () => {
        setIsAuthenticated(false);
        setAuthError(null);
        setEmployees([]);
        queryClient.removeQueries({ queryKey: ['receipts', address] });
        setIsLoading(true);
        setIsLoadingEmployees(true);
        try {
          await signInWithWallet(address, signMessageAsync);
          if (cancelled) return;
          setIsAuthenticated(true);
          const data = await fetchEmployees();
          if (cancelled) return;
          setEmployees(data);
        } catch (err) {
          if (cancelled) return;
          const msg = err instanceof Error ? err.message : 'Authentication failed';
          setAuthError(msg);
          if (import.meta.env.DEV) console.error('Supabase auth/fetch failed:', err);
        } finally {
          if (!cancelled) {
            setIsLoading(false);
            setIsLoadingEmployees(false);
          }
        }
      })();

      return () => { cancelled = true; };
    }

    if (status === 'disconnected') {
      setIsAuthenticated(false);
      setAuthError(null);
      setEmployees([]);
      queryClient.removeQueries({ queryKey: ['receipts'] });
    }
  }, [status, address, queryClient]);

  const logout = useCallback(async () => {
    await signOutWallet();
    disconnect();
  }, [disconnect]);

  const addEmployee = useCallback(async (data: Omit<Employee, 'id' | 'dateAdded'>) => {
    const created = await insertEmployee(data);
    setEmployees(prev => [...prev, created]);
  }, []);

  const updateEmployee = useCallback(async (id: string, updates: Omit<Employee, 'id' | 'dateAdded'>) => {
    const updated = await dbUpdateEmployee(id, updates);
    setEmployees(prev => prev.map(e => e.id === id ? updated : e));
  }, []);

  const removeEmployee = useCallback(async (id: string) => {
    await deleteEmployee(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      authError,
      logout,
      employees,
      isLoadingEmployees,
      addEmployee,
      updateEmployee,
      removeEmployee,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};