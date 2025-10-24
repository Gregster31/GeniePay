import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Zap, AlertCircle } from 'lucide-react';
import { useDashboard } from './hooks/UseDashboard';
import { DashboardStatsCards } from './components/DashboardStatsCards';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    stats,
    quickActions,
    isLoading,
    error,
    formattedBalance,
    refetchStats,
  } = useDashboard();

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Dashboard</span>
          </div>
          <p className="text-red-700 mt-1">{error.message}</p>
          <button
            onClick={refetchStats}
            className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your payroll and team management
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <button
            onClick={() => navigate('/team')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            Manage Team
          </button>
          
          {quickActions.canRunPayroll && (
            <button
              onClick={() => navigate('/payroll')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Run Payroll
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStatsCards
        stats={stats}
        quickActions={quickActions}
        balance={formattedBalance}
        isLoading={isLoading}
      />

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Employee Card */}
        <div 
          onClick={() => navigate('/team')}
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-200 hover:border-blue-300"
        >
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Employee</h3>
            <p className="text-gray-600 text-sm">
              Add new team members to your payroll system
            </p>
          </div>
        </div>

        {/* Run Payroll Card */}
        <div 
          onClick={() => navigate('/payroll')}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${
            quickActions.canRunPayroll 
              ? 'border-2 border-green-200 hover:border-green-300' 
              : 'border-2 border-gray-200 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="text-center">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              quickActions.canRunPayroll 
                ? 'bg-green-100' 
                : 'bg-gray-100'
            }`}>
              <Zap className={`w-6 h-6 ${
                quickActions.canRunPayroll 
                  ? 'text-green-600' 
                  : 'text-gray-400'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Run Payroll</h3>
            <p className="text-gray-600 text-sm">
              {quickActions.canRunPayroll 
                ? 'Process payments for all active employees'
                : 'Add employees and fund account to run payroll'
              }
            </p>
          </div>
        </div>

        {/* Fund Account Card */}
        <div 
          onClick={() => navigate('/deposit')}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${
            quickActions.needsFunding 
              ? 'border-2 border-yellow-200 hover:border-yellow-300' 
              : 'border-2 border-gray-200'
          }`}
        >
          <div className="text-center">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              quickActions.needsFunding 
                ? 'bg-yellow-100' 
                : 'bg-gray-100'
            }`}>
              <Plus className={`w-6 h-6 ${
                quickActions.needsFunding 
                  ? 'text-yellow-600' 
                  : 'text-gray-400'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fund Account</h3>
            <p className="text-gray-600 text-sm">
              {quickActions.needsFunding 
                ? 'Add funds to cover your payroll requirements'
                : 'Your account is sufficiently funded'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity - Placeholder for future implementation */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Payment history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;