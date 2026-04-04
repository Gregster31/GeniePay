import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Wallet } from 'lucide-react';

export type BtnVariant = 'primary' | 'ghost' | 'header';

export function ConnectWalletButton({ variant = 'primary', className = '' }: { variant?: BtnVariant; className?: string }) {
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
