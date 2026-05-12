import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { DollarSign, Layers, Play, Wallet } from 'lucide-react';
import { fetchPublicMetrics, fetchDailyMetrics } from '@/services/MetricsService';
import type { DailyMetric } from '@/services/MetricsService';
import {
  SUPPORTED_CHAIN_IDS, TOKEN_DECIMALS, CHAIN_NAMES,
  SUPPORTED_TOKENS_PER_CHAIN,
} from '@/config/tokenConfig';
import type { TokenSymbol } from '@/config/tokenConfig';
import { formatCurrency } from '@/utils/Format';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { PageShell } from '@/components/layout/PageShell';
import { Footer } from '@/components/layout/Footer';

// ── static constants ──────────────────────────────────────────────────────────
const CHAIN_COUNT = SUPPORTED_CHAIN_IDS.length;
const TOKEN_NAMES = Object.keys(TOKEN_DECIMALS) as TokenSymbol[];
const TOKEN_COUNT = TOKEN_NAMES.length;

const TOKEN_ACCENT: Record<TokenSymbol, string> = {
  ETH:  '#627EEA',
  USDC: '#2775CA',
  USDT: '#26A17B',
};

// How many chains support each token
const TOKEN_CHAIN_COUNT: Record<TokenSymbol, number> = TOKEN_NAMES.reduce((acc, t) => {
  acc[t] = SUPPORTED_CHAIN_IDS.filter(id => SUPPORTED_TOKENS_PER_CHAIN[id]?.includes(t)).length;
  return acc;
}, {} as Record<TokenSymbol, number>);

// Tab → days mapping
const TAB_DAYS: Record<string, number> = {
  '1 DAY':   1,
  '1 WEEK':  7,
  '1 MONTH': 30,
  '1 YEAR':  365,
};

const PROJECTION_MONTHS: Record<string, number> = {
  '1 MONTH': 1,
  '6 MONTHS': 6,
  '1 YEAR': 12,
  '3 YEARS': 36,
};

const GROWTH_MULTIPLIERS: Record<string, number> = {
  'CURRENT': 1, '2x': 2, '5x': 5, '10x': 10,
};

// ── helpers ────────────────────────────────────────────────────────────────────
function fmtUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  return formatCurrency(n);
}

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[Number(m) - 1]} ${Number(d)}`;
}

function buildProjectionData(
  daily: DailyMetric[],
  projectionMonths: number,
  growthMultiplier: number,
) {
  const avgDailyRuns = daily.length > 0
    ? daily.reduce((s, d) => s + d.run_count, 0) / daily.length
    : 0;

  const projectedDaily = avgDailyRuns * growthMultiplier;
  const now = new Date();
  const points: { month: string; actual: number | null; projected: number }[] = [];

  for (let offset = -3; offset <= projectionMonths; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthActual = daily
      .filter(m => m.date.startsWith(monthKey))
      .reduce((s, m) => s + m.run_count, 0);

    points.push({
      month:     label,
      actual:    offset <= 0 && monthActual > 0 ? monthActual : null,
      projected: Math.round(projectedDaily * daysInMonth),
    });
  }

  return points;
}

// ── tooltip style ─────────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  backgroundColor: '#16161f',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: 12,
};

// ── sub-components ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, loading }) => (
  <Card>
    <div className="flex items-center gap-2 mb-4">
      <Label>{label}</Label>
    </div>
    {loading ? (
      <div className="h-9 w-3/5 rounded-lg dark:bg-white/[0.07] bg-gray-200 animate-pulse" />
    ) : (
      <span className="text-[34px] font-extrabold leading-none tracking-tight dark:text-white text-gray-900 block">
        {value}
      </span>
    )}
    {sub && !loading && (
      <span className="text-[11px] dark:text-gray-500 text-gray-400 mt-2 block">{sub}</span>
    )}
  </Card>
);

// ── tab button ─────────────────────────────────────────────────────────────────
const TabButton: React.FC<{ active: boolean; children: React.ReactNode; onClick: () => void }> = ({
  active, children, onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 text-[10px] font-semibold tracking-wider uppercase rounded transition-all ${
      active
        ? 'bg-[#5D00F2] text-white shadow-[0_2px_8px_rgba(93,0,242,0.4)]'
        : 'dark:text-gray-400 text-gray-500 dark:hover:text-white hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

// ── chart card ─────────────────────────────────────────────────────────────────
const ChartCard: React.FC<{
  title: string;
  value: string;
  tabs: string[];
  activeTab: string;
  onTabChange: (t: string) => void;
  loading?: boolean;
  children: React.ReactNode;
}> = ({ title, value, tabs, activeTab, onTabChange, loading, children }) => (
  <Card className="!flex-col">
    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
      <div>
        <Label>{title}</Label>
        {loading ? (
          <div className="h-8 w-24 rounded-lg dark:bg-white/[0.07] bg-gray-200 animate-pulse mt-1" />
        ) : (
          <div className="text-[28px] font-extrabold tracking-tight dark:text-white text-gray-900 mt-1">{value}</div>
        )}
      </div>
      <div className="flex gap-1 dark:bg-white/[0.04] bg-black/[0.04] rounded-lg p-1">
        {tabs.map(tab => (
          <TabButton key={tab} active={activeTab === tab} onClick={() => onTabChange(tab)}>
            {tab}
          </TabButton>
        ))}
      </div>
    </div>
    <div className="flex-1 min-h-[180px]">{children}</div>
  </Card>
);

// ── empty chart state ──────────────────────────────────────────────────────────
const ChartEmpty: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <div className="flex items-center justify-center h-full min-h-[180px]">
    {loading ? (
      <div className="h-4 w-32 rounded dark:bg-white/[0.07] bg-gray-200 animate-pulse" />
    ) : (
      <span className="text-[12px] dark:text-gray-600 text-gray-400">No data yet</span>
    )}
  </div>
);

// ── support matrix ─────────────────────────────────────────────────────────────
const SupportMatrix: React.FC = () => {
  const [activeChain, setActiveChain] = useState<number | null>(null);
  const [activeToken, setActiveToken] = useState<TokenSymbol | null>(null);

  const isSupported = (chainId: number, token: TokenSymbol) =>
    SUPPORTED_TOKENS_PER_CHAIN[chainId]?.includes(token) ?? false;

  // A cell is "dimmed" if a filter is active and this cell doesn't match
  const isDimmed = (chainId: number, token: TokenSymbol) => {
    if (activeChain === null && activeToken === null) return false;
    if (activeChain !== null && activeChain !== chainId) return true;
    if (activeToken !== null && activeToken !== token) return true;
    return false;
  };

  return (
    <div>
      {/* Token filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-[10px] dark:text-gray-600 text-gray-400 uppercase tracking-wider mr-1">
          Filter:
        </span>
        {TOKEN_NAMES.map(token => {
          const accent = TOKEN_ACCENT[token];
          const active = activeToken === token;
          return (
            <button
              key={token}
              type="button"
              onClick={() => setActiveToken(active ? null : token)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-150 border"
              style={active ? {
                backgroundColor: `${accent}20`,
                color: accent,
                borderColor: `${accent}50`,
                boxShadow: `0 0 0 1px ${accent}30`,
              } : {
                backgroundColor: 'transparent',
                color: '#6b7280',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: active ? accent : '#6b7280' }}
              />
              {token}
              <span className="opacity-60 font-normal">
                {TOKEN_CHAIN_COUNT[token]}
              </span>
            </button>
          );
        })}
        {(activeChain !== null || activeToken !== null) && (
          <button
            type="button"
            onClick={() => { setActiveChain(null); setActiveToken(null); }}
            className="text-[10px] dark:text-gray-500 text-gray-400 dark:hover:text-white hover:text-gray-900 transition-colors ml-1 underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Chain rows */}
      <div className="flex flex-col gap-1">
        {SUPPORTED_CHAIN_IDS.map(chainId => {
          const rowActive = activeChain === chainId;
          const rowDimmed = activeChain !== null && activeChain !== chainId;
          const supportedCount = TOKEN_NAMES.filter(t => isSupported(chainId, t)).length;

          return (
            <button
              key={chainId}
              type="button"
              onClick={() => setActiveChain(rowActive ? null : chainId)}
              className={`grid gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150 border ${
                rowActive
                  ? 'dark:bg-white/[0.06] bg-black/[0.05] dark:border-white/[0.10] border-black/[0.10]'
                  : 'border-transparent dark:hover:bg-white/[0.03] hover:bg-black/[0.03]'
              }`}
              style={{
                gridTemplateColumns: `1fr repeat(${TOKEN_COUNT}, 1fr)`,
                opacity: rowDimmed ? 0.35 : 1,
              }}
            >
              {/* Chain name + count */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[12px] font-semibold dark:text-gray-200 text-gray-800 truncate">
                  {CHAIN_NAMES[chainId]}
                </span>
                <span className="text-[10px] dark:text-gray-600 text-gray-400 shrink-0">
                  {supportedCount}/{TOKEN_COUNT}
                </span>
              </div>

              {/* Token cells */}
              {TOKEN_NAMES.map(token => {
                const supported = isSupported(chainId, token);
                const dimmed    = isDimmed(chainId, token);
                const accent    = TOKEN_ACCENT[token];
                return (
                  <div key={token} className="flex items-center justify-center">
                    {supported ? (
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-all duration-150"
                        style={{
                          backgroundColor: dimmed ? 'rgba(255,255,255,0.04)' : `${accent}20`,
                          color:           dimmed ? '#4b5563' : accent,
                        }}
                      >
                        {token}
                      </span>
                    ) : (
                      <span className="text-[13px] dark:text-gray-700 text-gray-300 leading-none">—</span>
                    )}
                  </div>
                );
              })}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] dark:text-gray-600 text-gray-400 mt-4">
        Click a row to focus a chain · click a token pill to filter
      </p>
    </div>
  );
};

// ── page ───────────────────────────────────────────────────────────────────────
const CHART_TABS = ['1 DAY', '1 WEEK', '1 MONTH', '1 YEAR'] as const;

const MetricsPage: React.FC = () => {
  const [usdTab,        setUsdTab]        = useState('1 MONTH');
  const [runsTab,       setRunsTab]       = useState('1 MONTH');
  const [projectionTab, setProjectionTab] = useState('1 YEAR');
  const [baselineTab,   setBaselineTab]   = useState('30 DAY AVG');
  const [growthTab,     setGrowthTab]     = useState('CURRENT');

  // ── aggregate metrics ──────────────────────────────────────────────────────
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['public-metrics'],
    queryFn:  fetchPublicMetrics,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const totalUsd      = metrics?.total_usd_disbursed ?? 0;
  const totalRuns     = metrics?.total_payroll_runs  ?? 0;
  const uniqueWallets = metrics?.unique_wallets_paid ?? 0;
  const payrollCount  = metrics?.payroll_count       ?? 0;
  const quickpayCount = metrics?.quickpay_count      ?? 0;

  // ── daily time-series ──────────────────────────────────────────────────────
  // Use the max of both chart tabs so one query serves both charts
  const usdDays  = TAB_DAYS[usdTab]  ?? 30;
  const runsDays = TAB_DAYS[runsTab] ?? 30;
  const maxDays  = Math.max(usdDays, runsDays);

  const { data: dailyMetrics = [], isLoading: chartLoading } = useQuery({
    queryKey: ['daily-metrics', maxDays],
    queryFn:  () => fetchDailyMetrics(maxDays),
    staleTime: 5 * 60_000,
    retry: 1,
  });

  const usdChartData = useMemo(() =>
    dailyMetrics.slice(-usdDays).map(d => ({
      date:  fmtDate(d.date),
      value: d.usd_disbursed,
    })),
  [dailyMetrics, usdDays]);

  const runsChartData = useMemo(() =>
    dailyMetrics.slice(-runsDays).map(d => ({
      date:  fmtDate(d.date),
      value: d.run_count,
    })),
  [dailyMetrics, runsDays]);

  // ── projection ─────────────────────────────────────────────────────────────
  const projMonths     = PROJECTION_MONTHS[projectionTab] ?? 12;
  const growthMult     = GROWTH_MULTIPLIERS[growthTab]    ?? 1;
  const projectionData = useMemo(
    () => buildProjectionData(dailyMetrics, projMonths, growthMult),
    [dailyMetrics, projMonths, growthMult],
  );

  const avgDailyRuns   = dailyMetrics.length > 0
    ? dailyMetrics.reduce((s, d) => s + d.run_count, 0) / dailyMetrics.length
    : 0;
  const avgUsdPerRun   = totalRuns > 0 ? totalUsd / totalRuns : 0;

  return (
    <PageShell title="Metrics" subtitle="Live on-chain data aggregated from all payment events">
      {isError && (
        <p className="text-[13px] dark:text-gray-500 text-gray-400 mb-6">
          Could not load live metrics — database function may not be applied yet.
        </p>
      )}

      {/* ── stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="USD Disbursed"
          value={isLoading ? '' : fmtUsd(totalUsd)}
          sub="total paid on-chain"
          loading={isLoading}
        />
        <StatCard
          label="Payroll Runs"
          value={isLoading ? '' : totalRuns.toLocaleString()}
          sub={`${payrollCount} payroll · ${quickpayCount} quick pay`}
          loading={isLoading}
        />
        <StatCard
          label="Wallets Paid"
          value={isLoading ? '' : uniqueWallets.toLocaleString()}
          sub="unique recipients"
          loading={isLoading}
        />
        <StatCard
          label="Networks"
          value={CHAIN_COUNT}
          sub={`${TOKEN_COUNT} tokens · ${CHAIN_COUNT * TOKEN_COUNT} pairs`}
        />
      </div>

      {/* ── charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="USD Disbursed"
          value={chartLoading ? '—' : fmtUsd(usdChartData.reduce((s, d) => s + d.value, 0))}
          tabs={CHART_TABS as unknown as string[]}
          activeTab={usdTab}
          onTabChange={setUsdTab}
          loading={chartLoading}
        >
          {usdChartData.length === 0 ? (
            <ChartEmpty loading={chartLoading} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usdChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={v => [`$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Disbursed']}
                />
                <Bar dataKey="value" fill="#5D00F2" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Payroll Runs"
          value={chartLoading ? '—' : runsChartData.reduce((s, d) => s + d.value, 0).toString()}
          tabs={CHART_TABS as unknown as string[]}
          activeTab={runsTab}
          onTabChange={setRunsTab}
          loading={chartLoading}
        >
          {runsChartData.length === 0 ? (
            <ChartEmpty loading={chartLoading} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runsChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={v => [v, 'Runs']}
                />
                <Bar dataKey="value" fill="#23DDC6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── forecast section ─────────────────────────────────────────────────── */}
      <Card className="mb-4 !flex-col">
        <Label>Forecast — Projected Payment Activity</Label>

        {/* projection stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-6">
          {[
            {
              label: 'Projected Runs / Year',
              value: Math.round(avgDailyRuns * 365 * growthMult).toLocaleString(),
              unit:  'runs',
            },
            {
              label: 'Projected USD / Year',
              value: fmtUsd(avgDailyRuns * 365 * growthMult * avgUsdPerRun),
              unit:  'USD',
            },
            {
              label: 'Payroll Runs',
              value: isLoading ? '—' : payrollCount.toLocaleString(),
              unit:  'all time',
            },
            {
              label: 'Quick Pay',
              value: isLoading ? '—' : quickpayCount.toLocaleString(),
              unit:  'all time',
            },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              className="dark:bg-white/[0.04] bg-black/[0.03] border dark:border-white/[0.07] border-black/[0.07] rounded-xl p-4"
            >
              <span className="text-[10px] font-semibold tracking-[0.10em] uppercase text-gray-500 block mb-2">
                {label}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[22px] font-extrabold dark:text-white text-gray-900">{value}</span>
                <span className="text-[11px] dark:text-gray-500 text-gray-400">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* controls row */}
        <div className="flex flex-wrap gap-6 mb-5">
          <div>
            <Label>Projection</Label>
            <div className="flex gap-1 dark:bg-white/[0.04] bg-black/[0.04] rounded-lg p-1 mt-2">
              {Object.keys(PROJECTION_MONTHS).map(tab => (
                <TabButton key={tab} active={projectionTab === tab} onClick={() => setProjectionTab(tab)}>
                  {tab}
                </TabButton>
              ))}
            </div>
          </div>
          <div>
            <Label>Baseline</Label>
            <div className="flex gap-1 dark:bg-white/[0.04] bg-black/[0.04] rounded-lg p-1 mt-2">
              {['7 DAY AVG', '30 DAY AVG'].map(tab => (
                <TabButton key={tab} active={baselineTab === tab} onClick={() => setBaselineTab(tab)}>
                  {tab}
                </TabButton>
              ))}
            </div>
          </div>
          <div>
            <Label>Growth</Label>
            <div className="flex gap-1 dark:bg-white/[0.04] bg-black/[0.04] rounded-lg p-1 mt-2">
              {Object.keys(GROWTH_MULTIPLIERS).map(tab => (
                <TabButton key={tab} active={growthTab === tab} onClick={() => setGrowthTab(tab)}>
                  {tab}
                </TabButton>
              ))}
            </div>
          </div>
        </div>

        {/* info line */}
        <div className="flex flex-wrap gap-4 text-[11px] dark:text-gray-500 text-gray-400 mb-4">
          <span>{avgDailyRuns > 0 ? avgDailyRuns.toFixed(1) : '—'} avg runs/day</span>
          <span>
            Avg payout per run:{' '}
            <span className="text-[#5D00F2]">{avgUsdPerRun > 0 ? fmtUsd(avgUsdPerRun) : '—'}</span>
          </span>
          <span className="text-[#23DDC6]">{quickpayCount.toLocaleString()} quick pay</span>
        </div>

        {/* forecast chart */}
        <div className="h-[250px]">
          {projectionData.every(p => p.actual === null && p.projected === 0) ? (
            <ChartEmpty loading={chartLoading} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ paddingTop: '16px' }}
                  formatter={value => (
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#23DDC6"
                  strokeWidth={2}
                  dot={false}
                  name="Runs (actual)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#5D00F2"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Runs (projected)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* ── support matrix ───────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-5">
          <Label>Support Matrix</Label>
          <span className="text-[11px] dark:text-gray-500 text-gray-400">
            {CHAIN_COUNT} chains · {TOKEN_COUNT} tokens
          </span>
        </div>
        <SupportMatrix />
      </Card>

      <Footer />
    </PageShell>
  );
};

export default MetricsPage;
