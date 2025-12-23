import { RefreshCw, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { fetchEthPrice, ethToUsd, isDevelopment } from "@/utils/ethUtils";

export const WalletBalanceCard: React.FC = () => {
  const { address } = useAccount();
  const { data: balance, refetch } = useBalance({ 
    address,
    chainId: isDevelopment ? sepolia.id : undefined
  });
  
  const [ethPrice, setEthPrice] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = async () => {
    const price = await fetchEthPrice();
    setEthPrice(price);
    setLastUpdated(new Date());
  };

  useEffect(() => { fetchPrice(); }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), fetchPrice()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const ethBal = balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000';
  const usdBal = isDevelopment ? '0.00' : ethToUsd(parseFloat(ethBal), ethPrice).toFixed(2);

  return (
    <div 
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ 
        backgroundColor: '#1A1B22',
        border: isDevelopment ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(124, 58, 237, 0.2)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: isDevelopment
            ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)'
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400">Wallet Balance</h3>
            {isDevelopment && <span className="text-xs font-semibold text-yellow-500 mt-1 block">Sepolia Testnet</span>}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${isDevelopment ? 'text-yellow-400' : 'text-purple-400'} ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <p className="text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
          ${usdBal}
        </p>
        
        <p className="text-sm text-gray-500 mb-4">{ethBal} ETH</p>

        {isDevelopment ? (
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-500">Test Mode</p>
          </div>
        ) : ethPrice > 0 && (
          <p className="text-xs text-gray-600">
            1 ETH = ${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </p>
        )}

        {lastUpdated && (
          <p className="text-xs text-gray-600 mt-2">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        <div className="absolute bottom-4 right-4 opacity-5">
          <Wallet className={`w-24 h-24 ${isDevelopment ? 'text-yellow-400' : 'text-purple-400'}`} />
        </div>
      </div>
    </div>
  );
};