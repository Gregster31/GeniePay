import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ErrorPage } from '@/pages/ErrorPage';
import Dashboard  from '@/pages/dashboard';
import Pay        from '@/pages/pay';
import Payroll    from '@/pages/payroll';
import Transactions    from '@/pages/transactions';
import Documents  from '@/pages/documents';
import LandingPage from '@/pages/landing';
import MetricsPage from '@/pages/metrics';

const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ paddingTop: "68px" }}>

      <AppHeader
        mobileOpen={mobileOpen}
        onMobileMenuToggle={() => setMobileOpen(p => !p)}
      />

      {/* Mobile drawer — sits below the header, full width */}
      <div className={`fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] z-[99] transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        dark:bg-[#0f0e17] bg-[#F5F0FA] p-3 lg:hidden`}>
        <Sidebar isMobile onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Desktop sidebar — sticky, with margin so it floats */}
      <div className="hidden lg:block shrink-0 sticky top-[68px] h-[calc(100vh-68px)] p-3 pl-3 pr-0">
        <Sidebar />
      </div>

      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  { path: '/landing', element: <LandingPage />,  errorElement: <ErrorPage /> },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true,              element: <Dashboard /> },
      { path: 'pay',              element: <Pay /> },
      { path: 'payroll',          element: <Payroll /> },
      { path: 'documents',        element: <Documents /> },
      { path: 'transactions',     element: <Transactions /> },
      { path: 'metrics',          element: <MetricsPage /> },
    ],
  },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;