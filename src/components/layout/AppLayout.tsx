import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout';
import { Header } from '@/components/layout';
import { getPageTitle } from '@/router';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={''} onTabChange={function (tab: string): void {
        throw new Error('Function not implemented.');
      } } />
      <div className="ml-64">
        <Header title={pageTitle} />
        <main className="min-h-screen">
          {/* Outlet renders the matched child route */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};