import { useInView } from '../hooks/useInView';

const CASE_STUDIES = [
  {
    company: 'Remote-First Teams',
    title: 'Cut payroll processing from two days of wire transfers and SWIFT headaches to a single 30-second on-chain transaction.',
    stat: { value: '< 30s', label: 'To pay 200 employees globally' },
    gradient: 'from-[#5D00F2] to-[#23DDC6]',
    tag: 'Global Payroll',
  },
  {
    company: 'DeFi Startups',
    title: 'Eliminate thousands in annual payroll service fees by switching to trustless, direct on-chain batch payments.',
    stat: { value: '$0', label: 'Platform fees, ever' },
    gradient: 'from-indigo-600 to-purple-700',
    tag: 'Cost Savings',
  },
];

export function CaseStudies() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-28 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#5D00F2] mb-3">Real-World Impact</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">How teams use GeniePay</h2>
        </div>
        <div className="space-y-24">
          {CASE_STUDIES.map((cs, i) => (
            <div key={cs.company}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-14'}`}
              style={{ transitionDelay: `${i * 150}ms` }}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <span className="inline-block text-[10px] font-black text-[#23DDC6] tracking-[0.18em] uppercase mb-4 bg-[#23DDC6]/10 px-3 py-1 rounded-full border border-[#23DDC6]/20">{cs.tag}</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">{cs.title}</h3>
                <div>
                  <p className="text-5xl font-black text-white mb-1">{cs.stat.value}</p>
                  <p className="text-gray-600 text-xs uppercase tracking-wide font-semibold">{cs.stat.label}</p>
                </div>
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <div className={`rounded-2xl p-10 bg-gradient-to-br ${cs.gradient} aspect-video flex flex-col items-center justify-center gap-3 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">{cs.company}</p>
                  <p className="text-white text-5xl font-black relative z-10">{cs.stat.value}</p>
                  <p className="text-white/60 text-sm relative z-10">{cs.stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
