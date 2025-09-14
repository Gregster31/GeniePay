import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthLayoutWrapper } from '@/components/layout/AuthLayoutWrapper';
import Dashboard from '@/pages/dashboard';
import Team from '@/pages/team';
import Pay from '@/pages/pay';
import Payroll from '@/pages/payroll';
import AccountHistory from '@/pages/accountHistory';
import Documents from '@/pages/documents';
import Deposit from '@/pages/deposit';
import SettingsPage from '@/pages/settings';
import { ErrorPage } from '@/components/shared';


/**
 * Router that uses AuthLayoutWrapper for all route protection
 * Auth logic is centralized in the layout wrapper
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthLayoutWrapper />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
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
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

// Page titles mapping
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