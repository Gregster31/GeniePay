export interface PayCycle {
  startDate: Date;
  endDate: Date;
  payDate: Date;
}

export const getPayCycle = (weeksOffset: number = 0): PayCycle => {
  const today = new Date();
  
  const daysFromSunday = today.getDay();
  const currentCycleStart = new Date(today);
  currentCycleStart.setDate(today.getDate() - daysFromSunday);
  
  currentCycleStart.setDate(currentCycleStart.getDate() + (weeksOffset * 14));
  
  const cycleEnd = new Date(currentCycleStart);
  cycleEnd.setDate(currentCycleStart.getDate() + 13);
  
  const payDate = new Date(cycleEnd);
  payDate.setDate(cycleEnd.getDate() + 1);
  
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