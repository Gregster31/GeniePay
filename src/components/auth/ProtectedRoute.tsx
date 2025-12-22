import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { isPublicRoute } from '@/components/auth/auth';

/**
 * Protected Route Component
 * - Dashboard is PUBLIC (anyone can view)
 * - Other routes PROTECTED (require wallet + signature)
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isConnected } = useAccount();
  const { isAuthenticated } = useAuth();

  const isPublic = isPublicRoute(location.pathname);
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes: require wallet connection + signature
  if (!isConnected || !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};