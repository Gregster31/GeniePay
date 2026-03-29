import React, {
  useEffect, useRef, useState, useCallback, useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  ArrowRight, Zap, Shield, Globe, Users,
  FileSpreadsheet, ChevronRight, Check, Menu, X,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CHAINS = [
  { name: 'Ethereum', color: '#627eea' },
  { name: 'Polygon',  color: '#8247e5' },
  { name: 'Arbitrum', color: '#28a0f0' },
  { name: 'Optimism', color: '#ff0420' },
  { name: 'Base',     color: '#0052ff' },
  { name: 'USDC',     color: '#2775ca' },
  { name: 'USDT',     color: '#26a17b' },
  { name: 'DAI',      color: '#f5ac37' },
];

const FEATURES = [
  { icon: <Zap size={18}/>,             title: 'Instant settlement',  desc: 'Payments hit wallets in seconds, not 3 to 5 business days. No bank cut-off times, no weekends.' },
  { icon: <Users size={18}/>,           title: 'Batch payroll',       desc: 'Pay your entire team in a single on-chain transaction. 10 or 800 employees, same one click.' },
  { icon: <FileSpreadsheet size={18}/>, title: 'CSV import',          desc: 'Bulk-import your team from any HR tool. Paste a spreadsheet, validate wallets, run payroll.' },
  { icon: <Globe size={18}/>,           title: 'Multi-currency',      desc: 'Pay in ETH, USDC, USDT, or DAI across Ethereum, Polygon, Arbitrum, Base, and more.' },
  { icon: <Shield size={18}/>,          title: 'Non-custodial',       desc: 'Funds go directly from your wallet to your team. We never touch your money.' },
  { icon: <Check size={18}/>,           title: 'Downloadable records', desc: 'Full transaction history with every payroll run. Export anytime for your own bookkeeping.' },
];

const STEPS = [
  { n: '01', title: 'Connect your wallet', desc: 'Use MetaMask, Coinbase Wallet, WalletConnect, or any supported wallet. Your address is your identity. No email, no password.' },
  { n: '02', title: 'Add your team',       desc: 'Add employees manually or bulk-import via CSV. Each person gets a wallet address and a payment amount.' },
  { n: '03', title: 'Run payroll',         desc: 'Select employees, choose ETH or a stablecoin, confirm once in your wallet. All payments go out in a single transaction.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────
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

const useInView = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

const useParallax = () => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return offset;
};

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE NETWORK CANVAS
// ─────────────────────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number; alpha: number;
}

const ParticleCanvas: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const init = useCallback((w: number, h: number) => {
    const count = Math.floor((w * h) / 14000);
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init(canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const CONNECT_DIST = 120;
    const MOUSE_DIST   = 150;

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles.current) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST) {
          const force = (1 - dist / MOUSE_DIST) * 0.4;
          p.vx += (dx / dist) * force * 0.05;
          p.vy += (dy / dist) * force * 0.05;
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > 0.8) { p.vx = (p.vx / speed) * 0.8; p.vy = (p.vy / speed) * 0.8; }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const a = particles.current[i];
          const b = particles.current[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
    };
  }, [init]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERACTIVE GRID CANVAS
// ─────────────────────────────────────────────────────────────────────────────
const GridCanvas: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  const onMouse = useCallback((e: MouseEvent) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (r) mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener('mousemove', onMouse, { passive: true });

    const CELL = 64, RADIUS = 200;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(h / CELL) + 1;
      const { x: mx, y: my } = mouse.current;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL, y = r * CELL;
          const glow = Math.max(0, 1 - Math.hypot(x - mx, y - my) / RADIUS);
          ctx.beginPath();
          ctx.arc(x, y, 1 + glow * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167,139,250,${0.05 + glow * 0.7})`;
          ctx.fill();
        }
      }
      for (let r = 0; r < rows; r++) {
        const y = r * CELL;
        const g = ctx.createLinearGradient(0, 0, w, 0);
        for (let c = 0; c <= cols; c++) {
          const x = c * CELL;
          const glow = Math.max(0, 1 - Math.hypot(x - mx, y - my) / RADIUS);
          g.addColorStop(Math.min(x / w, 1), `rgba(124,58,237,${0.04 + glow * 0.28})`);
        }
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.strokeStyle = g; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (let c = 0; c < cols; c++) {
        const x = c * CELL;
        const g = ctx.createLinearGradient(0, 0, 0, h);
        for (let r = 0; r <= rows; r++) {
          const y = r * CELL;
          const glow = Math.max(0, 1 - Math.hypot(x - mx, y - my) / RADIUS);
          g.addColorStop(Math.min(y / h, 1), `rgba(124,58,237,${0.04 + glow * 0.28})`);
        }
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h);
        ctx.strokeStyle = g; ctx.lineWidth = 0.5; ctx.stroke();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); window.removeEventListener('mousemove', onMouse); };
  }, [onMouse]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// WAVY LINE
// ─────────────────────────────────────────────────────────────────────────────
const WavyLine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 60;
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, 60);
      ctx.beginPath();
      ctx.moveTo(0, 30);
      for (let x = 0; x <= canvas.width; x += 2) {
        const y = 30
          + Math.sin((x / canvas.width) * Math.PI * 6 + t) * 8
          + Math.sin((x / canvas.width) * Math.PI * 3 + t * 0.7) * 4;
        ctx.lineTo(x, y);
      }
      const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad.addColorStop(0,   'rgba(124,58,237,0)');
      grad.addColorStop(0.2, 'rgba(124,58,237,0.6)');
      grad.addColorStop(0.5, 'rgba(167,139,250,1)');
      grad.addColorStop(0.8, 'rgba(124,58,237,0.6)');
      grad.addColorStop(1,   'rgba(124,58,237,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      t += 0.012;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '60px', display: 'block', opacity: 0.7 }} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// LIVE TX FEED
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_TXS = [
  { addr: '0x3F4a...9c2E', amount: '$12,400', token: 'USDC', employees: 14, time: '2s ago' },
  { addr: '0x8B1d...4f7A', amount: '$3,200',  token: 'ETH',  employees: 4,  time: '8s ago' },
  { addr: '0xA92c...1d3F', amount: '$45,000', token: 'USDT', employees: 62, time: '15s ago' },
  { addr: '0x1E5f...8b9C', amount: '$8,750',  token: 'DAI',  employees: 11, time: '28s ago' },
  { addr: '0x7D3a...2e1B', amount: '$21,600', token: 'USDC', employees: 28, time: '41s ago' },
];

const LiveTxFeed: React.FC = () => {
  const [items, setItems] = useState(MOCK_TXS);
  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        const fresh = { ...MOCK_TXS[Math.floor(Math.random() * MOCK_TXS.length)], time: 'just now' };
        next.unshift(fresh);
        return next.slice(0, 5);
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const tokenColor: Record<string, string> = { USDC: '#2775ca', USDT: '#26a17b', ETH: '#627eea', DAI: '#f5ac37' };

  return (
    <div style={{
      background: 'rgba(15,13,22,0.95)',
      border: '0.5px solid rgba(124,58,237,0.3)',
      borderRadius: '16px',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '420px',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', animation: 'blink 2s ease infinite' }} />
        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Live payroll transactions</span>
      </div>
      <div style={{ padding: '8px 0' }}>
        {items.map((tx, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: i < items.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none',
            animation: i === 0 ? 'slide-in .4s ease' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: `${tokenColor[tx.token]}22`,
                border: `0.5px solid ${tokenColor[tx.token]}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700, color: tokenColor[tx.token],
              }}>{tx.token}</div>
              <div>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{tx.amount}</div>
                <div style={{ fontSize: '11px', color: '#4b5563', fontFamily: 'monospace' }}>{tx.addr}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#a78bfa' }}>{tx.employees} employees</div>
              <div style={{ fontSize: '11px', color: '#374151' }}>{tx.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ value: number; suffix: string; label: string; decimals?: number }> = ({
  value, suffix, label, decimals = 0,
}) => {
  const { count, ref } = useCounter(value, 2000, decimals);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '24px 20px',
      background: 'rgba(26,27,34,0.6)',
      border: '0.5px solid rgba(124,58,237,0.2)',
      borderRadius: '16px', backdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
        {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}{suffix}
      </div>
      <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARD
// ─────────────────────────────────────────────────────────────────────────────
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; delay: number }> = ({
  icon, title, desc, delay,
}) => {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      padding: '28px',
      background: 'rgba(26,27,34,0.7)',
      border: '0.5px solid rgba(124,58,237,0.15)',
      borderRadius: '16px',
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms, border-color .2s, background .2s`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(124,58,237,0.5)'; el.style.background = 'rgba(124,58,237,0.08)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(124,58,237,0.15)'; el.style.background = 'rgba(26,27,34,0.7)'; }}
    >
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#a78bfa' }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAIN TICKER
// ─────────────────────────────────────────────────────────────────────────────
const ChainTicker: React.FC = () => (
  <div style={{ overflow: 'hidden', width: '100%' }}>
    <div style={{ display: 'flex', gap: '12px', animation: 'ticker 22s linear infinite', width: 'max-content' }}>
      {[...CHAINS, ...CHAINS, ...CHAINS].map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 14px', borderRadius: '99px', background: 'rgba(26,27,34,0.8)', border: '0.5px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: c.color }} />
          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{c.name}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SOCIAL ICONS
// ─────────────────────────────────────────────────────────────────────────────
const GitHubIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const LinkedInIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
const XIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE MENU
// ─────────────────────────────────────────────────────────────────────────────
const MobileMenu: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,13,22,0.98)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      padding: '24px',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/geniepay_logov4.png" alt="GeniePay" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>GeniePay</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {[
          { label: 'Features', href: '#features' },
          { label: 'How it works', href: '#how-it-works' },
          { label: 'Networks', href: '#networks' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={onClose}
            style={{
              fontSize: '24px', fontWeight: 700, color: '#9ca3af',
              textDecoration: 'none', padding: '12px 8px',
              borderBottom: '0.5px solid rgba(255,255,255,0.05)',
              transition: 'color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Connect wallet at bottom */}
      <div style={{ paddingBottom: '16px' }}>
        <ConnectButton />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useParallax();

  useEffect(() => { if (isConnected) navigate('/dashboard'); }, [isConnected, navigate]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const heroParallax = useMemo(() => scrollY * 0.25, [scrollY]);
  const orbParallax  = useMemo(() => scrollY * 0.15, [scrollY]);

  return (
    <>
      <style>{`
        @keyframes pulse-orb {
          0%,100%{opacity:.6;transform:translateX(-50%) scale(1) translateY(0);}
          50%{opacity:1;transform:translateX(-50%) scale(1.07) translateY(-10px);}
        }
        @keyframes ticker {
          0%{transform:translateX(0);}100%{transform:translateX(-33.33%);}
        }
        @keyframes gradient-shift {
          0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}
        }
        @keyframes badge-pulse {
          0%,100%{border-color:rgba(124,58,237,.4);}
          50%{border-color:rgba(124,58,237,.9);}
        }
        @keyframes blink {
          0%,100%{opacity:1;}50%{opacity:.3;}
        }
        @keyframes slide-in {
          from{opacity:0;transform:translateY(-8px);}
          to{opacity:1;transform:translateY(0);}
        }
        @keyframes float-up {
          0%,100%{transform:translateY(0px);}
          50%{transform:translateY(-16px);}
        }
        @keyframes spin-slow {
          from{transform:rotate(0deg);}to{transform:rotate(360deg);}
        }
        @keyframes reveal-up {
          from{opacity:0;transform:translateY(32px);}
          to{opacity:1;transform:translateY(0);}
        }
        .hero-gradient-text {
          background:linear-gradient(135deg,#fff 0%,#c4b5fd 30%,#818cf8 60%,#60a5fa 100%);
          background-size:200% 200%;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:gradient-shift 6s ease infinite;
        }
        .connect-btn {
          background:linear-gradient(135deg,#7c3aed,#4f46e5);
          color:#fff;border:none;padding:14px 32px;border-radius:12px;
          font-size:15px;font-weight:600;cursor:pointer;
          display:inline-flex;align-items:center;gap:8px;
          transition:opacity .2s,transform .2s,box-shadow .2s;
        }
        .connect-btn:hover{opacity:.88;transform:translateY(-2px);box-shadow:0 8px 32px rgba(124,58,237,.35);}
        .connect-btn:active{transform:translateY(0);}
        .ghost-btn{
          background:transparent;color:#9ca3af;
          border:0.5px solid rgba(255,255,255,.1);
          padding:14px 24px;border-radius:12px;font-size:15px;
          cursor:pointer;transition:color .2s,border-color .2s;
          display:inline-flex;align-items:center;gap:6px;text-decoration:none;
        }
        .ghost-btn:hover{color:#fff;border-color:rgba(255,255,255,.25);}
        .nav-link{font-size:14px;color:#9ca3af;text-decoration:none;transition:color .15s;}
        .nav-link:hover{color:#fff;}
        .nav-links-desktop{display:flex;align-items:center;gap:32px;}
        .nav-hamburger{display:none;}
        .social-link{
          display:flex;align-items:center;justify-content:center;
          width:36px;height:36px;border-radius:8px;color:#6b7280;
          border:0.5px solid rgba(255,255,255,.08);
          transition:color .2s,border-color .2s,background .2s;text-decoration:none;
        }
        .social-link:hover{color:#a78bfa;border-color:rgba(124,58,237,.4);background:rgba(124,58,237,.08);}
        .hero-content{animation:reveal-up .8s ease both;}
        .hero-content-delay{animation:reveal-up .8s ease .15s both;}
        .hero-content-delay2{animation:reveal-up .8s ease .3s both;}
        .hero-content-delay3{animation:reveal-up .8s ease .45s both;}

        /* ── Responsive ── */
        @media(max-width:900px){
          .features-grid{grid-template-columns:1fr 1fr !important;}
          .stats-grid{grid-template-columns:repeat(2,1fr) !important;}
          .hero-split{flex-direction:column !important;}
          .live-feed-col{display:none !important;}
          .nav-links-desktop{display:none !important;}
          .nav-hamburger{display:flex !important;}
        }
        @media(max-width:600px){
          .features-grid{grid-template-columns:1fr !important;}
          .stats-grid{grid-template-columns:1fr 1fr !important;}
          .connect-btn{padding:12px 24px;font-size:14px;}
          .ghost-btn{padding:12px 18px;font-size:14px;}
        }
      `}</style>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div style={{ backgroundColor:'#0f0d16',color:'#fff',minHeight:'100vh',fontFamily:'Inter,-apple-system,sans-serif',overflowX:'hidden' }}>

        {/* ── Navbar ── */}
        <nav style={{
          position:'fixed',top:0,left:0,right:0,zIndex:100,
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'0 clamp(16px,4vw,64px)',height:'68px',
          background: scrolled ? 'rgba(15,13,22,.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '0.5px solid rgba(124,58,237,.15)' : 'none',
          transition:'background .3s,backdrop-filter .3s,border-color .3s',
        }}>
          {/* Mobile: hamburger on the left */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '8px',
              cursor: 'pointer', color: '#9ca3af',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Logo — centered on mobile, left on desktop */}
          <button onClick={() => navigate('/')} style={{ display:'flex',alignItems:'center',gap:'10px',background:'none',border:'none',cursor:'pointer',padding:0 }}>
            <img src="/geniepay_logov4.png" alt="GeniePay" style={{ width:'30px',height:'30px',objectFit:'contain' }} />
            <span style={{ fontSize:'20px',fontWeight:800,letterSpacing:'-0.02em',color:'#fff' }}>GeniePay</span>
          </button>

          {/* Desktop nav */}
          <div className="nav-links-desktop">
            <a href="#features"     className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#networks"     className="nav-link">Networks</a>
            <ConnectButton />
          </div>

          {/* Mobile: connect button on the right */}
          <div className="nav-hamburger" style={{ alignItems:'center' }}>
            <ConnectButton showBalance={false} />
          </div>
        </nav>

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        <section style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'120px clamp(24px,5vw,64px) 80px',position:'relative',overflow:'hidden' }}>

          <ParticleCanvas style={{ zIndex: 0 }} />
          <GridCanvas style={{ zIndex: 1, opacity: 0.6 }} />

          <img src="/world-map.svg" alt="" aria-hidden="true" style={{
            position:'absolute',top:'50%',left:'50%',
            transform:`translate(-50%,calc(-50% + ${heroParallax}px))`,
            width:'90%',maxWidth:'1100px',
            opacity:0.055,pointerEvents:'none',userSelect:'none',zIndex:1,
            filter:'brightness(1.5)',transition:'transform 0s',
          }} />

          <div style={{
            position:'absolute',top:'-10%',left:'50%',
            transform:`translateX(-50%) translateY(${orbParallax}px)`,
            width:'900px',height:'550px',borderRadius:'50%',
            background:'radial-gradient(ellipse,rgba(124,58,237,.16) 0%,rgba(79,70,229,.06) 50%,transparent 70%)',
            animation:'pulse-orb 8s ease-in-out infinite',
            pointerEvents:'none',zIndex:1,
          }} />

          <div style={{
            position:'absolute',top:'50%',left:'50%',
            transform:`translate(-50%,-50%) translateY(${heroParallax * 0.5}px)`,
            width:'600px',height:'600px',borderRadius:'50%',
            border:'0.5px solid rgba(124,58,237,0.08)',
            animation:'spin-slow 40s linear infinite',
            pointerEvents:'none',zIndex:1,
          }} />
          <div style={{
            position:'absolute',top:'50%',left:'50%',
            transform:`translate(-50%,-50%) translateY(${heroParallax * 0.3}px)`,
            width:'800px',height:'800px',borderRadius:'50%',
            border:'0.5px solid rgba(124,58,237,0.05)',
            animation:'spin-slow 60s linear infinite reverse',
            pointerEvents:'none',zIndex:1,
          }} />

          <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'220px',background:'linear-gradient(to bottom,transparent,#0f0d16)',pointerEvents:'none',zIndex:2 }} />

          {/* Hero split layout */}
          <div className="hero-split" style={{ position:'relative',zIndex:3,display:'flex',alignItems:'center',gap:'64px',maxWidth:'1200px',width:'100%' }}>

            <div style={{ flex:1,textAlign:'left' }}>
              <div className="hero-content" style={{
                display:'inline-flex',alignItems:'center',gap:'8px',
                padding:'6px 16px',borderRadius:'99px',
                background:'rgba(124,58,237,.1)',
                border:'0.5px solid rgba(124,58,237,.4)',
                fontSize:'13px',color:'#a78bfa',
                marginBottom:'32px',
                animation:'badge-pulse 3s ease-in-out infinite',
              }}>
                <Zap size={12} style={{ color:'#7c3aed',flexShrink:0 }} />
                {/* Updated badge copy */}
                Free. No account. No middlemen.
              </div>

              {/* Updated headline */}
              <h1 className="hero-gradient-text hero-content-delay" style={{ fontSize:'clamp(40px,6vw,80px)',fontWeight:800,lineHeight:1.05,letterSpacing:'-0.04em',marginBottom:'24px',display:'block' }}>
                Pay your global<br />team in one click
              </h1>

              {/* Updated subheadline — matches README tone */}
              <p className="hero-content-delay2" style={{ fontSize:'clamp(15px,1.8vw,18px)',color:'#6b7280',maxWidth:'480px',lineHeight:1.7,marginBottom:'40px' }}>
                Send payroll to 800 employees or contractors worldwide in a single transaction.
                Faster, cheaper, and entirely yours.
              </p>

              <div className="hero-content-delay3" style={{ display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap' }}>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button className="connect-btn" onClick={openConnectModal}>
                      Connect wallet to start <ArrowRight size={16} />
                    </button>
                  )}
                </ConnectButton.Custom>
                <a href="#how-it-works" className="ghost-btn">
                  See how it works <ChevronRight size={14} />
                </a>
              </div>

              <div style={{ display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'#4b5563',marginTop:'24px',flexWrap:'wrap' }}>
                {['No credit card','No sign-up','Open source'].map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <span style={{ color:'#1f2937' }}>·</span>}
                    <span style={{ display:'flex',alignItems:'center',gap:'4px' }}>
                      <Check size={11} style={{ color:'#7c3aed' }} />{t}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="live-feed-col" style={{ flexShrink:0,width:'420px',animation:'float-up 6s ease-in-out infinite' }}>
              <LiveTxFeed />
            </div>
          </div>
        </section>

        <WavyLine />

        {/* ── Chain ticker ── */}
        <div id="networks" style={{ padding:'20px 0',borderBottom:'0.5px solid rgba(255,255,255,.05)',background:'rgba(26,27,34,.4)' }}>
          <ChainTicker />
        </div>

        {/* ── Stats ── */}
        <section style={{ padding:'80px clamp(24px,5vw,64px)' }}>
          <div className="stats-grid" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',maxWidth:'960px',margin:'0 auto' }}>
            <StatCard value={0}   suffix="$" label="Platform fees" />
            <StatCard value={6}   suffix="+" label="Networks supported" />
            <StatCard value={800} suffix="+" label="Employees per run" />
            <StatCard value={3}   suffix="s" label="Average settlement" />
          </div>
        </section>

        <WavyLine />

        {/* ── Features ── */}
        <section id="features" style={{ padding:'80px clamp(24px,5vw,64px)',background:'rgba(26,27,34,.2)' }}>
          <div style={{ maxWidth:'960px',margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:'56px' }}>
              <div style={{ fontSize:'11px',fontWeight:600,color:'#7c3aed',textTransform:'uppercase',letterSpacing:'.12em',marginBottom:'12px' }}>Features</div>
              {/* Updated section headline */}
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)',fontWeight:700,letterSpacing:'-0.03em',color:'#fff',marginBottom:'12px' }}>Everything your payroll needs</h2>
              <p style={{ fontSize:'15px',color:'#6b7280',maxWidth:'480px',margin:'0 auto' }}>Built for teams of 1 to 800. No friction, no middlemen, no surprises.</p>
            </div>
            <div className="features-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px' }}>
              {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 80} />)}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" style={{ padding:'80px clamp(24px,5vw,64px)' }}>
          <div style={{ maxWidth:'640px',margin:'0 auto' }}>
            <div style={{ textAlign:'center',marginBottom:'56px' }}>
              <div style={{ fontSize:'11px',fontWeight:600,color:'#7c3aed',textTransform:'uppercase',letterSpacing:'.12em',marginBottom:'12px' }}>How it works</div>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)',fontWeight:700,letterSpacing:'-0.03em',color:'#fff' }}>Up and running in 3 steps</h2>
            </div>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display:'flex',gap:'20px' }}>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0 }}>
                  <div style={{ width:'40px',height:'40px',borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff' }}>{step.n}</div>
                  {i < STEPS.length - 1 && <div style={{ width:'1px',flex:1,minHeight:'40px',background:'linear-gradient(to bottom,rgba(124,58,237,.5),rgba(124,58,237,.05))',margin:'8px 0' }} />}
                </div>
                <div style={{ paddingBottom: i < STEPS.length - 1 ? '40px' : 0, paddingTop:'8px' }}>
                  <div style={{ fontSize:'17px',fontWeight:600,color:'#fff',marginBottom:'8px' }}>{step.title}</div>
                  <div style={{ fontSize:'14px',color:'#6b7280',lineHeight:1.7 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <WavyLine />

        {/* ── CTA ── */}
        <section style={{ padding:'120px clamp(24px,5vw,64px)',textAlign:'center',position:'relative',overflow:'hidden' }}>
          <ParticleCanvas style={{ zIndex:0 }} />
          <GridCanvas    style={{ zIndex:1, opacity:0.6 }} />
          <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'600px',height:'400px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(124,58,237,.14) 0%,transparent 70%)',pointerEvents:'none',zIndex:1 }} />
          <div style={{ position:'relative',zIndex:2 }}>
            {/* Updated CTA copy */}
            <h2 style={{ fontSize:'clamp(30px,5vw,56px)',fontWeight:800,letterSpacing:'-0.03em',color:'#fff',marginBottom:'16px',lineHeight:1.1 }}>Ready to pay your team?</h2>
            <p style={{ fontSize:'16px',color:'#6b7280',maxWidth:'400px',margin:'0 auto 36px',lineHeight:1.7 }}>No sign-up. No fees. Connect your wallet and go.</p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button className="connect-btn" onClick={openConnectModal} style={{ fontSize:'16px',padding:'16px 40px' }}>
                  Get started for free <ArrowRight size={18} />
                </button>
              )}
            </ConnectButton.Custom>
            <div style={{ fontSize:'12px',color:'#374151',marginTop:'16px' }}>Works with MetaMask, Coinbase Wallet, Rainbow, and 100+ wallets</div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ padding:'24px clamp(24px,5vw,64px)',borderTop:'0.5px solid rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
            <img src="/geniepay_logov4.png" alt="GeniePay" style={{ width:'20px',height:'20px',objectFit:'contain',opacity:.6 }} />
            <span style={{ fontSize:'13px',color:'#4b5563' }}>GeniePay · 2025</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
            <a href="https://github.com/Gregster31/GeniePay"         target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub"><GitHubIcon /></a>
            <a href="https://www.linkedin.com/company/geniepayworks" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn"><LinkedInIcon /></a>
            <a href="https://x.com/pay_genie"                       target="_blank" rel="noopener noreferrer" className="social-link" title="X"><XIcon /></a>
          </div>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;