/**
 * STRUCTURE:
 * - All routes are wrapped in ProtectedRoute
 * - ProtectedRoute checks: wallet connected + signature verified
 * - Users can't access ANY route without both
 */
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ErrorPage } from '@/components/shared';
// Pages
import Dashboard from '@/pages/dashboard';
import Team from '@/pages/team';
import Pay from '@/pages/pay';
import Payroll from '@/pages/payroll';
import AccountHistory from '@/pages/accountHistory';
import Documents from '@/pages/documents';
import Deposit from '@/pages/deposit';
import SettingsPage from '@/pages/settings';

/**
 * Protected Layout
 * All routes use this layout - forces authentication
 */
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
          <main className="min-h-screen">
            <Outlet />
          </main>
      </div>
    </ProtectedRoute>
  );
};

/**
 * Router Configuration
 * Every single route requires authentication
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'team',
        element: <Team />,
      },
      {
        path: 'pay',
        element: <Pay />,
      },
      {
        path: 'payroll',
        element: <Payroll />,
      },
      {
        path: 'account-history',
        element: <AccountHistory />,
      },
      {
        path: 'documents',
        element: <Documents />,
      },
      {
        path: 'deposit',
        element: <Deposit />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};