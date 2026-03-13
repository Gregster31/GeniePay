import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { WalletBalanceCard } from './WalletBalanceCard';
import { QuickPayCard } from './QuickpayCard';
import { mockEmployees } from '@/data/MockEmployeeData';
import { usePaymentSchedule } from '@/hooks/usePaymentSchedule';

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string; color?: string }>;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendUp,
  onClick,
  children
}) => (
  <div 
    className={`rounded-2xl p-4 sm:p-6 transition-all duration-300 relative overflow-hidden ${
      onClick ? 'cursor-pointer hover:scale-[1.03]' : ''
    }`}
    style={{ 
      backgroundColor: '#1A1B22',
      border: '1px solid rgba(124, 58, 237, 0.2)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.4)';
        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)';
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.4)';
        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
      }
    }}
  >
    <div 
      className="absolute inset-0 opacity-10"
      style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)'
      }}
    />
    
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div 
          className="p-2 sm:p-3 rounded-xl transition-all duration-300"
          style={{ 
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
          }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" color="#a855f7" />
        </div>
        {onClick && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-purple-400 transition-colors" />}
      </div>
      
      <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">
        {title}
      </h3>
      
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-2xl sm:text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
          {value}
        </p>
      </div>
      
      {subtitle && (
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{subtitle}</p>
      )}
      
      {children}
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-2 sm:mt-3 px-2 py-1.5 rounded-lg inline-flex" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
          {trendUp !== undefined && (
            <ArrowUpRight 
              className={`w-3 h-3 sm:w-4 sm:h-4 ${trendUp ? 'text-green-400' : 'text-red-400 rotate-90'}`} 
            />
          )}
          <span className={`text-xs font-semibold ${
            trendUp === true ? 'text-green-400' : 
            trendUp === false ? 'text-red-400' : 
            'text-gray-400'
          }`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  </div>
);

// ============================================================================
// MAIN DASHBOARD
// ============================================================================
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { frequency, save, daysUntilNext, nextPaymentDate } = usePaymentSchedule();

  // Calculate employee stats
  const stats = useMemo(() => {
    const totalEmployees = mockEmployees.length;
    const monthlyPayroll = mockEmployees.reduce((sum, e) => sum + (e.payUsd || 0), 0);
    
    return {
      totalEmployees,
      monthlyPayrollUSD: `$${monthlyPayroll.toFixed(2)}`,
    };
  }, []);

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: '#0f0d16',
      }}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 mt-4 sm:mt-8">
          
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            onClick={() => navigate('/payroll')}
          />
          
          <StatCard
            title="Monthly Payroll"
            value={stats.monthlyPayrollUSD}
            icon={Calendar}
            trend={`Next: ${nextPaymentDate}`}
            onClick={() => navigate('/payroll')}
          />
          
          <StatCard
            title="Next Payment"
            value={`${daysUntilNext} days`}
            subtitle={nextPaymentDate}
            icon={Clock}
          >
            {/* Payment Schedule Selector */}
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    save('monthly');
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    frequency === 'monthly'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    save('bi-weekly');
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    frequency === 'bi-weekly'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Bi-weekly
                </button>
              </div>
            </div>
          </StatCard>
        </div>

        {/* Second Row - Wallet Balance + Quick Pay */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Wallet Balance - Takes 1 column */}
          <div className="lg:col-span-1">
            <WalletBalanceCard />
          </div>

          {/* Quick Pay - Takes 2 columns */}
          <div className="lg:col-span-2">
            <QuickPayCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;