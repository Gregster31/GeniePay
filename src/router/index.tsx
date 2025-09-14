import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/dashboard';
import Team from '@/pages/team';
import Pay from '@/pages/pay';
import Payroll from '@/pages/payroll';
import AccountHistory from '@/pages/accountHistory';
import Documents from '@/pages/documents';
import Deposit from '@/pages/deposit';
import SettingsPage from '@/pages/settings';
import ErrorPage from '@/components/shared/ErrorPage';

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true, // This makes it the default route at "/"
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
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

// Router Provider Component
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

// Export individual route titles for use in components
export const getPageTitle = (pathname: string): string => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/team': 'Team Management',
    '/pay': 'Quick Pay',
    '/payroll': 'Payroll',
    '/account-history': 'Account History',
    '/documents': 'Documents',
    '/deposit': 'Deposit Funds',
    '/settings': 'Settings',
  };
  return titles[pathname] || 'Dashboard';
};