import { Github } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { ConnectWalletButton } from './ConnectWalletButton';

export function CTA() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-36 bg-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative">
          <div className="w-[600px] h-[600px] bg-[#5D00F2] rounded-full opacity-[0.10] blur-[180px] animate-glow-pulse" />
          <div className="absolute inset-0 w-[600px] h-[600px] bg-[#23DDC6] rounded-full opacity-[0.03] blur-[140px] scale-75 animate-float" />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04]">
        <div className="w-[800px] h-[800px] rounded-full animate-spin-slow"
          style={{ background: 'conic-gradient(from 0deg, #5D00F2, #23DDC6, #5D00F2)', WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)' }} />
      </div>
      <div className={`max-w-3xl mx-auto px-6 text-center relative z-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#5D00F2] mb-4">Get Started Today</p>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          Ready to modernize<br />
          <span className="bg-gradient-to-r from-[#5D00F2] via-violet-400 to-[#23DDC6] bg-clip-text text-transparent">your payroll?</span>
        </h2>
        <p className="text-gray-500 text-base mb-12 leading-relaxed">
          Join the future of global payroll. No fees, no middlemen, no delays.
          Pay your entire team directly from your wallet, in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ConnectWalletButton variant="primary" />
          <a href="https://github.com/Gregster31/GeniePay" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.10] text-white px-10 py-4 rounded-full font-semibold text-sm border border-white/10 hover:border-white/20 transition-all hover:scale-105">
            <Github size={18} /> Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
