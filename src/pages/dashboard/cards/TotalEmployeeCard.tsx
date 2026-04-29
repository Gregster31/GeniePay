import React from "react";
import { Card, Label } from "@/components/ui";
import type { Employee } from "@/models/EmployeeModel";

export const TotalEmployeeCard: React.FC<{
  count: number;
  employees: Employee[];
  onClick: () => void;
}> = ({ count, employees, onClick }) => {
  const addedLastMonth = React.useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 1);
    return employees.filter(e => e.dateAdded >= cutoff).length;
  }, [employees]);

  return (
    <Card
      onClick={onClick}
      className="!bg-[#5D00F2]/[0.12] !border-[#5D00F2]/30 shadow-[0_2px_4px_rgba(0,0,0,0.35),0_8px_24px_rgba(93,0,242,0.15),inset_0_1px_0_rgba(255,255,255,0.07)] hover:!border-[#5D00F2]/45"
    >
      <div className="flex justify-between mb-3.5">
        <Label>Total Employees</Label>
      </div>
      <div className="flex flex-col justify-end flex-1">
        <span className="text-[48px] font-bold tracking-tight leading-none dark:text-white text-gray-900">{count}</span>
      {addedLastMonth > 0 && (
        <span className="text-[11px] font-bold text-cyan mt-1.5 tabular-nums">
          +{addedLastMonth} / month
        </span>
      )}
      </div>
    </Card>
  );
};