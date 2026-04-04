import { useInView } from '../hooks/useInView';
import { ConnectWalletButton } from './ConnectWalletButton';

const STEPS = [
  { n: '01', title: 'Connect your wallet',  desc: 'Use MetaMask, Brave Wallet, Coinbase Wallet, or WalletConnect. Your address is your identity.' },
  { n: '02', title: 'Add your team',         desc: 'Add employees manually or bulk-import via CSV. Set wallet addresses and USD payment amounts. ENS names supported.' },
  { n: '03', title: 'Run payroll',            desc: 'Select your team, choose a token, confirm once in your wallet. All payments go out in a single on-chain transaction.' },
];

export function GetStarted() {
  const { ref, visible } = useInView();

  return (
    <section id="how-it-works" ref={ref} className="py-28 bg-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#5D00F2] opacity-[0.04] blur-[180px] pointer-events-none rounded-full" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#23DDC6] mb-4">No upfront cost. No lock-in.</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
              Get started for{' '}
              <span className="bg-gradient-to-r from-[#5D00F2] to-violet-400 bg-clip-text text-transparent">free</span>{' '}
              in under a minute
            </h2>
            <p className="text-gray-500 text-base mb-10 leading-relaxed">
              Connect your wallet and start paying your team anywhere in the world.
            </p>
            <ConnectWalletButton variant="ghost" />
          </div>
          <div className={`space-y-4 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#5D00F2]/50 hover:bg-white/[0.04] transition-all duration-300 group"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#5D00F2]/15 group-hover:bg-[#5D00F2]/25 flex items-center justify-center transition-colors">
                  <span className="text-[#5D00F2] font-black text-xs">{step.n}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1.5 text-sm">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
