/**
 * Protected Route Component
 * - Dashboard is PUBLIC (anyone can view)
 * - Other routes PROTECTED (require wallet + signature)
 * - No modals - auth happens through sidebar
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { isPublicRoute } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isConnected } = useAccount();
  const { isAuthenticated } = useAuth();

  // Check if current route is public (dashboard)
  const isPublic = isPublicRoute(location.pathname);

  // Public routes: always accessible
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes: require wallet connection + signature
  if (!isConnected || !isAuthenticated) {
    // Redirect to dashboard with a message
    return <Navigate to="/" replace />;
  }

  // User is authenticated - show protected content
  return <>{children}</>;
};