import { Send, Loader2, CheckCircle, ArrowUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { usePayment } from '@/hooks/usePayment';
import { useEthPrice } from '@/hooks/useEthPrice';
import { useGlobalBalance } from '@/hooks/useGlobalBalance';
import { ethToUsd, usdToEth } from '@/utils/EthUtils';
import { useAuth } from '@/contexts/AuthContext';

type Currency = 'ETH' | 'USD';

export const QuickPayCard: React.FC = () => {
  const { chain } = useAccount();
  const { employees } = useAuth();
  const { formattedBalance, isConnected } = useGlobalBalance();
  const { ethPrice } = useEthPrice();
  const {
    sendPayment,
    isProcessing,
    isConfirmed,
    txHash,
    sendError,
    sendErrorDetails,
  } = usePayment();

  const [currency, setCurrency] = useState<Currency>('ETH');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isConfirmed && txHash) {
      setShowSuccess(true);
      setAmount('');
      setRecipient('');
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [isConfirmed, txHash]);

  const maxBal    = parseFloat(formattedBalance);
  const numAmount = parseFloat(amount) || 0;
  const ethAmount = currency === 'ETH' ? numAmount : usdToEth(numAmount, ethPrice);
  const usdAmount = currency === 'USD' ? numAmount : ethToUsd(numAmount, ethPrice);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(recipient) || ethAmount <= 0 || ethAmount > maxBal) return;
    sendPayment({ recipientAddress: recipient, amount: ethAmount.toString() });
  };

  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(26, 27, 34, 0.6)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0.1) 100%)' }}
      />

      {/* Shimmer */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 8s infinite',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0%    { background-position: 200% 0; }
          37.5% { background-position: -200% 0; }
          100%  { background-position: -200% 0; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Quick Pay</h3>
          {chain && (
            <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-lg">
              {chain.name}
            </span>
          )}
        </div>

        {/* Success banner */}
        {showSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-400">Payment sent!</p>
          </div>
        )}

        {/* Error banner — silently ignore user rejections */}
        {sendError && !sendErrorDetails?.message?.toLowerCase().includes('user rejected') && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              {sendErrorDetails?.message ?? 'Transaction failed. Please try again.'}
            </p>
          </div>
        )}

        {/* Not connected */}
        {!isConnected && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-gray-400">Connect your wallet to send payments</p>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Amount</label>
            <div
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: 'rgba(31, 29, 46, 0.6)' }}
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
                <span>{currency === 'ETH' ? `$${usdAmount.toFixed(2)}` : `${ethAmount.toFixed(4)} ETH`}</span>
                <button
                  type="button"
                  onClick={() => setAmount(currency === 'ETH' ? maxBal.toFixed(4) : ethToUsd(maxBal, ethPrice).toFixed(2))}
                  className="text-purple-400 hover:opacity-80 font-medium"
                >
                  {maxBal.toFixed(4)} ETH available • Max
                </button>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Send to</label>

            <select
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none cursor-pointer font-mono mb-2"
              style={{ backgroundColor: 'rgba(31, 29, 46, 0.6)' }}
            >
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.walletAddress}>
                  {emp.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="or paste 0x... address"
              className="w-full px-4 py-3 rounded-xl text-white bg-transparent outline-none font-mono text-sm"
              style={{ backgroundColor: 'rgba(31, 29, 46, 0.6)' }}
            />
            {recipient && !isAddress(recipient) && (
              <p className="text-xs text-red-400 mt-1">Invalid address</p>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isProcessing || !isAddress(recipient) || ethAmount <= 0 || ethAmount > maxBal || !isConnected}
            className="w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white' }}
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