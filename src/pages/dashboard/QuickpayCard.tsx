import { Send, Loader2, CheckCircle, ArrowUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { formatEther, isAddress } from 'viem';
import { sepolia, mainnet } from 'wagmi/chains';
import { usePaymentWithRefetch } from '@/hooks/UsePaymentWithRefetch';
import { fetchEthPrice, ethToUsd, usdToEth, isDevelopment } from '@/utils/ethUtils';

type Currency = 'ETH' | 'USD';

export const QuickPayCard: React.FC = () => {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ 
    address,
    chainId: isDevelopment ? sepolia.id : mainnet.id
  });
  const { sendPayment, isProcessing } = usePaymentWithRefetch();

  const [currency, setCurrency] = useState<Currency>('ETH');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [ethPrice, setEthPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchEthPrice().then(setEthPrice);
  }, []);

  const maxBal = balance ? parseFloat(formatEther(balance.value)) : 0;
  const numAmount = parseFloat(amount) || 0;
  
  const ethAmt = currency === 'ETH' ? numAmount : usdToEth(numAmount, ethPrice);
  const usdAmt = currency === 'USD' ? numAmount : ethToUsd(numAmount, ethPrice);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAddress(recipient) || ethAmt <= 0 || ethAmt > maxBal) {
      alert('Invalid address or amount');
      return;
    }

    // Check if user is on the correct network
    const targetChain = isDevelopment ? sepolia : mainnet;
    if (chain?.id !== targetChain.id) {
      try {
        await switchChain({ chainId: targetChain.id });
      } catch (error) {
        alert(`Please switch to ${isDevelopment ? 'Sepolia Testnet' : 'Ethereum Mainnet'} in your wallet`);
        return;
      }
    }

    // Send the payment
    await sendPayment({
      recipientAddress: recipient,
      amount: ethAmt.toString(),
      onSuccess: () => {
        setShowSuccess(true);
        setAmount('');
        setRecipient('');
        setTimeout(() => setShowSuccess(false), 3000);
      },
      onError: (e) => alert(`Failed: ${e.message}`)
    });
  };

  const borderColor = isDevelopment ? 'rgba(251, 191, 36, 0.3)' : 'rgba(124, 58, 237, 0.3)';
  const gradientStart = isDevelopment ? 'rgba(251, 191, 36, 0.3)' : 'rgba(124, 58, 237, 0.3)';
  const gradientEnd = isDevelopment ? 'rgba(245, 158, 11, 0.1)' : 'rgba(124, 58, 237, 0.1)';
  const buttonBg = isDevelopment ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)';
  const accentColor = isDevelopment ? 'text-yellow-400' : 'text-purple-400';

  return (
    <div 
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ 
        backgroundColor: 'rgba(26, 27, 34, 0.6)',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
        }}
      />
      
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 8s infinite'
        }}
      />
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          37.5% { background-position: -200% 0; }
          100% { background-position: -200% 0; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Quick Pay</h3>
        </div>

        {showSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-sm text-green-400">Payment sent!</p>
          </div>
        )}

        {isDevelopment && (
          <div className="mb-4 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-500">Sepolia Testnet</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
            <div 
              className="rounded-xl px-4 py-3"
              style={{ 
                backgroundColor: 'rgba(31, 29, 46, 0.6)',
                border: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="text-2xl font-medium text-white bg-transparent outline-none focus:outline-none focus:ring-0 w-full"
                />
                <button
                  type="button"
                  onClick={() => setCurrency(currency === 'ETH' ? 'USD' : 'ETH')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <span className="text-white font-medium">{currency}</span>
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>{currency === 'ETH' ? `$${usdAmt.toFixed(2)}` : `${ethAmt.toFixed(4)} ETH`}</span>
                <button
                  type="button"
                  onClick={() => setAmount(currency === 'ETH' ? maxBal.toFixed(4) : ethToUsd(maxBal, ethPrice).toFixed(2))}
                  className={`${accentColor} hover:opacity-80 font-medium`}
                >
                  {maxBal.toFixed(4)} ETH available • Max
                </button>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Send to</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x... wallet address"
              className="w-full px-4 py-3 rounded-xl text-white bg-transparent outline-none focus:outline-none focus:ring-0 font-mono text-sm"
              style={{ 
                backgroundColor: 'rgba(31, 29, 46, 0.6)',
                border: `1px solid ${borderColor}`,
                boxShadow: 'none'
              }}
            />
            {recipient && !isAddress(recipient) && (
              <p className="text-xs text-red-400 mt-1">Invalid address</p>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isProcessing || !recipient || !amount || ethAmt > maxBal}
            className="w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: buttonBg, color: 'white' }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Payment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};