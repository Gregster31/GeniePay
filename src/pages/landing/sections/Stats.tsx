import { useInView } from '../hooks/useInView';
import { useCounter } from '../hooks/useCounter';

const STATS = [
  { value: 23.5, suffix: 'T',  label: 'Annual cross-border business payments', prefix: '$', decimals: 1 },
  { value: 120,  suffix: 'B+', label: 'In annual remittance fees wasted',       prefix: '$', decimals: 0 },
  { value: 800,  suffix: '',   label: 'Max employees per transaction',           prefix: '',  decimals: 0 },
  { value: 5,    suffix: '',   label: 'Supported blockchain networks',           prefix: '',  decimals: 0 },
];

function StatItem({ value, suffix, label, prefix, decimals }: typeof STATS[0]) {
  const { count, ref } = useCounter(value, 2200, decimals);
  return (
    <div ref={ref} className="text-center group">
      <p className="text-5xl md:text-6xl font-black text-white mb-2 tabular-nums group-hover:text-[#23DDC6] transition-colors duration-500">
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-gray-600 text-xs leading-snug max-w-[140px] mx-auto uppercase tracking-wide font-semibold">{label}</p>
    </div>
  );
}

export function Stats() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-28 bg-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#5D00F2] opacity-[0.05] blur-[160px] rounded-full animate-glow-pulse" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#5D00F2] mb-4">The Problem We Solve</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight">
            The global payroll problem is <span className="text-[#23DDC6]">enormous</span>
          </h2>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            GeniePay eliminates fees, delays, and intermediaries for cross-border team payments.
          </p>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {STATS.map(s => <StatItem key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  );
}
