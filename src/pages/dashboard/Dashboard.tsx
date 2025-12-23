import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  ChevronRight,
  ArrowUpRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { WalletBalanceCard } from './WalletBalanceCard';

// ========================= TYPES =========================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
}

interface QuickPayFormData {
  payee: string;
  amount: string;
}

// ========================= STAT CARD COMPONENT =========================

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendUp,
  onClick 
}) => (
  <div 
    className={`rounded-2xl p-6 transition-all duration-300 relative overflow-hidden ${
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
    {/* Gradient overlay */}
    <div 
      className="absolute inset-0 opacity-10"
      style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)'
      }}
    />
    
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-xl transition-all duration-300"
          style={{ 
            backgroundColor: 'rgba(124, 58, 237, 0.15)',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
          }}
        >
          <Icon className="w-6 h-6" style={{ color: '#a855f7' }} />
        </div>
        {onClick && <ChevronRight className="w-5 h-5 text-gray-500 hover:text-purple-400 transition-colors" />}
      </div>
      
      <h3 className="text-sm font-medium text-gray-400 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
        {title}
      </h3>
      
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
          {value}
        </p>
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
      )}
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-lg inline-flex" style={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
          {trendUp !== undefined && (
            <ArrowUpRight 
              className={`w-4 h-4 ${trendUp ? 'text-green-400' : 'text-red-400 rotate-90'}`} 
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

// ========================= GLASSY QUICK PAY CARD =========================

const QuickPayCard: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<QuickPayFormData>({
    payee: '',
    amount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/pay', { state: formData });
  };

  return (
    <div 
      className="rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl"
      style={{ 
        backgroundColor: 'rgba(26, 27, 34, 0.6)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Glass gradient overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(124, 58, 237, 0.1) 100%)'
        }}
      />
      
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite'
        }}
      />
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-base font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            Quick Pay
          </h3>
          <button
            onClick={() => navigate('/pay')}
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#c4b5fd' }}
          >
            Confirm →
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Display - Large centered text */}
          <div className="text-center py-4">
            <div className="mb-2">
              <span className="text-2xl font-bold text-white mr-2">$</span>
              <input
                type="text"
                placeholder="Add amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="text-2xl font-bold text-white bg-transparent border-none outline-none placeholder-gray-500 text-center w-48"
                style={{ 
                  fontFamily: "'Inter', sans-serif"
                }}
              />
            </div>
          </div>

          {/* Payee Select - Glassy dropdown */}
          <div>
            <select
              value={formData.payee}
              onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer text-sm backdrop-blur-sm"
              style={{ 
                backgroundColor: 'rgba(31, 29, 46, 0.6)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                fontFamily: "'Inter', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(124, 58, 237, 0.6)';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="" className="bg-gray-900">Select payee...</option>
              <option value="employee1" className="bg-gray-900">John Doe (0x1234...5678)</option>
              <option value="employee2" className="bg-gray-900">Jane Smith (0x8765...4321)</option>
              <option value="contractor1" className="bg-gray-900">Alex Johnson (0xabcd...efgh)</option>
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================= MAIN DASHBOARD =========================
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = {
    totalPayments: '15.4 ETH',
    totalPaymentsUSD: '$46,200',
    totalEmployees: '12',
    activeEmployees: '10',
    monthlyPayroll: '2.8 ETH',
    monthlyPayrollUSD: '$8,400'
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: '#0f0d16',
      }}
    >
      <div className="p-6 lg:p-8">
        {/* First Row - Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
          <StatCard
            title="Total Payments This Year"
            value={stats.totalPayments}
            subtitle={stats.totalPaymentsUSD}
            icon={DollarSign}
            trend="+12.5% from last year"
            trendUp={true}
          />
          
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            subtitle={`${stats.activeEmployees} active`}
            icon={Users}
            trend="2 added this month"
            trendUp={true}
            onClick={() => navigate('/team')}
          />
          
          <StatCard
            title="Monthly Payroll"
            value={stats.monthlyPayroll}
            subtitle={stats.monthlyPayrollUSD}
            icon={Calendar}
            trend="Next run in 5 days"
          />
          
          <StatCard
            title="Next Payment"
            value="5 days"
            subtitle="December 27, 2025"
            icon={Clock}
            trend="12 employees scheduled"
          />
        </div>

        {/* Second Row - Wallet Balance + Quick Pay */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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