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
  const { formattedBalance } = useGlobalBalance();
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

  const recipientIsValid = isAddress(recipient);
  const amountIsValid    = numAmount > 0 && ethAmount <= maxBal;
  const canSend          = recipientIsValid && amountIsValid && !isProcessing && !!chain;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    sendPayment({ recipientAddress: recipient, amount: ethAmount.toString() });
  };

  const errorMessage: string | undefined =
    sendErrorDetails instanceof Error
      ? sendErrorDetails.message
      : typeof sendErrorDetails === 'string'
        ? sendErrorDetails
        : undefined;

  const showError =
    sendError &&
    !showSuccess &&
    !errorMessage?.toLowerCase().includes('user rejected') &&
    !errorMessage?.toLowerCase().includes('user denied');

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
            <div>
              <p className="text-sm text-green-400">Payment sent!</p>
              {txHash && (
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-500/70 hover:text-green-400 underline"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error banner */}
        {showError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              {errorMessage ?? 'Transaction failed. Please try again.'}
            </p>
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
                <span>
                  {currency === 'ETH'
                    ? `$${usdAmount.toFixed(2)}`
                    : `${ethAmount.toFixed(4)} ETH`}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAmount(
                      currency === 'ETH'
                        ? maxBal.toString()
                        : ethToUsd(maxBal, ethPrice).toFixed(2),
                    )
                  }
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Max:{' '}
                  {currency === 'ETH'
                    ? `${maxBal.toFixed(4)} ETH`
                    : `$${ethToUsd(maxBal, ethPrice).toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Recipient</label>

            {/* Employee quick-select */}
            {employees.length > 0 && (
              <select
                value=""
                onChange={(e) => { if (e.target.value) setRecipient(e.target.value); }}
                className="w-full mb-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select an employee…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.walletAddress}>
                    {emp.name} — {emp.walletAddress.slice(0, 6)}…{emp.walletAddress.slice(-4)}
                  </option>
                ))}
              </select>
            )}

            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
            />
            {recipient && !recipientIsValid && (
              <p className="text-xs text-red-400 mt-1">Invalid Ethereum address</p>
            )}
          </div>

          {/* Wrong network warning */}
          {!chain && (
            <p className="text-xs text-yellow-400">
              Switch to a supported network to send payments.
            </p>
          )}

          {/* Send button */}
          <button
            type="submit"
            disabled={!canSend}
            className="w-full py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : 'rgba(124, 58, 237, 0.3)',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Payment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};