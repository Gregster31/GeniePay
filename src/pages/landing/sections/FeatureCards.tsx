import { useRef, useState } from 'react';
import { Zap, Shield, Globe, Users, FileSpreadsheet, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const FEATURES = [
  {
    title: 'Instant Settlement',
    description: 'Payments hit wallets in seconds, not 3 to 5 business days. No bank cut-off times, no weekends, no delays.',
    bgImage: 'linear-gradient(135deg, #5D00F2 0%, #8B5CF6 55%, #23DDC6 100%)',
    Icon: Zap,
  },
  {
    title: 'Batch Payroll',
    description: 'Pay your entire team in a single on-chain transaction. 10 or 800 employees, same one click.',
    bgImage: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 55%, #3b82f6 100%)',
    Icon: Users,
  },
  {
    title: 'CSV Import',
    description: 'Bulk-import your team from any HR tool. Paste a spreadsheet, validate wallets, run payroll.',
    bgImage: 'linear-gradient(135deg, #0ea5e9 0%, #23DDC6 55%, #6366f1 100%)',
    Icon: FileSpreadsheet,
  },
  {
    title: 'Multi-Currency',
    description: 'Pay in ETH, USDC across Ethereum, Polygon, Arbitrum, Base, and more.',
    bgImage: 'linear-gradient(135deg, #f97316 0%, #ef4444 55%, #ec4899 100%)',
    Icon: Globe,
  },
  {
    title: 'Non-Custodial',
    description: 'Funds go directly from your wallet to your team. We never hold, touch, or see your money.',
    bgImage: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 55%, #0ea5e9 100%)',
    Icon: Shield,
  },
  {
    title: 'Downloadable Records',
    description: 'Full transaction history with every payroll run. Export PDFs and CSVs for your bookkeeping.',
    bgImage: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 55%, #d946ef 100%)',
    Icon: Check,
  },
];

export function FeatureCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);
  const { ref, visible } = useInView();

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 8);
  };

  return (
    <section id="features" ref={ref} className="py-28 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-end justify-between mb-12 gap-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#5D00F2] mb-3">Everything You Need</p>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              Built for on-chain payroll<br />
              <span className="bg-gradient-to-r from-[#5D00F2] to-[#23DDC6] bg-clip-text text-transparent">from day one</span>
            </h2>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {(['left', 'right'] as const).map(dir => {
              const enabled = dir === 'left' ? canLeft : canRight;
              return (
                <button key={dir}
                  onClick={() => scrollRef.current?.scrollBy({ left: dir === 'left' ? -330 : 330, behavior: 'smooth' })}
                  disabled={!enabled}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    enabled ? 'border-white/20 hover:bg-white/10 text-white' : 'border-white/[0.05] text-gray-800 cursor-not-allowed'
                  }`}>
                  {dir === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              );
            })}
          </div>
        </div>
        <div ref={scrollRef} onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {FEATURES.map(f => {
            const Icon = f.Icon;
            return (
              <div key={f.title}
                className="flex-shrink-0 w-72 h-[17rem] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group snap-start hover:-translate-y-2 transition-transform duration-300 cursor-default"
                style={{ background: f.bgImage }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-11 h-11 rounded-xl bg-black/25 flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
                <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-lg leading-none">+</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-base mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
