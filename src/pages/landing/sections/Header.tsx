import { useEffect, useState } from 'react';
import { Github, Menu, X } from 'lucide-react';
import { ConnectWalletButton } from './ConnectWalletButton';

const NAV_LINKS = [
  { label: 'Features',     href: '#features'    },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Networks',     href: '#networks'     },
  { label: 'GitHub',       href: 'https://github.com/Gregster31/GeniePay', external: true },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/[0.07] shadow-xl shadow-black/60' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <img src="/geniepay_logov4.png" alt="GeniePay" className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-white font-black uppercase tracking-[0.22em] text-sm whitespace-nowrap">GeniePay</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href, external }) =>
              external
                ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold tracking-wide text-gray-500 hover:text-white transition-colors uppercase">{label}</a>
                : <a key={label} href={href} className="text-xs font-semibold tracking-wide text-gray-500 hover:text-white transition-colors uppercase">{label}</a>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="https://github.com/Gregster31/GeniePay" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white transition-colors p-1">
              <Github size={18} />
            </a>
            <ConnectWalletButton variant="header" />
          </div>

          <button className="md:hidden text-white p-1" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="md:hidden mt-4 pb-5 border-t border-white/10 pt-5 flex flex-col gap-5">
            {NAV_LINKS.map(({ label, href, external }) =>
              external
                ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{label}</a>
                : <a key={label} href={href} className="text-xs font-semibold tracking-wide text-gray-400 uppercase" onClick={() => setMenuOpen(false)}>{label}</a>
            )}
            <ConnectWalletButton variant="header" />
          </div>
        )}
      </div>
    </header>
  );
}
