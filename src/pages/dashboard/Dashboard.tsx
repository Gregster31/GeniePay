import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentSchedule } from '@/hooks/usePaymentSchedule';
import { useAuth } from '@/contexts/AuthContext';
import { WalletCard } from './cards/ConnectedWalletCard';
import { TxCard } from './cards/TxCard';
import { BalanceCard } from './cards/WalletBalanceCard';
import { EmployeeListCard } from './cards/EmployeeListCard';
import { TotalEmployeeCard } from './cards/TotalEmployeeCard';
import { CalendarCard } from './cards/CalendarCard';
import { Footer } from '@/components/layout/Footer';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { employees } = useAuth();
  const { frequency, save, daysUntilNext, nextPaymentDate } = usePaymentSchedule();
  const payroll = useMemo(() => employees.reduce((s, e) => s + (e.payUsd || 0), 0), [employees]);

  return (
    <>
      <div className="dash-grid">
        <div className="dash-grid__cell-1-1">  <WalletCard /></div>
        <div className="dash-grid__cell-2-1">  <TotalEmployeeCard count={employees.length} employees={employees} onClick={() => navigate('/payroll')} /></div>
        <div className="dash-grid__cell-3-1-2"><CalendarCard frequency={frequency} onSave={save} daysUntilNext={daysUntilNext} nextPaymentDate={nextPaymentDate} /></div>
        <div className="dash-grid__cell-1-2-2"><BalanceCard monthlyPayroll={payroll} /></div>
        <div className="dash-grid__cell-1-3-2"><TxCard onClick={() => navigate('/documents')} /></div>
        <div className="dash-grid__cell-3-3-2"><EmployeeListCard employees={employees} onClick={() => navigate('/payroll')} /></div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;