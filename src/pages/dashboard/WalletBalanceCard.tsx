import { useState } from "react";
import { RefreshCw, Wallet } from "lucide-react";
import { ethToUsd } from "@/utils/EthUtils";
import { useGlobalBalance } from "@/hooks/useGlobalBalance";
import { useEthPrice } from "@/hooks/useEthPrice";

export const WalletBalanceCard: React.FC = () => {
  const {
    formattedBalance: ethBal,
    isLoading: balanceLoading,
    isError: balanceError,
    refetch,
    isConnected,
  } = useGlobalBalance();

  const { ethPrice, isLoading: priceLoading } = useEthPrice();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isLoading = balanceLoading || priceLoading;
  const usdBal = ethToUsd(parseFloat(ethBal), ethPrice).toFixed(2);

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        backgroundColor: "#1A1B22",
        border: "1px solid rgba(124, 58, 237, 0.2)",
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-gray-400">Wallet Balance</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !isConnected}
            className="p-2 hover:bg-white/5 rounded-lg transition-all disabled:opacity-40"
            title="Refresh balance"
          >
            <RefreshCw
              className={`w-4 h-4 text-purple-400 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Balance — skeleton while loading */}
        {isLoading ? (
          <div className="space-y-3 mb-4">
            <div className="h-10 w-40 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
          </div>
        ) : balanceError ? (
          <div className="mb-4">
            <p className="text-red-400 text-sm">Failed to load balance</p>
            <button
              onClick={handleRefresh}
              className="text-xs text-purple-400 mt-1 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <p
              className="text-4xl font-bold text-white mb-2"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="text-sm text-gray-500 font-normal mr-1">USD</span>
              ${usdBal}
            </p>
            <p className="text-sm text-gray-500">{ethBal} ETH</p>
          </div>
        )}

        {/* ETH price footer */}
        {!isLoading && ethPrice > 0 && (
          <p className="text-xs text-gray-600">
            1 ETH = ${ethPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
          </p>
        )}

        {/* Decorative icon */}
        <div className="absolute bottom-4 right-4 opacity-5">
          <Wallet className="w-24 h-24 text-purple-400" />
        </div>
      </div>
    </div>
  );
};