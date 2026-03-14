import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import type { AuthState } from '@/components/auth/auth';
import type { Employee } from '@/models/EmployeeModel';
import {
  saveEmployeesToSession,
  loadEmployeesFromSession,
  clearEmployeesFromSession,
} from '@/utils/EmployeeSession';

interface AuthContextType extends AuthState {
  logout: () => void;
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'dateAdded'>) => void;
  updateEmployee: (id: number, updates: Omit<Employee, 'id' | 'dateAdded'>) => void;
  removeEmployee: (id: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, status } = useAccount();
  const { disconnect } = useDisconnect();

  const didExplicitLogout = useRef(false);

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    return loadEmployeesFromSession() ?? [];
  });

  useEffect(() => {
    saveEmployeesToSession(employees);
  }, [employees]);

  useEffect(() => {
    if (status === 'connected') {
      didExplicitLogout.current = false;
      setAuthState({ isAuthenticated: true, isLoading: false });
    }

    if (status === 'disconnected' && didExplicitLogout.current) {
      setAuthState({ isAuthenticated: false, isLoading: false });
      clearEmployeesFromSession();
      setEmployees([]);
      didExplicitLogout.current = false;
    }
  }, [status]);

  const logout = useCallback(() => {
    didExplicitLogout.current = true;
    disconnect();
  }, [disconnect]);

  const addEmployee = useCallback((newEmployee: Omit<Employee, 'id' | 'dateAdded'>) => {
    setEmployees(prev => [
      ...prev,
      {
        ...newEmployee,
        id: Math.max(0, ...prev.map(e => e.id)) + 1,
        dateAdded: new Date(),
      },
    ]);
  }, []);

  const updateEmployee = useCallback(
    (id: number, updates: Omit<Employee, 'id' | 'dateAdded'>) => {
      setEmployees(prev =>
        prev.map(emp => (emp.id === id ? { ...emp, ...updates } : emp))
      );
    },
    []
  );

  const removeEmployee = useCallback((id: number) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: isConnected,
        logout,
        employees,
        addEmployee,
        updateEmployee,
        removeEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};