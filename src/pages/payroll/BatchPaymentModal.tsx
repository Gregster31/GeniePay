import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle2, Loader2, ExternalLink, Send, Zap } from 'lucide-react';
import { useBulkPayment } from '@/hooks/useBulkPayment';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { saveReceipt } from '@/services/ReceiptService';
import type { Employee } from '@/models/EmployeeModel';

interface BatchPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  totalAmount: number;
}

export const BatchPaymentModal: React.FC<BatchPaymentModalProps> = ({
  isOpen,
  onClose,
  employees,
  totalAmount,
}) => {
  const { chain, address } = useAccount();
  const queryClient = useQueryClient();

  const {
    approvalHash,
    paymentHash,
    error,
    ethPrice,
    isApproving,
    isSuccess,
    isProcessing,
    execute,
    reset,
    estimateGasSavings,
  } = useBulkPayment();

  const [gasSavings, setGasSavings] = useState('60%');
  const [selectedCurrency, setSelectedCurrency] = useState<'ETH' | 'USDC'>('ETH');
  const [receiptSaved, setReceiptSaved] = useState(false);

  useEffect(() => {
    if (employees.length > 0) {
      setGasSavings(estimateGasSavings(employees.length));
    }
  }, [employees.length, estimateGasSavings]);

  useEffect(() => {
    if (isSuccess && paymentHash && !receiptSaved) {
      setReceiptSaved(true);
      const totalCrypto = selectedCurrency === 'ETH' ? totalAmount / ethPrice : totalAmount;
      saveReceipt({
        type: 'payroll',
        txHash: paymentHash,
        network: chain?.name ?? 'Ethereum',
        currency: selectedCurrency,
        totalUsd: totalAmount,
        totalCrypto,
        from: address ?? '',
        recipients: employees.map(emp => ({
          name: emp.name,
          address: emp.walletAddress,
          amountUsd: emp.payUsd,
          amountEth: selectedCurrency === 'ETH' ? emp.payUsd / ethPrice : emp.payUsd,
        })),
      })
        .then(() => queryClient.invalidateQueries({ queryKey: ['receipts'] }))
        .catch(console.error);

      setTimeout(() => {
        reset();
        setReceiptSaved(false);
        onClose();
      }, 3000);
    }
  }, [isSuccess, paymentHash, receiptSaved, selectedCurrency, totalAmount, ethPrice, chain, address, employees, reset, onClose, queryClient]);

  const handleClose = () => {
    if (!isProcessing) {
      reset();
      setReceiptSaved(false);
      onClose();
    }
  };

  const handleConfirm = async () => {
    try {
      await execute({ employees, currency: selectedCurrency });
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const fmtEth = (usd: number) => (usd / ethPrice).toFixed(6);

  const totalDisplay = selectedCurrency === 'ETH'
    ? `${(totalAmount / ethPrice).toFixed(6)} ETH`
    : fmt(totalAmount);

  const shortenHash = (hash: string) => `${hash.slice(0, 6)}…${hash.slice(-4)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-[#15141a] border border-[#2e2d38]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a1821] border-b border-[#2e2d38]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {isSuccess ? 'Payment Successful' : 'Run Payroll'}
            </h2>
            <p className="text-xs text-[#6f6b77] mt-0.5">
              {isSuccess
                ? `${employees.length} employees paid · receipt saved`
                : `${employees.length} employee${employees.length !== 1 ? 's' : ''} · review before sending`}
            </p>
          </div>
          {!isProcessing && (
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6f6b77] hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Success */}
          {isSuccess && paymentHash && (
            <div className="p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-400 mb-1">{fmt(totalAmount)} sent successfully</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-[#6f6b77]">{shortenHash(paymentHash)}</code>
                    <a
                      href={`https://etherscan.io/tx/${paymentHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                    >
                      View on Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !isSuccess && (
            <div className="p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-0.5">Transaction Failed</p>
                  <p className="text-xs text-[#6f6b77]">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing */}
          {isProcessing && !isSuccess && (
            <div className="p-4 rounded-xl bg-[#5D00F2]/[0.08] border border-[#5D00F2]/20">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {isApproving ? 'Step 1/2 — Approving…' : selectedCurrency === 'ETH' ? 'Sending payment…' : 'Step 2/2 — Sending…'}
                  </p>
                  <p className="text-xs text-[#6f6b77] mt-0.5">
                    {isApproving ? 'Confirm the approval in your wallet' : 'Confirm the transaction in your wallet'}
                  </p>
                  {(approvalHash || paymentHash) && (
                    <a
                      href={`https://etherscan.io/tx/${paymentHash || approvalHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:text-purple-300 mt-1.5 inline-flex items-center gap-1 transition-colors"
                    >
                      View transaction <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Currency selector + summary */}
          {!isSuccess && !isProcessing && (
            <>
              {/* Currency tabs */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6f6b77] mb-2">Payment Currency</p>
                <div className="flex gap-2 p-1 rounded-lg bg-[#1c1b22] border border-[#2e2d38]">
                  {(['ETH', 'USDC'] as const).map(cur => (
                    <button
                      key={cur}
                      onClick={() => setSelectedCurrency(cur)}
                      className={[
                        'flex-1 py-2 rounded-md text-sm font-medium transition-all',
                        selectedCurrency === cur
                          ? 'bg-purple text-white'
                          : 'text-[#6f6b77] hover:text-white',
                      ].join(' ')}
                    >
                      {cur}
                      <span className={`block text-[10px] font-normal mt-0.5 ${selectedCurrency === cur ? 'text-white/60' : 'text-[#44414c]'}`}>
                        {cur === 'ETH' ? 'Native Ether' : 'Stablecoin'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#1a1821] border border-[#2e2d38]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6f6b77]">Total</span>
                  </div>
                  <p className="text-lg font-bold text-white leading-tight">{totalDisplay}</p>
                  {selectedCurrency === 'ETH' && (
                    <p className="text-xs text-[#6f6b77] mt-1">≈ {fmt(totalAmount)}</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-[#1a1821] border border-[#2e2d38]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#6f6b77]">Gas Saved</span>
                  </div>
                  <p className="text-lg font-bold text-cyan leading-tight">{gasSavings}</p>
                  <p className="text-xs text-[#6f6b77] mt-1">vs individual txns</p>
                </div>
              </div>

              {/* Recipient list (≤ 5) */}
              {employees.length <= 5 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6f6b77] mb-2">Recipients</p>
                  <div className="rounded-xl border border-[#2e2d38] overflow-hidden divide-y divide-[#2e2d38]/60">
                    {employees.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between px-4 py-3 bg-[#1a1821]">
                        <div>
                          <p className="text-sm font-medium text-white">{emp.name}</p>
                          <p className="text-xs text-[#6f6b77]">{emp.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#8b6cf7]">
                            {selectedCurrency === 'ETH' ? `${fmtEth(emp.payUsd)} ETH` : fmt(emp.payUsd)}
                          </p>
                          {selectedCurrency === 'ETH' && (
                            <p className="text-xs text-[#6f6b77]">≈ {fmt(emp.payUsd)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {employees.length > 5 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a1821] border border-[#2e2d38]">
                  <p className="text-sm text-[#c4bfce]">{employees.length} employees selected</p>
                  <p className="text-sm font-semibold text-[#8b6cf7]">{totalDisplay}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="flex gap-3 px-6 py-4 bg-[#1a1821] border-t border-[#2e2d38]">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#6f6b77] hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-[#2e2d38] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 py-2.5 px-5 rounded-lg text-sm font-semibold text-white bg-purple hover:bg-purple/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isApproving ? 'Approving…' : 'Sending…'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Pay {employees.length} Employee{employees.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
