import { useEffect, useRef } from 'react';
import { Github } from 'lucide-react';
import { ConnectWalletButton } from './ConnectWalletButton';

const FEATURED_NETWORKS = [
  { name: 'Ethereum', color: '#627EEA' },
  { name: 'Polygon',  color: '#8247E5' },
  { name: 'Arbitrum', color: '#28A0F0' },
  { name: 'Optimism', color: '#FF0420' },
  { name: 'Base',     color: '#0052FF' },
  { name: 'Avalanche',color: '#E84142' },
];

export function Hero() {
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
