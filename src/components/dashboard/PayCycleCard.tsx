import React from 'react';
import { Calendar } from 'lucide-react';
import { getPayCycle, formatDate, formatPayDate } from '../../utils/dashboard_utils/PayUtils.ts';

interface PayCycleCardProps {
  cycleOffset: number;
  onPrevious: () => void;
  onCurrent: () => void;
}

const PayCycleCard: React.FC<PayCycleCardProps> = ({ 
  cycleOffset, 
  onPrevious, 
  onCurrent 
}) => {
  const cycle = getPayCycle(cycleOffset);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Pay Cycle</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onPrevious}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Previous
          </button>
          <button 
            onClick={onCurrent}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              cycleOffset === 0 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Current
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Update Date</span>
          <span className="text-gray-600">Pay Date</span>
        </div>
        <div className="flex justify-between">
          <span className="text-2xl font-bold text-gray-900">
            {formatPayDate(new Date(cycle.payDate.getTime() - 5 * 24 * 60 * 60 * 1000))}
          </span>
          <span className="text-2xl font-bold text-gray-900">
            {formatPayDate(cycle.payDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PayCycleCard;