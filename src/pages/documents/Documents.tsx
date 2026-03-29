import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Download, Printer, Trash2,
  ExternalLink, Loader2, FileX,
} from 'lucide-react';
import { fetchReceipts, deleteReceipt } from '@/services/ReceiptService';
import { openReceiptPdf, downloadReceiptHtml } from '@/utils/ReceiptPdf';
import type { Receipt } from '@/models/ReceiptModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { formatCurrency, formatDateLong } from '@/utils/Format';

const TYPE_LABELS: Record<string, string> = {
  quickpay: 'Quick Pay',
  payroll:  'Batch Payroll',
};

const ReceiptCard: React.FC<{
  receipt: Receipt;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}> = ({ receipt, onDelete, isDeleting }) => {
  const explorerBase = 'https://etherscan.io/tx/';

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: 'rgba(26, 27, 34, 0.6)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
          >
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm">
                {TYPE_LABELS[receipt.type] ?? receipt.type}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#4ade80',
                }}
              >
                Confirmed
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{formatDateLong(receipt.createdAt)}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <div className="text-white font-bold text-lg">{formatCurrency(receipt.totalUsd)}</div>
          <div className="text-xs text-gray-500">
            {receipt.totalCrypto.toFixed(5)} {receipt.currency}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-500 block mb-0.5">From</span>
          <span className="text-gray-300 font-mono">{sliceAddress(receipt.from)}</span>
        </div>
        <div>
          <span className="text-gray-500 block mb-0.5">Network</span>
          <span className="text-gray-300">{receipt.network}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500 block mb-0.5">Tx Hash</span>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-mono">{sliceAddress(receipt.txHash)}</span>
            <a
              href={`${explorerBase}${receipt.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-purple-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <div>
          <span className="text-gray-500 block mb-0.5">Recipients</span>
          <span className="text-gray-300">{receipt.recipients.length}</span>
        </div>
        {receipt.gasFee && (
          <div>
            <span className="text-gray-500 block mb-0.5">Gas Used</span>
            <span className="text-gray-300">{receipt.gasFee}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {/* View / Print PDF */}
        <button
          onClick={() => openReceiptPdf(receipt)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center transition-all"
          style={{
            backgroundColor: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.25)',
            color: '#a78bfa',
          }}
        >
          <Printer className="w-3.5 h-3.5" />
          View / Print
        </button>

        {/* Download HTML */}
        <button
          onClick={() => downloadReceiptHtml(receipt)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium flex-1 justify-center transition-all"
          style={{
            backgroundColor: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            color: '#c4b5fd',
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(receipt.id)}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171',
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const Documents: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts,
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReceipt,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['receipts'] }),
    onSettled: () => setDeletingId(null),
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="w-full max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
            >
              Documents
            </h1>
            <p className="text-gray-400 text-sm">
              Transaction receipts · up to 5 stored · oldest overwritten when full
            </p>
          </div>

          {/* Capacity indicator */}
          {!isLoading && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#a78bfa',
              }}
            >
              <FileText className="w-4 h-4" />
              {receipts.length} / 5 receipts
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && receipts.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl gap-4"
            style={{
              backgroundColor: 'rgba(26, 27, 34, 0.4)',
              border: '1px solid rgba(124, 58, 237, 0.15)',
            }}
          >
            <FileX className="w-12 h-12 text-gray-600" />
            <div className="text-center">
              <p className="text-gray-400 font-medium">No receipts yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Receipts are saved automatically after successful payments.
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!isLoading && receipts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onDelete={handleDelete}
                isDeleting={deletingId === receipt.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;