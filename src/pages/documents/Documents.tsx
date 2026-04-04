import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Printer, Trash2, ExternalLink, Loader2, FileX } from 'lucide-react';
import { fetchReceipts, deleteReceipt } from '@/services/ReceiptService';
import { openReceiptPdf, downloadReceiptHtml } from '@/utils/ReceiptPdf';
import type { Receipt } from '@/models/ReceiptModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { formatCurrency, formatDateLong } from '@/utils/Format';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { PageShell } from '@/components/layout/PageShell';
import { CopyBtn } from '@/components/ui/CopyBtn';

const TYPE_LABELS: Record<string, string> = {
  quickpay: 'Quick Pay',
  payroll:  'Batch Payroll',
};

export const Documents: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { copy, copiedKey } = useCopyToClipboard();

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

  const handleDelete = (id: string) => { setDeletingId(id); deleteMutation.mutate(id); };

  return (
    <PageShell title="Documents" subtitle="Payment receipts and transaction records">

      <div className="rounded-xl border border-gray-200 dark:border-[#2e2d38] bg-white dark:bg-[#15141a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#1a1821] border-b border-gray-200 dark:border-[#2e2d38]">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77] w-12">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Type
                </th>
                <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Tx Hash
                </th>
                <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  From
                </th>
                <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Network
                </th>
                <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Recipients
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Amount
                </th>
                <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Date
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-9 h-9 text-purple-500 animate-spin" />
                      <span className="text-sm text-gray-400 dark:text-[#6f6b77]">Loading documents…</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#5D00F2]/10 border border-[#5D00F2]/20">
                        <FileX className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">No documents yet</p>
                        <p className="text-sm text-gray-500">Your payment receipts will appear here after transactions</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                receipts.map((receipt: Receipt, index: number) => {
                  const isLast = index === receipts.length - 1;
                  const isDeleting = deletingId === receipt.id;

                  return (
                    <tr
                      key={receipt.id}
                      className={[
                        'transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]',
                        !isLast ? 'border-b border-gray-100 dark:border-[#2e2d38]/60' : '',
                      ].join(' ')}
                    >
                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800 dark:text-[#c4bfce]">
                          {TYPE_LABELS[receipt.type] ?? receipt.type}
                        </span>
                      </td>

                      {/* Tx Hash */}
                      <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-[#5D00F2] dark:text-[#8b6cf7]">
                            {sliceAddress(receipt.txHash)}
                          </span>
                          <CopyBtn id={`${receipt.id}-txhash`} value={receipt.txHash} copiedKey={copiedKey} onCopy={copy} />
                          <a
                            href={`https://etherscan.io/tx/${receipt.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 dark:text-[#6f6b77] hover:text-[#5D00F2] dark:hover:text-[#8b6cf7] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* From */}
                      <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-700 dark:text-[#c4bfce]">
                            {sliceAddress(receipt.from)}
                          </span>
                          <CopyBtn id={`${receipt.id}-from`} value={receipt.from} copiedKey={copiedKey} onCopy={copy} />
                        </div>
                      </td>

                      {/* Network */}
                      <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-[#c4bfce]">{receipt.network}</span>
                      </td>

                      {/* Recipients */}
                      <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-[#6f6b77]">
                          {receipt.recipients.length} recipient{receipt.recipients.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(receipt.totalUsd)}
                          </span>
                          <span className="block text-xs text-gray-400 dark:text-[#6f6b77] mt-0.5">
                            {receipt.totalCrypto.toFixed(5)} {receipt.currency}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-[#6f6b77]">
                          {formatDateLong(receipt.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReceiptPdf(receipt)}
                            className="p-2 rounded-lg transition-colors text-gray-400 dark:text-[#6f6b77] hover:text-gray-700 dark:hover:text-[#c4bfce] hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                            title="Print"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadReceiptHtml(receipt)}
                            className="p-2 rounded-lg transition-colors text-purple hover:text-purple/80 hover:bg-purple/10"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(receipt.id)}
                            disabled={isDeleting}
                            className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {isDeleting
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </PageShell>
  );
};

export default Documents;
