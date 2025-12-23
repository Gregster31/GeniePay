// ========================= WALLET BALANCE CARD WITH REAL-TIME PRICE =========================

import { RefreshCw, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";

export const WalletBalanceCard: React.FC = () => {
  const { address } = useAccount();
  const { data: balance, refetch } = useBalance({ address });
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch ETH price from CoinGecko
  const fetchEthPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const data = await response.json();
      setEthPrice(data.ethereum?.usd || 0);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching ETH price:', error);
    }
  };

  // Fetch price on mount
  useEffect(() => {
    fetchEthPrice();
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), fetchEthPrice()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const ethBalance = balance 
    ? parseFloat(formatEther(balance.value)).toFixed(4)
    : '0.0000';
  
  const usdBalance = (parseFloat(ethBalance) * ethPrice).toFixed(2);

  return (
    <div 
      className="rounded-2xl p-6 transition-all duration-300 relative overflow-hidden"
      style={{ 
        backgroundColor: '#1A1B22',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)'
        }}
      />
      
      <div className="relative z-10">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
            Wallet Balance
          </h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* USD Balance */}
        <div className="mb-2">
          <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
            ${usdBalance}
          </p>
        </div>
        
        {/* ETH Balance */}
        <p className="text-sm text-gray-500 mb-4">{ethBalance} ETH</p>

        {/* ETH Price */}
        {ethPrice > 0 && (
          <p className="text-xs text-gray-600">
            1 ETH = ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </p>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-xs text-gray-600 mt-2">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* Decorative wallet icon */}
        <div className="absolute bottom-4 right-4 opacity-5">
          <Wallet className="w-24 h-24 text-purple-400" />
        </div>
      </div>
    </div>
  );
};