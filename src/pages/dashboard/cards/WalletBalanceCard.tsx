import { Card, Label } from "@/components/ui";
import { useEthPrice } from "@/hooks/useEthPrice";
import { useGlobalBalance } from "@/hooks/useGlobalBalance";
import { ethToUsd } from "@/utils/EthUtils";
import { formatCurrency } from "@/utils/Format";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export const BalanceCard: React.FC<{ monthlyPayroll: number }> = ({ monthlyPayroll }) => {
  const { formattedBalance: ethBal, isLoading: bL, isError: bE, refetch, isConnected } = useGlobalBalance();
  const { ethPrice, isLoading: pL } = useEthPrice();
  const [spin, setSpin] = useState(false);

  const loading      = bL || pL;
  const walletUsd    = ethToUsd(parseFloat(ethBal), ethPrice);
  const payPct       = walletUsd > 0 && monthlyPayroll > 0 ? Math.min(monthlyPayroll / walletUsd * 100, 100) : 0;
  const insufficient = monthlyPayroll > walletUsd && monthlyPayroll > 0;

  const refresh = async () => { setSpin(true); await refetch(); setTimeout(() => setSpin(false), 600); };

  return (
    <Card className="!p-[22px]">

      {/* Header */}
      <div className="flex justify-between mb-[18px]">
        <Label>Wallet Balance</Label>
        <div className="flex items-center gap-2">
          {monthlyPayroll > 0 && !loading && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              insufficient
                ? 'bg-red-500/10 border-red-500/25 text-red-400'
                : 'bg-[#23DDC6]/10 border-[#23DDC6]/30 text-[#23DDC6]'
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
            <p className="mt-1.5 text-[11px] text-gray-500">{ethBal} ETH</p>
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
            <div className="flex-1 bg-gradient-to-r from-red-500 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
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