import { useState, useMemo } from "react";

export const usePaymentSchedule = () => {
  const [frequency, setFrequency] = useState<'bi-weekly' | 'monthly'>(() => 
    (localStorage.getItem('paymentFrequency') as 'bi-weekly' | 'monthly') || 'monthly'
  );

  const save = (freq: 'bi-weekly' | 'monthly') => {
    setFrequency(freq);
    localStorage.setItem('paymentFrequency', freq);
  };

  const { daysUntilNext, nextDate } = useMemo(() => {
    const now = new Date();
    // now.setDate(1); // ← TESTING: Set to 1st
    const today = now.getDate();
    const next = new Date(now);

    if (frequency === 'monthly') {
      next.setMonth(now.getMonth() + 1);
      next.setDate(1);
    } 
    else {
      if (today < 15) {
        next.setDate(15);
      } else {
        next.setMonth(now.getMonth() + 1);
        next.setDate(1);
      }
    }

    const days = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { daysUntilNext: days, nextDate: next };
  }, [frequency]);

  return { 
    frequency, 
    save, 
    daysUntilNext, 
    nextPaymentDate: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
};
