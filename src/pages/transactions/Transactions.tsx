import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import {
  ArrowRight, ArrowLeft, Loader2,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ExternalLink,
} from 'lucide-react';
import { fetchTransactions, getExplorerUrl, type Transaction } from '@/utils/Blockscout';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { formatDate } from '@/utils/Format';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { ErrorPage } from '@/pages/ErrorPage';
import { PageShell } from '@/components/layout/PageShell';
import { CopyBtn } from '@/components/ui/CopyBtn';
import { DEMO_TRANSACTIONS } from '@/data/demoData';

const PAGE_SIZE = 20;

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
}

function Pagination({ currentPage, onPageChange, hasMore }: PaginationProps) {
  const visiblePages = Array.from({ length: 5 }, (_, i) => Math.max(1, currentPage - 2) + i);

  const btnBase = [
    'w-8 h-8 flex items-center justify-center rounded text-sm transition-colors',
    'bg-white dark:bg-[#1c1b22]',
    'border border-gray-200 dark:border-[#2e2d38]',
    'text-gray-500 dark:text-[#6f6b77]',
    'hover:text-gray-900 dark:hover:text-[#c4bfce]',
    'hover:border-gray-400 dark:hover:border-[#44414c]',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' ');

  return (
    <div className="flex items-center gap-1.5">
      <button className={btnBase} onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button className={btnBase} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="w-4 h-4" />
      </button>

      {visiblePages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          disabled={p > currentPage && !hasMore}
          className={[
            'w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            p === currentPage
              ? 'bg-[#5D00F2] border border-[#5D00F2] text-white'
              : 'bg-white dark:bg-[#1c1b22] border border-gray-200 dark:border-[#2e2d38] text-gray-700 dark:text-[#c4bfce] hover:border-gray-400 dark:hover:border-[#44414c]',
          ].join(' ')}
        >
          {p}
        </button>
      ))}

      <button className={btnBase} onClick={() => onPageChange(currentPage + 1)} disabled={!hasMore}>
        <ChevronRight className="w-4 h-4" />
      </button>
      <button className={btnBase} onClick={() => onPageChange(currentPage + 5)} disabled={!hasMore}>
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export const History: React.FC = () => {
  const { address, chain, isConnected } = useAccount();
  const [page, setPage] = useState(1);
  const { copy, copiedKey } = useCopyToClipboard();

  const { data: fetchedTransactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions', address, chain?.id, page],
    queryFn: () => fetchTransactions(address!, page, PAGE_SIZE, chain?.id),
    enabled: !!address,
    staleTime: 30_000,
  });

  const transactions: Transaction[] = isConnected ? fetchedTransactions : DEMO_TRANSACTIONS;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) return <ErrorPage />;

  const hasMore = isConnected && transactions.length === PAGE_SIZE;

  return (
    <PageShell
      title="Transaction History"
      subtitle={chain ? `Showing transactions on ${chain.name}` : 'View your blockchain transaction history'}
    >
      {/* Top pagination */}
      <div className="flex items-center justify-end mb-5">
        <Pagination currentPage={page} onPageChange={handlePageChange} hasMore={hasMore} />
      </div>

      {/* Table card */}
      <div className="relative rounded-xl border border-gray-200 dark:border-[#2e2d38] bg-white dark:bg-[#15141a] overflow-hidden">

        {!isConnected && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm bg-black/20 dark:bg-[#0f0e17]/45">
            <div className="text-center px-6 py-5 rounded-2xl shadow-xl bg-white dark:bg-[#15141a] border border-[#5D00F2]/25">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Connect your wallet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">to view your transaction history</p>
            </div>
          </div>
        )}

        <div className={`overflow-x-auto${!isConnected ? ' pointer-events-none select-none' : ''}`}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#1a1821] border-b border-gray-200 dark:border-[#2e2d38]">
                {/* Status */}
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77] w-12">
                  Status
                </th>
                {/* Txn Hash — hidden on mobile */}
                <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Txn Hash
                </th>
                {/* From */}
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  From
                </th>
                {/* Arrow — hidden on mobile */}
                <th className="hidden md:table-cell px-2 py-3.5 w-10" />
                {/* To — hidden on mobile */}
                <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  To
                </th>
                {/* Amount */}
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Amount
                </th>
                {/* Fee — hidden on tablet */}
                <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Fee (Wei)
                </th>
                {/* Date — hidden on mobile */}
                <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#6f6b77]">
                  Date
                </th>
                {/* Link */}
                <th className="px-5 py-3.5 w-12" />
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-9 h-9 text-purple-500 animate-spin" />
                      <span className="text-sm text-gray-400 dark:text-[#6f6b77]">Loading transactions…</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <span className="text-sm text-gray-400 dark:text-[#6f6b77]">No transactions found</span>
                  </td>
                </tr>
              ) : (
                transactions.map((tx: Transaction, index: number) => {
                  const isSent = tx.from.toLowerCase() === address?.toLowerCase();
                  const isLast = index === transactions.length - 1;

                  return (
                    <tr
                      key={tx.hash}
                      className={[
                        'transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]',
                        !isLast ? 'border-b border-gray-100 dark:border-[#2e2d38]/60' : '',
                      ].join(' ')}
                    >
                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </td>

                      {/* Txn Hash */}
                      <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-700 dark:text-[#c4bfce]">
                            {sliceAddress(tx.hash)}
                          </span>
                          <CopyBtn id={`${tx.hash}-hash`} value={tx.hash} copiedKey={copiedKey} onCopy={copy} />
                        </div>
                      </td>

                      {/* From */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-[#5D00F2] dark:text-[#8b6cf7]">
                            {sliceAddress(tx.from)}
                          </span>
                          <CopyBtn id={`${tx.hash}-from`} value={tx.from} copiedKey={copiedKey} onCopy={copy} />
                        </div>
                      </td>

                      {/* Arrow */}
                      <td className="hidden md:table-cell px-2 py-4">
                        <div className="w-6 h-6 rounded-full bg-[#38d5c1]/20 flex items-center justify-center mx-auto">
                          {isSent
                            ? <ArrowRight className="w-3.5 h-3.5 text-[#38d5c1]" />
                            : <ArrowLeft className="w-3.5 h-3.5 text-[#38d5c1]" />}
                        </div>
                      </td>

                      {/* To */}
                      <td className="hidden md:table-cell px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {tx.to ? (
                            <>
                              <span className="text-sm font-mono text-gray-700 dark:text-[#c4bfce]">
                                {sliceAddress(tx.to)}
                              </span>
                              <CopyBtn id={`${tx.hash}-to`} value={tx.to} copiedKey={copiedKey} onCopy={copy} />
                            </>
                          ) : (
                            <span className="text-sm italic text-gray-400 dark:text-[#6f6b77]">Contract</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: isSent ? '#f87171' : '#4ade80' }}
                        >
                          {isSent ? `−${tx.value}` : `+${tx.value}`}
                          <span className="ml-1 text-xs font-normal text-gray-400 dark:text-[#6f6b77]">{tx.tokenSymbol}</span>
                        </span>
                      </td>

                      {/* Fee */}
                      <td className="hidden lg:table-cell px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-400 dark:text-[#6f6b77] font-mono">{tx.gasFee}</span>
                      </td>

                      {/* Date */}
                      <td className="hidden sm:table-cell px-5 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-[#6f6b77]">{formatDate(tx.timestamp)}</span>
                      </td>

                      {/* Explorer link */}
                      <td className="px-5 py-4">
                        <a
                          href={getExplorerUrl(tx.hash, tx.chainId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 dark:text-[#6f6b77] hover:text-[#5D00F2] dark:hover:text-[#8b6cf7] transition-colors"
                          title="View on explorer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer pagination */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-end mt-5">
          <Pagination currentPage={page} onPageChange={handlePageChange} hasMore={hasMore} />
        </div>
      )}
    </PageShell>
  );
};

export default History;
