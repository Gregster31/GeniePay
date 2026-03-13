import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { isPublicRoute } from '@/components/auth/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isConnected } = useAccount();

  if (isPublicRoute(location.pathname)) {
    return <>{children}</>;
  }

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};