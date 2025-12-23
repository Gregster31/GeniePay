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
import { QuickPayCard } from './QuickpayCard';

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
            onClick={() => navigate('/payroll')}
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