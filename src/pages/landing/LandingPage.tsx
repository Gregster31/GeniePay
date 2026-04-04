import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Zap, Shield, Globe, Users, FileSpreadsheet, Check,
  ChevronLeft, ChevronRight, Menu, X, ArrowRight,
  Github, Linkedin, Twitter, Wallet,
} from 'lucide-react';

const FEATURED_NETWORKS = [
  { name: 'Ethereum', color: '#627EEA', ticker: 'ETH' },
  { name: 'Polygon',  color: '#8247E5', ticker: 'POL' },
  { name: 'Arbitrum', color: '#28A0F0', ticker: 'ARB' },
  { name: 'Optimism', color: '#FF0420', ticker: 'OP'  },
  { name: 'Base',     color: '#0052FF', ticker: 'BASE'},
  { name: 'Avalanche',color: '#E84142', ticker: 'AVAX'},
];

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

const STATS = [
  { value: 23.5, suffix: 'T',  label: 'Annual cross-border business payments', prefix: '$', decimals: 1 },
  { value: 120,  suffix: 'B+', label: 'In annual remittance fees wasted',       prefix: '$', decimals: 0 },
  { value: 800,  suffix: '',   label: 'Max employees per transaction',           prefix: '',  decimals: 0 },
  { value: 5,    suffix: '',   label: 'Supported blockchain networks',           prefix: '',  decimals: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

const useCounter = (target: number, duration = 2000, decimals = 0) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setCount(parseFloat((ease * target).toFixed(decimals)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration, decimals]);
  return { count, ref };
};

// ─────────────────────────────────────────────────────────────────────────────
// CONNECT BUTTON
// ─────────────────────────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'ghost' | 'header';

function ConnectWalletButton({ variant = 'primary', className = '' }: { variant?: BtnVariant; className?: string }) {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) navigate('/dashboard');
  }, [isConnected, navigate]);

  if (isConnected) {
    const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected';
    if (variant === 'header') {
      return (
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.14] text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10 hover:border-white/20 transition-all">
          <span className="w-2 h-2 rounded-full bg-[#23DDC6] animate-pulse" />
          {short}
        </button>
      );
    }
    return (
      <button onClick={() => navigate('/dashboard')}
        className={`flex items-center gap-2 text-white font-black text-xs uppercase tracking-wide transition-all hover:scale-105 ${
          variant === 'primary'
            ? 'bg-[#5D00F2] hover:bg-[#4a00c4] px-9 py-4 rounded-full shadow-xl shadow-[#5D00F2]/40'
            : 'bg-white/[0.06] hover:bg-white/[0.12] px-7 py-3 rounded-full border border-white/10 hover:border-white/20'
        } ${className}`}>
        <Wallet size={variant === 'primary' ? 16 : 14} />
        Open App <ArrowRight size={variant === 'primary' ? 15 : 13} />
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ openConnectModal }) => (
        variant === 'header' ? (
          <button onClick={openConnectModal}
            className={`flex items-center gap-2 bg-[#5D00F2] hover:bg-[#4a00c4] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wide transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#5D00F2]/40 ${className}`}>
            <Wallet size={13} /> Connect Wallet
          </button>
        ) : variant === 'primary' ? (
          <div className="relative">
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-r from-[#5D00F2] via-violet-400 to-[#23DDC6] opacity-60 blur-[6px] animate-glow-pulse" />
            <button onClick={openConnectModal}
              className={`relative flex items-center gap-2.5 bg-[#5D00F2] hover:bg-[#4a00c4] text-white px-9 py-4 rounded-full font-black text-sm uppercase tracking-wide transition-all hover:scale-105 shadow-xl shadow-[#5D00F2]/40 ${className}`}>
              <Wallet size={16} /> Connect Wallet <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <button onClick={openConnectModal}
            className={`group flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white px-7 py-3 rounded-full text-xs font-black uppercase tracking-wide border border-white/10 hover:border-white/20 transition-all hover:scale-105 ${className}`}>
            <Wallet size={14} /> Connect Wallet
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )
      )}
    </ConnectButton.Custom>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features',     href: '#features'    },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Networks',     href: '#networks'     },
    { label: 'GitHub',       href: 'https://github.com/Gregster31/GeniePay', external: true },
  ];

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
            {navLinks.map(({ label, href, external }) =>
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
            {navLinks.map(({ label, href, external }) =>
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

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; op: number; cyan: boolean }[] = [];

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 0.4,
        op: Math.random() * 0.45 + 0.1,
        cyan: Math.random() > 0.75,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = p.cyan || q.cyan
              ? `rgba(35,221,198,${0.14 * (1 - dist / 120)})`
              : `rgba(93,0,242,${0.18 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan ? `rgba(35,221,198,${p.op})` : `rgba(93,0,242,${p.op})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden bg-black">
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{
        backgroundImage: 'linear-gradient(rgba(93,0,242,1) 1px, transparent 1px), linear-gradient(90deg, rgba(93,0,242,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[520px] h-[520px] bg-[#5D00F2] rounded-full opacity-[0.20] blur-[140px] animate-drift" />
        <div className="absolute bottom-1/4 right-1/5 w-[400px] h-[400px] bg-[#23DDC6] rounded-full opacity-[0.08] blur-[120px] animate-drift" style={{ animationDelay: '4s', animationDuration: '22s' }} />
        <div className="absolute top-2/3 left-1/2 w-[320px] h-[320px] bg-[#5D00F2] rounded-full opacity-[0.07] blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white mb-6 tracking-tight leading-[1.05] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Pay Your Entire Team{' '}
          <span className="bg-clip-text text-transparent animate-gradient-x" style={{
            backgroundImage: 'linear-gradient(270deg, #5D00F2, #8B5CF6, #23DDC6, #5D00F2)',
            backgroundSize: '300% 300%',
          }}>
            On-Chain.
          </span>
          <br />
          <span className="text-white/50 font-semibold text-4xl md:text-6xl lg:text-7xl">Instantly.</span>
        </h1>

        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          The blockchain payroll tool for global teams.
          Manage and pay up to 800 employees worldwide in a single transaction and generate tax helpful documents.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <ConnectWalletButton variant="primary" />
          <a href="https://github.com/Gregster31/GeniePay" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.10] text-white px-9 py-4 rounded-full font-semibold text-sm border border-white/10 hover:border-white/20 transition-all hover:scale-105">
            <Github size={16} /> View on GitHub
          </a>
        </div>

        <div className="flex items-center justify-center gap-2.5 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
          <span className="text-[11px] text-gray-700 mr-1 uppercase tracking-wide font-semibold">Supported on</span>
          {FEATURED_NETWORKS.map(({ name, color }) => (
            <span key={name} className="text-[11px] font-semibold bg-white/[0.04] border rounded-full px-3 py-1 hover:opacity-100 opacity-60 transition-all cursor-default"
              style={{ borderColor: `${color}40`, color }}>
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-[#5D00F2]" />
        <div className="w-1 h-1 rounded-full bg-[#5D00F2]" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

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

function Stats() {
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

// ─────────────────────────────────────────────────────────────────────────────
// GET STARTED
// ─────────────────────────────────────────────────────────────────────────────

function GetStarted() {
  const { ref, visible } = useInView();

  const steps = [
    { n: '01', title: 'Connect your wallet',  desc: 'Use MetaMask, Brave Wallet, Coinbase Wallet, or WalletConnect. Your address is your identity.' },
    { n: '02', title: 'Add your team',         desc: 'Add employees manually or bulk-import via CSV. Set wallet addresses and USD payment amounts. ENS names supported.' },
    { n: '03', title: 'Run payroll',            desc: 'Select your team, choose a token, confirm once in your wallet. All payments go out in a single on-chain transaction.' },
  ];

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
            {steps.map((step, i) => (
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

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARDS
// ─────────────────────────────────────────────────────────────────────────────

function FeatureCards() {
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

// ─────────────────────────────────────────────────────────────────────────────
// CASE STUDIES
// ─────────────────────────────────────────────────────────────────────────────

function CaseStudies() {
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

// ─────────────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────────────

function CTA() {
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

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  const footerLinks = [
    { label: 'GitHub',           href: 'https://github.com/Gregster31/GeniePay' },
    { label: 'LinkedIn',         href: 'https://www.linkedin.com/company/geniepayworks' },
    { label: 'Twitter',          href: 'https://x.com/pay_genie' },
    { label: 'BUSL-1.1 License', href: 'https://github.com/Gregster31/GeniePay/blob/main/LICENSE' },
  ];

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
          {footerLinks.map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">{label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <Hero />
      <Stats />
      <GetStarted />
      <FeatureCards />
      <CaseStudies />
      <CTA />
      <Footer />
    </main>
  );
}
