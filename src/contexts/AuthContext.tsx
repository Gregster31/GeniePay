import React, {
  createContext, useContext, useState,
  useCallback, useRef, useEffect,
} from 'react';
import { useAccount, useDisconnect } from 'wagmi';
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
  logout: () => void;
  employees: Employee[];
  isLoadingEmployees: boolean;
  addEmployee:    (employee: Omit<Employee, 'id' | 'dateAdded'>) => Promise<void>;
  updateEmployee: (id: string, updates: Omit<Employee, 'id' | 'dateAdded'>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();

  // Prevent the disconnect handler from firing on a page reload (wagmi
  // briefly reports 'disconnected' before reconnecting from storage).
  const didExplicitLogout = useRef(false);

  const [isLoading,          setIsLoading]          = useState(false);
  const [employees,          setEmployees]          = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  useEffect(() => {
    if (status === 'connected' && address) {
      didExplicitLogout.current = false;

      (async () => {
        setIsLoading(true);
        setIsLoadingEmployees(true);
        try {
          await signInWithWallet(address);
          const data = await fetchEmployees();
          setEmployees(data);
        } catch (err) {
          console.error('Supabase auth/fetch failed:', err);
        } finally {
          setIsLoading(false);
          setIsLoadingEmployees(false);
        }
      })();
    }

    if (status === 'disconnected' && didExplicitLogout.current) {
      setEmployees([]);
      didExplicitLogout.current = false;
    }
  }, [status, address]);

  const logout = useCallback(async () => {
    didExplicitLogout.current = true;
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
      isAuthenticated: isConnected,
      isLoading,
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