import React from 'react';
import { QuickPayCard } from '@/pages/dashboard/QuickpayCard';

const Pay: React.FC = () => {
  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
          >
            Quick Pay
          </h1>
          <p className="text-gray-400 text-sm">
            Send instant crypto payments to any wallet address
          </p>
        </div>

        {/* Quick Pay Card */}
        <QuickPayCard />
      </div>
    </div>
  );
};

export default Pay;