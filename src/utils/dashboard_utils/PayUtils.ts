// Simple pay cycle utilities
export interface PayCycle {
  startDate: Date;
  endDate: Date;
  payDate: Date;
}

export const getPayCycle = (weeksOffset: number = 0): PayCycle => {
  const today = new Date();
  
  // Find the most recent Sunday (start of current cycle)
  const daysFromSunday = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentCycleStart = new Date(today);
  currentCycleStart.setDate(today.getDate() - daysFromSunday);
  
  // Apply weeks offset for previous/next cycles
  currentCycleStart.setDate(currentCycleStart.getDate() + (weeksOffset * 14));
  
  const cycleEnd = new Date(currentCycleStart);
  cycleEnd.setDate(currentCycleStart.getDate() + 13); // 2 weeks - 1 day
  
  const payDate = new Date(cycleEnd);
  payDate.setDate(cycleEnd.getDate() + 1); // Next Sunday after cycle ends
  
  return {
    startDate: currentCycleStart,
    endDate: cycleEnd,
    payDate
  };
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatPayDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};