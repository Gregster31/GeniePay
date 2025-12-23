import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ErrorPage } from '@/components/shared';
// Pages
import Dashboard from '@/pages/dashboard';
import Pay from '@/pages/pay';
import Payroll from '@/pages/payroll';
import History from '@/pages/history';

/**
 * STRUCTURE:
 * - All routes are wrapped in ProtectedRoute
 * - ProtectedRoute checks: wallet connected + signature verified
 * - Users can't access private routes without both verifications
 * - Uses CSS Grid for responsive layout that automatically adjusts to sidebar state
 */
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

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
        path: 'pay',
        element: <Pay />,
      },
      {
        path: 'payroll',
        element: <Payroll />,
      },
      {
        path: 'history',
        element: <History />,
      }
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};