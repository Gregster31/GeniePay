import { Card, Label } from "@/components/ui";
import { sliceAddress } from "@/utils/WalletAddressSlicer";
import { ExternalLink, Users } from "lucide-react";
import { useMemo } from "react";
import type { Employee } from "@/models/EmployeeModel";

const age = (d: Date) => {
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days  < 7)  return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

export const EmployeeListCard: React.FC<{ employees: Employee[]; onClick: () => void }> = ({ employees, onClick }) => {
  const recent = useMemo(() =>
    [...employees].sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime()).slice(0, 5),
    [employees]);

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex justify-between items-center px-[18px] py-3.5 border-b border-white/[0.07]">
        <Label>Latest Employees Added</Label>
        <button onClick={onClick} className="flex items-center gap-1 text-[11px] font-medium text-[#23DDC6] bg-transparent border-none cursor-pointer p-0">
          View all <ExternalLink size={10} />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-11 px-[18px] gap-2.5">
          <Users size={26} className="text-gray-600" />
          <p className="text-[12px] text-gray-500 text-center leading-relaxed">No employees yet.<br />Add your first to get started.</p>
          <button onClick={onClick} className="mt-2 px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-[#5D00F2]/15 border border-[#5D00F2]/30 text-purple-300 cursor-pointer">
            Add employee
          </button>
        </div>
      ) : recent.map(emp => (
        <div key={emp.id} onClick={onClick}
          className="flex items-center gap-3 px-[18px] py-3 border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.025] transition-colors">
          <div className="w-[34px] h-[34px] rounded-[9px] shrink-0 flex items-center justify-center bg-[#5D00F2]/15 border border-[#5D00F2]/25 text-[13px] font-bold text-purple-300">
            {emp.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="text-[13px] font-semibold text-white truncate">{emp.name}</span>
              <span className="text-[11px] text-gray-500 shrink-0 ml-2">{age(emp.dateAdded)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] font-mono text-gray-500 truncate">{sliceAddress(emp.walletAddress)}</span>
              <span className="text-[12px] font-bold text-cyan shrink-0 ml-2">${emp.payUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};