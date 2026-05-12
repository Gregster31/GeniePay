import { supabase } from '@/lib/supabase';

export interface PublicMetrics {
  total_payroll_runs: number;
  total_usd_disbursed: number;
  unique_wallets_paid: number;
  unique_senders: number;
  chains_used: string[];
  currencies_used: string[];
  payroll_count: number;
  quickpay_count: number;
}

export const fetchPublicMetrics = async (): Promise<PublicMetrics> => {
  const { data, error } = await supabase.rpc('get_public_metrics');
  if (error) throw new Error(error.message);
  return data as PublicMetrics;
};

export interface DailyMetric {
  date: string;        // 'YYYY-MM-DD'
  usd_disbursed: number;
  run_count: number;
}

export const fetchDailyMetrics = async (days: number): Promise<DailyMetric[]> => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('receipts')
    .select('created_at, total_usd, type')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Aggregate rows into daily buckets
  const buckets = new Map<string, { usd_disbursed: number; run_count: number }>();
  for (const row of (data ?? []) as { created_at: string; total_usd: number; type: string }[]) {
    const day = row.created_at.slice(0, 10);
    const existing = buckets.get(day) ?? { usd_disbursed: 0, run_count: 0 };
    buckets.set(day, {
      usd_disbursed: existing.usd_disbursed + (row.total_usd ?? 0),
      run_count:     existing.run_count + 1,
    });
  }

  return Array.from(buckets.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
