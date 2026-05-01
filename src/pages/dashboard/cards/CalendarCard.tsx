import { Card, Label } from "@/components/ui";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['S','M','T','W','T','F','S'];

export const CalendarCard: React.FC<{
  frequency: 'monthly' | 'bi-weekly';
  onSave: (f: 'monthly' | 'bi-weekly') => void;
  daysUntilNext: number;
  nextPaymentDate: string;
}> = ({ frequency, onSave, daysUntilNext, nextPaymentDate }) => {
  const [off, setOff] = useState(0);
  const today   = new Date();
  const view    = new Date(today.getFullYear(), today.getMonth() + off, 1);
  const dim     = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells   = [...Array(view.getDay()).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const payDays = frequency === 'monthly' ? [1] : [1, 15];

  return (
    <Card className="!p-[22px]">
      <div className="flex justify-between mb-[18px]">
        <div>
          <Label>Pay Period</Label>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={12} className="text-[#23DDC6]" />
            <span className="text-[11px] font-medium text-[#23DDC6]">{daysUntilNext}d until next</span>
          </div>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/[0.10] shrink-0">
          {(['monthly', 'bi-weekly'] as const).map(f => (
            <button key={f} onClick={() => onSave(f)}
              className={`px-3 py-1 text-[11px] font-semibold border-none cursor-pointer transition-all ${
                frequency === f ? 'bg-[#23DDC6]/15 text-[#23DDC6]' : 'bg-transparent text-gray-500 hover:text-gray-300'
              }`}>
              {f === 'monthly' ? 'Monthly' : 'Bi-weekly'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <button onClick={() => setOff(p => p - 1)} className="bg-transparent border-none cursor-pointer text-gray-500 hover:text-white flex">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[13px] font-semibold text-white">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
        <button onClick={() => setOff(p => p + 1)} className="bg-transparent border-none cursor-pointer text-gray-500 hover:text-white flex">
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => <div key={i} className="text-center text-[10px] font-semibold text-gray-500 py-0.5 tracking-wider">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const isToday  = off === 0 && day === today.getDate();
          const isPayDay = payDays.includes(day);
          const isPast   = off === 0 && day < today.getDate();
          return (
            <div key={i} className={`h-[27px] flex items-center justify-center rounded text-[11px] border ${
              isToday  ? 'bg-[#5D00F2]/40 border-[#5D00F2]/60 text-white font-semibold' :
              isPayDay ? 'bg-[#23DDC6]/10 border-[#23DDC6]/30 text-[#23DDC6] font-semibold' :
              isPast   ? 'border-transparent text-gray-600' :
                         'border-transparent text-gray-400'
            }`}>{day}</div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/[0.09] flex justify-between">
        <span className="text-[11px] text-gray-600 dark:text-gray-500">Next payment</span>
        <span className="text-[12px] font-semibold dark:text-white text-gray-900">{nextPaymentDate}</span>
      </div>
    </Card>
  );
};
