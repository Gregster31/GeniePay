import React from "react";
import { Card, Label } from "@/components/ui";
import { useEthPrice } from "@/hooks/useEthPrice";
import { useGlobalBalance } from "@/hooks/useGlobalBalance";
import { tokenToUsd } from "@/utils/EthUtils";
import { formatCurrency } from "@/utils/Format";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { getSupportedTokens } from "@/config/tokenConfig";
import { useSelectedToken } from "@/contexts/TokenContext";

export const BalanceCard: React.FC<{ monthlyPayroll: number }> = ({ monthlyPayroll }) => {
  const { chain } = useAccount();
  const supportedTokens = getSupportedTokens(chain?.id);
  const { selectedToken, setSelectedToken } = useSelectedToken();

  const { formattedBalance, isLoading: bL, isError: bE, refetch, isConnected } = useGlobalBalance(selectedToken);
  const { ethPrice, isLoading: pL } = useEthPrice();
  const [spin, setSpin] = useState(false);

  const loading   = bL || pL;
  const walletUsd = tokenToUsd(parseFloat(formattedBalance), selectedToken, ethPrice);
  const payPct    = walletUsd > 0 && monthlyPayroll > 0 ? Math.min(monthlyPayroll / walletUsd * 100, 100) : 0;
  const insufficient = monthlyPayroll > walletUsd && monthlyPayroll > 0;

  const refresh = async () => { setSpin(true); await refetch(); setTimeout(() => setSpin(false), 600); };

  return (
    <Card className="!p-[22px]">

      {/* Header */}
      <div className="flex justify-between mb-[18px]">
        <Label>Wallet Balance</Label>
        <div className="flex items-center gap-2">
          {monthlyPayroll > 0 && !loading && (
            <span className={`text-[11px] font-semibold ${
              insufficient ? 'text-orange-400' : 'text-[#23DDC6]'
            }`}>
              {insufficient ? 'Insufficient' : 'Sufficient'}
            </span>
          )}
          <button onClick={refresh} disabled={spin || !isConnected}
            className="p-1.5 rounded-lg bg-transparent border-none cursor-pointer disabled:opacity-40">
            <RefreshCw size={14} className={`text-[#5D00F2] ${spin ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Token selector */}
      {supportedTokens.length > 1 && (
        <div className="flex gap-1 mb-4">
          {supportedTokens.map(t => (
            <button
              key={t}
              onClick={() => setSelectedToken(t)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors duration-150 cursor-pointer
                ${selectedToken === t
                  ? 'bg-[#5D00F2] border-[#5D00F2] text-white'
                  : 'dark:bg-white/[0.04] dark:border-white/[0.09] dark:text-gray-400 bg-black/[0.04] border-black/[0.08] text-gray-500'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Big balance */}
      <div className="mb-[18px]">
        {loading ? (
          <div className="w-36 h-8 rounded-lg dark:bg-white/[0.06] bg-black/[0.06] animate-pulse" />
        ) : bE ? (
          <span className="text-red-400 text-[13px]">Failed to load</span>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-semibold text-gray-500">USD</span>
              <span className="text-[48px] font-bold tracking-tight leading-none dark:text-white text-gray-900">
                {formatCurrency(walletUsd)}
              </span>
            </div>
            {isConnected && <p className="mt-1.5 text-[11px] text-gray-500">{formattedBalance} {selectedToken}</p>}
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Payroll coverage</span>
          <span className="text-[11px] text-gray-500">{payPct.toFixed(0)}% of wallet</span>
        </div>
        <div className="h-2 rounded-full dark:bg-white/[0.07] bg-black/[0.07] overflow-hidden flex">
          {insufficient ? (
            <div className="flex-1 bg-gradient-to-r from-orange-400 to-amber-300 shadow-[0_0_10px_rgba(251,146,60,0.3)]" />
          ) : (
            <>
              {payPct > 0 && (
                <div
                  className={`bg-gradient-to-r from-[#23DDC6] to-[#23DDC6cc] shadow-[0_0_10px_rgba(35,221,198,0.4)] shrink-0 transition-[width] duration-700 ${payPct >= 100 ? 'rounded-full' : 'rounded-l-full'}`}
                  style={{ width: `${payPct}%` }}
                />
              )}
              {payPct > 0 && payPct < 100 && (
                <div className="flex-1 bg-[#5D00F2]/90 rounded-r-full" />
              )}
            </>
          )}
        </div>
        <div className="flex justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#23DDC6] shrink-0" />
            <span className="text-[11px] text-gray-500">Payroll</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-500">Remaining</span>
            <span className="w-2 h-2 rounded-full bg-[#5D00F2]/90 shrink-0" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t dark:border-white/[0.07] border-black/[0.07] flex justify-between items-end">
        <div>
          <span className="text-[11px] text-gray-500 block">Monthly payroll</span>
          <span className="text-[20px] font-bold tracking-tight dark:text-white text-gray-900 mt-0.5 block">{formatCurrency(monthlyPayroll)}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-gray-500 block">Total wallet</span>
          <span className="text-[20px] font-bold tracking-tight dark:text-white text-gray-900 mt-0.5 block">{formatCurrency(walletUsd)}</span>
        </div>
      </div>

    </Card>
  );
};
