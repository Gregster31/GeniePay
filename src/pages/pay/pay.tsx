import React from 'react';
import { QuickPayCard } from '@/pages/dashboard/QuickpayCard';

const Pay: React.FC = () => {
  return (
    <div 
      className="min-h-screen p-6 lg:p-8 flex items-center justify-center" 
      style={{ backgroundColor: '#0f0d16' }}
    >
      <div className="w-full max-w-7xl">
        {/* Quick Pay Card */}
        <QuickPayCard />
      </div>
    </div>
  );
};

export default Pay;