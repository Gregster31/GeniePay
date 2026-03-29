import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ErrorPage } from '@/pages/ErrorPage';
// Pages
import Dashboard from '@/pages/dashboard';
import Pay from '@/pages/pay';
import Payroll from '@/pages/payroll';
import History from '@/pages/history';
import LandingPage from '@/pages/landing';

/**
 * STRUCTURE:
 * - All routes are wrapped in ProtectedRoute
 * - ProtectedRoute checks: wallet connected + signature verified
 * - Users can't access private routes without both verifications
 * - Uses CSS Grid for responsive layout that automatically adjusts to sidebar state
 */
const ProtectedLayout: React.FC = () => (
  <ProtectedRoute>
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
  },
  {
    element: <ProtectedLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'pay',       element: <Pay /> },
      { path: 'payroll',   element: <Payroll /> },
      { path: 'history',   element: <History /> },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};