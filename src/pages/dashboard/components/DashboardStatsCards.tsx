import React from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface DashboardStatsCardsProps {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    totalPayroll: number;
    totalPaid: number;
    averageSalary: number;
    payrollCoverage: number;
    inactiveEmployees: number;
  };
  quickActions: {
    canRunPayroll: boolean;
    needsFunding: boolean;
    hasEmployees: boolean;
  };
  balance: string;
  isLoading: boolean;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  stats,
  quickActions,
  balance,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      subtitle: `${stats.activeEmployees} active`,
      icon: Users,
      color: 'blue',
      trend: stats.inactiveEmployees > 0 ? `${stats.inactiveEmployees} inactive` : 'All active'
    },
    {
      title: 'Monthly Payroll',
      value: `${stats.totalPayroll.toFixed(4)} ETH`,
      subtitle: `$${(stats.totalPayroll * 3000).toFixed(2)} USD`,
      icon: DollarSign,
      color: 'green',
      trend: quickActions.needsFunding ? 'Needs funding' : 'Fully covered'
    },
    {
      title: 'Total Paid Out',
      value: `${stats.totalPaid.toFixed(4)} ETH`,
      subtitle: `$${(stats.totalPaid * 3000).toFixed(2)} USD`,
      icon: TrendingUp,
      color: 'purple',
      trend: 'All time'
    },
    {
      title: 'Average Salary',
      value: stats.averageSalary > 0 ? `${stats.averageSalary.toFixed(4)} ETH` : '0 ETH',
      subtitle: `$${(stats.averageSalary * 3000).toFixed(2)} USD`,
      icon: DollarSign,
      color: 'yellow',
      trend: 'Per employee'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">{card.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payroll Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payroll Status</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            quickActions.canRunPayroll 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {quickActions.canRunPayroll ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Ready to Run
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Action Required
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Balance */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Balance</p>
            <p className="text-xl font-bold text-gray-900">{balance} ETH</p>
            <p className="text-sm text-gray-500">${(parseFloat(balance) * 3000).toFixed(2)} USD</p>
          </div>

          {/* Required for Payroll */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Required for Payroll</p>
            <p className="text-xl font-bold text-gray-900">{stats.totalPayroll.toFixed(4)} ETH</p>
            <p className="text-sm text-gray-500">${(stats.totalPayroll * 3000).toFixed(2)} USD</p>
          </div>

          {/* Coverage */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Coverage</p>
            <p className={`text-xl font-bold ${
              stats.payrollCoverage >= 100 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {Math.min(stats.payrollCoverage, 999).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              {stats.payrollCoverage >= 100 ? 'Fully covered' : 'Needs funding'}
            </p>
          </div>
        </div>

        {/* Action Items */}
        {!quickActions.hasEmployees && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Get Started</span>
            </div>
            <p className="text-blue-700 mt-1">
              Add your first employee to start managing payroll
            </p>
          </div>
        )}

        {quickActions.needsFunding && quickActions.hasEmployees && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Funding Required</span>
            </div>
            <p className="text-yellow-700 mt-1">
              You need {(stats.totalPayroll - parseFloat(balance)).toFixed(4)} more ETH to run payroll
            </p>
          </div>
        )}
      </div>
    </div>
  );
};