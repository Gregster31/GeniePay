import React from 'react';
import { Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface WalletGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

export const WalletGateModal: React.FC<WalletGateModalProps> = ({ isOpen, onClose, action }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-[#15141a] border border-[#5D00F2]/30"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(93,0,242,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden">

          {/* Background gradient fill */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(160deg, rgba(93,0,242,0.10) 0%, rgba(35,221,198,0.06) 100%)' }}
          />
          {/* Top radial glow */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(93,0,242,0.30) 0%, transparent 70%)' }}
          />

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-5">
            {/* Outer soft halo */}
            <div
              className="absolute w-20 h-20 rounded-2xl"
              style={{ background: 'radial-gradient(circle, rgba(93,0,242,0.22) 0%, transparent 70%)' }}
            />
            <div
              className="relative w-[3.5rem] h-[3.5rem] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(93,0,242,0.22) 0%, rgba(35,221,198,0.12) 100%)',
                border: '1px solid rgba(93,0,242,0.40)',
                boxShadow: '0 0 22px rgba(93,0,242,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <Wallet className="w-6 h-6 text-[#7c3aed] dark:text-[#a78bfa]" />
            </div>
          </div>

          <h2 className="text-[1.2rem] font-bold text-gray-900 dark:text-white leading-tight">
            Connect Your Wallet
          </h2>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            To {action}, connect the wallet<br />holding your funds.
          </p>
        </div>

        {/* Gradient rule */}
        <div
          className="mx-6 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(93,0,242,0.35), transparent)' }}
        />

        {/* Actions */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={() => { openConnectModal(); onClose(); }}
                className="group w-full py-3.5 rounded-xl font-semibold text-[14px] tracking-wide text-white flex items-center justify-center gap-2.5 transition-all duration-150"
                style={{
                  background: 'linear-gradient(135deg, #5D00F2 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 20px rgba(93,0,242,0.50), inset 0 1px 0 rgba(255,255,255,0.14)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(93,0,242,0.70), inset 0 1px 0 rgba(255,255,255,0.14)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(93,0,242,0.50), inset 0 1px 0 rgba(255,255,255,0.14)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Wallet className="w-4 h-4 shrink-0" />
                Connect Wallet
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
              </button>
            )}
          </ConnectButton.Custom>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium text-sm transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/[0.08]"
          >
            Maybe later
          </button>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 shrink-0" />
            <span className="text-[11px] text-gray-400 dark:text-gray-600">
              Non-custodial · Your keys, your funds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
