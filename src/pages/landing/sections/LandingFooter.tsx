import { Github, Linkedin, Twitter } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'GitHub',           href: 'https://github.com/Gregster31/GeniePay' },
  { label: 'LinkedIn',         href: 'https://www.linkedin.com/company/geniepayworks' },
  { label: 'Twitter',          href: 'https://x.com/pay_genie' },
  { label: 'BUSL-1.1 License', href: 'https://github.com/Gregster31/GeniePay/blob/main/LICENSE' },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.05] bg-black">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <a href="/" className="flex items-center gap-2.5 group">
            <img src="/geniepay_logov4.png" alt="GeniePay" className="w-7 h-7 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="text-white font-black uppercase tracking-[0.22em] text-sm">GeniePay</span>
          </a>
          <div className="flex items-center gap-5">
            <a href="https://github.com/Gregster31/GeniePay" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Github size={18} /></a>
            <a href="https://www.linkedin.com/company/geniepayworks" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Linkedin size={18} /></a>
            <a href="https://x.com/pay_genie" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors"><Twitter size={18} /></a>
          </div>
          <p className="text-gray-700 text-xs uppercase tracking-wide font-semibold">2025 GeniePay. All rights reserved.</p>
        </div>
        <div className="pt-8 border-t border-white/[0.04] flex flex-wrap justify-center gap-6 text-[11px] text-gray-700 uppercase tracking-wide font-semibold">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">{label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
