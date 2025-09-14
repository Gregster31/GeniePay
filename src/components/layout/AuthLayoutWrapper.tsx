import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/UseAuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { getPageTitle } from '@/router';

/**
 * Centralized auth wrapper that handles all route protection logic
 * Redirects to dashboard instead of showing wallet connection for protected routes
 */
export const AuthLayoutWrapper: React.FC = () => {
  const location = useLocation();
  const { isAllowed, isLoading, shouldShowConnectWallet } = useAuthGuard(location.pathname);
  const pageTitle = getPageTitle(location.pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (shouldShowConnectWallet || !isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header title={pageTitle} />
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};