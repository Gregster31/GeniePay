import React, { useEffect, useState } from 'react';
import { Search, Globe, Moon, Sun, Menu } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useTheme } from '@/contexts/ThemeContext';

interface AppHeaderProps {
  onMobileMenuToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMobileMenuToggle }) => {
  const { isDark, toggle } = useTheme();
  const { chain } = useAccount();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] h-[72px] flex items-center justify-between gap-4 px-4 sm:px-6
        transition-all duration-300
        ${scrolled
          ? 'border-b dark:bg-[rgba(8,6,14,0.72)] dark:border-white/[0.07] bg-[rgba(238,234,227,0.85)] border-black/[0.08]'
          : 'bg-transparent border-transparent'
        }`}
      style={scrolled ? { backdropFilter: 'blur(28px) saturate(1.8)', WebkitBackdropFilter: 'blur(28px) saturate(1.8)' } : {}}
    >
      {/* ── Left: Logo ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer
            dark:bg-white/[0.06] dark:border dark:border-white/[0.09] dark:text-white
            bg-black/[0.05] border border-black/[0.09] text-gray-800"
        >
          <Menu size={15} />
        </button>
        <img src="/geniepay_logov4.png" alt="" className="w-[28px] h-[28px] object-contain opacity-90" />
        <span className="text-[13px] font-black uppercase tracking-[0.22em] whitespace-nowrap dark:text-white text-gray-900">
          GeniePay
        </span>
      </div>

      {/* ── Right: Controls ── */}
      <div className="flex items-center gap-3 shrink-0">

        {/* Search — hidden on mobile, visible md+ */}
        <div className="relative hidden md:block">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            placeholder="Search..."
            className="w-[260px] lg:w-[320px] h-10 pl-9 pr-10 rounded-full text-[13px] font-medium outline-none transition-all duration-150
              dark:text-gray-300 dark:placeholder-gray-600
              dark:bg-white/[0.04] dark:border dark:border-white/[0.07]
              dark:focus:border-white/[0.18] dark:focus:bg-white/[0.06]
              text-gray-700 placeholder-gray-400
              bg-black/[0.04] border border-black/[0.08]
              focus:border-black/[0.18]"
          />
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-px rounded-full text-[10px] font-mono leading-none
            dark:text-gray-600 dark:bg-white/[0.05] dark:border dark:border-white/[0.07]
            text-gray-400 bg-black/[0.05] border border-black/[0.07]">
            /
          </kbd>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="relative w-12 h-[26px] rounded-full cursor-pointer p-0 shrink-0 border transition-colors duration-200
            dark:bg-white/[0.04] dark:border-white/[0.09]
            bg-black/[0.04] border-black/[0.09]"
        >
          <span className={`absolute top-[3px] w-5 h-5 rounded-full flex items-center justify-center text-black
            bg-[#23DDC6] shadow-[0_0_8px_rgba(35,221,198,0.6)] transition-[left] duration-[220ms]
            ${isDark ? 'left-[3px]' : 'left-[19px]'}`}>
            {isDark ? <Moon size={10} /> : <Sun size={10} />}
          </span>
        </button>

        {/* Network pill — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-[13px] font-semibold tracking-wide whitespace-nowrap border
          dark:text-gray-300 dark:bg-white/[0.04] dark:border-white/[0.07]
          text-gray-700 bg-black/[0.04] border-black/[0.08]">
          <Globe size={13} className="text-[#23DDC6]" />
          <span>{chain?.name ?? 'Mainnet'}</span>
        </div>

        {/* Wallet */}
        <ConnectButton.Custom>
          {({ account, chain: c, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            if (!mounted) return <div className="opacity-0 w-[140px]" />;

            if (!account || !c) return (
              <button
                onClick={openConnectModal}
                className="h-10 px-5 rounded-lg text-[12px] font-black tracking-[0.10em] uppercase cursor-pointer whitespace-nowrap border-none
                  bg-[#5D00F2] text-white shadow-[0_0_18px_rgba(93,0,242,0.45)]
                  hover:shadow-[0_0_26px_rgba(93,0,242,0.65)] transition-shadow duration-200"
              >
                Connect Wallet
              </button>
            );

            if (c.unsupported) return (
              <button
                onClick={openChainModal}
                className="h-10 px-4 rounded-lg text-[13px] font-bold bg-red-500/15 border border-red-500/30 text-red-400 cursor-pointer"
              >
                Wrong Network
              </button>
            );

            return (
              <button
                onClick={openAccountModal}
                className="flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold tracking-wide cursor-pointer whitespace-nowrap border
                  dark:bg-white/[0.04] dark:border-white/[0.09] dark:text-gray-200
                  bg-black/[0.04] border-black/[0.09] text-gray-800"
              >
                <span className="w-[7px] h-[7px] rounded-full bg-[#23DDC6] shadow-[0_0_5px_#23DDC6] shrink-0" />
                {account.displayName}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
};