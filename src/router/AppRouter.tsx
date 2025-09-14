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

export const ROUTES = {
  DASHBOARD: '/',
  TEAM: '/team',
  PAY: '/pay',
  PAYROLL: '/payroll',
  ACCOUNT_HISTORY: '/account-history',
  DOCUMENTS: '/documents',
  DEPOSIT: '/deposit',
  SETTINGS: '/settings',
} as const;

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.TEAM]: 'Team Management',
  [ROUTES.PAY]: 'Quick Pay',
  [ROUTES.PAYROLL]: 'Payroll',
  [ROUTES.ACCOUNT_HISTORY]: 'Account History',
  [ROUTES.DOCUMENTS]: 'Documents',
  [ROUTES.DEPOSIT]: 'Deposit Funds',
  [ROUTES.SETTINGS]: 'Settings',
} as const;

/**
* Main application router with nested routes under AuthLayoutWrapper
* All routes require wallet connection through the layout wrapper
*/

//TODO CHECK ALL THE PAGES NOW!
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

/**
* Get page title for current pathname
* Defaults to 'Dashboard' if path not found
*/
export const getPageTitle = (pathname: string): string => {
  return PAGE_TITLES[pathname] || 'Dashboard';
};