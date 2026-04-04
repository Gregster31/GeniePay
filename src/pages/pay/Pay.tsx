import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle, ArrowUpDown, Search, ChevronDown, User } from 'lucide-react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { Card } from '@/components/ui';
import { usePayment } from '@/hooks/usePayment';
import { useEthPrice } from '@/hooks/useEthPrice';
import { useGlobalBalance } from '@/hooks/useGlobalBalance';
import { useEnsResolution } from '@/hooks/useENSResolution';
import { ethToUsd, usdToEth } from '@/utils/EthUtils';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/Format';
import { saveReceipt } from '@/services/ReceiptService';
import { useQueryClient } from '@tanstack/react-query';

type Currency = 'ETH' | 'USD';

const Pay: React.FC = () => {
  const { chain, address }          = useAccount();
  const { employees }               = useAuth();
  const { formattedBalance, isConnected } = useGlobalBalance();
  const { ethPrice }                = useEthPrice();
  const queryClient                 = useQueryClient();
  const { sendPayment, isProcessing, isConfirmed, txHash, sendError, sendErrorDetails } = usePayment();

  const [currency, setCurrency]           = useState<Currency>('ETH');
  const [amount, setAmount]               = useState('');
  const [ensInput, setEnsInput]           = useState('');
  const [showSuccess, setShowSuccess]     = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [selectedName, setSelectedName]   = useState('');
  const dropdownRef                       = useRef<HTMLDivElement>(null);
  const [pendingReceipt, setPendingReceipt] = useState<{
    recipient: string; ethAmount: number; usdAmount: number;
  } | null>(null);

  const { address: recipient, resolved: ensResolved, loading: ensLoading, error: ensError } = useEnsResolution(ensInput);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isConfirmed && txHash && pendingReceipt) {
      setShowSuccess(true);
      setAmount(''); setEnsInput(''); setSelectedName('');
      setTimeout(() => setShowSuccess(false), 3000);
      const recipientName = employees.find(e => e.walletAddress.toLowerCase() === pendingReceipt.recipient.toLowerCase())?.name;
      saveReceipt({
        type: 'quickpay', txHash, network: chain?.name ?? 'Ethereum', currency: 'ETH',
        totalUsd: pendingReceipt.usdAmount, totalCrypto: pendingReceipt.ethAmount,
        from: address ?? '',
        recipients: [{ name: recipientName, address: pendingReceipt.recipient, amountEth: pendingReceipt.ethAmount, amountUsd: pendingReceipt.usdAmount }],
      })
        .then(() => queryClient.invalidateQueries({ queryKey: ['receipts'] }))
        .catch(console.error);
      setPendingReceipt(null);
    }
  }, [isConfirmed, txHash, pendingReceipt, chain, address, employees, queryClient]);

  const maxBal    = parseFloat(formattedBalance);
  const numAmount = parseFloat(amount) || 0;
  const ethAmount = currency === 'ETH' ? numAmount : usdToEth(numAmount, ethPrice);
  const usdAmount = currency === 'USD' ? numAmount : ethToUsd(numAmount, ethPrice);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || ethAmount <= 0 || ethAmount > maxBal) return;
    setPendingReceipt({ recipient, ethAmount, usdAmount });
    sendPayment({ recipientAddress: recipient, amount: ethAmount.toString() });
  };

  const inputBase = "w-full bg-transparent outline-none dark:text-white text-gray-900 dark:placeholder-gray-600 placeholder-gray-400";
  const fieldStyle = { backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)' };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1080px] mx-auto mt-4 sm:mt-8">

        <div className="mb-6">
          <h1 className="text-[28px] font-bold tracking-tight dark:text-white text-gray-900">Quick Pay</h1>
          <p className="text-[13px] text-gray-500 mt-1">Send instant crypto payments to any wallet</p>
        </div>

        <Card className="!p-7">
          <div className="space-y-5">

            {/* Chain badge */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Payment</span>
            </div>

            {/* Success */}
            {showSuccess && (
              <div className="p-3 rounded-xl bg-[#23DDC6]/8 border border-[#23DDC6]/20 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#23DDC6] shrink-0" />
                <span className="text-[13px] text-[#23DDC6]">Payment sent — receipt saved to Documents.</span>
              </div>
            )}

            {/* Error */}
            {sendError && !sendErrorDetails?.message?.toLowerCase().includes('user rejected') && (
              <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <p className="text-[13px] text-red-400">{sendErrorDetails?.message ?? 'Transaction failed. Please try again.'}</p>
              </div>
            )}

            {/* Not connected */}
            {!isConnected && (
              <div className="p-3 rounded-xl dark:bg-white/[0.04] dark:border-white/[0.08] bg-black/[0.03] border border-black/[0.07]">
                <p className="text-[13px] text-gray-500">Connect your wallet to send payments.</p>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Amount</label>
              <div className="rounded-xl px-4 py-3.5" style={fieldStyle}>
                <div className="flex items-center gap-3">
                  <input type="number" step="any" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" className={`${inputBase} text-[32px] font-bold tracking-tight leading-none`} />
                  <button type="button" onClick={() => setCurrency(c => c === 'ETH' ? 'USD' : 'ETH')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg dark:bg-white/[0.06] dark:hover:bg-white/[0.10] bg-black/[0.05] hover:bg-black/[0.09] transition-colors shrink-0">
                    <span className="text-[13px] font-semibold dark:text-white text-gray-900">{currency}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[12px] text-gray-500 font-mono">
                    {currency === 'ETH' ? `≈ ${formatCurrency(usdAmount)}` : `≈ ${ethAmount.toFixed(6)} ETH`}
                  </span>
                  <button type="button"
                    onClick={() => setAmount(currency === 'ETH' ? maxBal.toFixed(6) : ethToUsd(maxBal, ethPrice).toFixed(2))}
                    className="text-[11px] font-semibold text-cyan hover:text-cyan/80 transition-colors">
                    {maxBal.toFixed(4)} ETH · Max
                  </button>
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">Send to</label>
              {/* Custom employee dropdown */}
              {employees.length > 0 && (
                <div ref={dropdownRef} className="relative mb-2">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(p => !p)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] transition-all outline-none"
                    style={fieldStyle}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className={selectedName ? 'dark:text-white text-gray-900' : 'text-gray-400'}>
                        {selectedName || 'Select employee…'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-150 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-[#1c1b22]"
                      style={{ border: '1px solid var(--input-border)' }}>
                      {employees.map((emp, i) => (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => {
                            setEnsInput(emp.walletAddress);
                            setSelectedName(emp.name);
                            setShowDropdown(false);
                          }}
                          className={[
                            'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                            'hover:bg-purple/[0.07] dark:hover:bg-purple/[0.10]',
                            i < employees.length - 1 ? 'border-b dark:border-[#2e2d38]/60 border-gray-100' : '',
                          ].join(' ')}
                        >
                          <div>
                            <p className="text-[13px] font-medium dark:text-white text-gray-900">{emp.name}</p>
                            {emp.role && <p className="text-[11px] text-gray-500 mt-0.5">{emp.role}</p>}
                          </div>
                          <span className="text-[11px] font-mono text-gray-500 shrink-0 ml-3">
                            {emp.walletAddress.slice(0, 6)}…{emp.walletAddress.slice(-4)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-xl px-4 py-3.5" style={{
                backgroundColor: 'var(--input-bg)',
                border: `1px solid ${ensError ? 'rgba(239,68,68,0.4)' : ensResolved ? 'rgba(35,221,198,0.3)' : 'var(--input-border)'}`,
              }}>
                <div className="flex items-center gap-2">
                  {ensLoading
                    ? <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin shrink-0" />
                    : <Search className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                  }
                  <input type="text" value={ensInput} onChange={e => { setEnsInput(e.target.value); setSelectedName(''); }}
                    placeholder="0x… address or ENS name"
                    className={`${inputBase} text-[13px] font-mono`} />
                </div>
                {ensResolved && <p className="text-[11px] text-[#23DDC6] mt-1.5 font-mono">{ensResolved}</p>}
                {ensError    && <p className="text-[11px] text-red-400 mt-1.5">ENS name not found</p>}
                {ensInput && !ensInput.endsWith('.eth') && !isAddress(ensInput) && !ensLoading &&
                  <p className="text-[11px] text-red-400 mt-1.5">Invalid address</p>
                }
              </div>
            </div>

            {/* Send */}
            <button onClick={handleSend}
              disabled={isProcessing || !recipient || ethAmount <= 0 || ethAmount > maxBal || !isConnected}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-[14px] tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-purple hover:bg-purple/90 text-white"
              style={{ boxShadow: '0 4px 20px rgba(93,0,242,0.35)' }}>
              {isProcessing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                : <><Send className="w-4 h-4" /> Send Payment</>
              }
            </button>

          </div>
        </Card>
      </div>
    </div>
  );
};

export default Pay;