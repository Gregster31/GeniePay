import { RefreshCw, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";

const isDev = import.meta.env.VITE_ENV_KEY === 'TEST';

export const WalletBalanceCard: React.FC = () => {
  const { address } = useAccount();
  const { data: balance, refetch } = useBalance({ 
    address,
    chainId: isDev ? sepolia.id : undefined
  });
  
  const [ethPrice, setEthPrice] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = async () => {
    if (isDev) {
      setLastUpdated(new Date());
      return;
    }
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await res.json();
      setEthPrice(data.ethereum?.usd || 0);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Price fetch failed:', e);
    }
  };

  useEffect(() => { fetchPrice(); }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), fetchPrice()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const ethBal = balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000';
  const usdBal = isDev ? '0.00' : (parseFloat(ethBal) * ethPrice).toFixed(2);

  return (
    <div 
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ 
        backgroundColor: '#1A1B22',
        border: `1px solid ${isDev ? 'rgba(251, 191, 36, 0.3)' : 'rgba(124, 58, 237, 0.2)'}`,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: isDev
            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)'
        }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400">Wallet Balance</h3>
            {isDev && <span className="text-xs font-semibold text-yellow-500 mt-1 block">Sepolia Testnet</span>}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${isDev ? 'text-yellow-400' : 'text-purple-400'} ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* USD Balance */}
        <p className="text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          ${usdBal}
        </p>
        
        {/* ETH Balance */}
        <p className="text-sm text-gray-500 mb-4">{ethBal} ETH</p>

        {/* ETH Price or Test Badge */}
        {isDev ? (
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-500">Test Mode</p>
          </div>
        ) : ethPrice > 0 && (
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

        {/* Icon */}
        <div className="absolute bottom-4 right-4 opacity-5">
          <Wallet className={`w-24 h-24 ${isDev ? 'text-yellow-400' : 'text-purple-400'}`} />
        </div>
      </div>
    </div>
  );
};