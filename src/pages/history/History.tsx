import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Copy, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchTransactions, getExplorerUrl, type Transaction } from '@/utils/Blockscout';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { copyToClipboard } from '@/utils/ClipboardCopy';
import { ErrorPage } from '@/pages/ErrorPage';

const INITIAL_LIMIT = 10;

export const History: React.FC = () => {
  const { address } = useAccount();
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions', address, page],
    queryFn: () => fetchTransactions(address!, page, INITIAL_LIMIT),
    enabled: !!address,
    staleTime: 30000,
  });

  // Append new transactions when data changes
  React.useEffect(() => {
    if (transactions.length > 0) {
      setAllTransactions(prev => {
        const existingHashes = new Set(prev.map(tx => tx.hash));
        const newTxs = transactions.filter(tx => !existingHashes.has(tx.hash));
        return [...prev, ...newTxs];
      });
    }
  }, [transactions]);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return <ErrorPage />;
  }

  const displayTransactions = allTransactions.length > 0 ? allTransactions : transactions;

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
          >
            Transaction History
          </h1>
          <p className="text-gray-400 text-sm">
            View your blockchain transaction history across all networks
          </p>
        </div>
        
        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(26, 27, 34, 0.6)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          {isLoading && page === 1 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
              <p className="text-gray-400 text-sm">Loading transactions...</p>
            </div>
          ) : displayTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-gray-400 text-sm">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: 'rgba(15, 13, 22, 0.6)',
                        borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
                      }}
                    >
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                        Network
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                        From
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                        To
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                        Amount (ETH)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                        Gas Fee (Wei)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayTransactions.map((tx, index) => (
                      <tr
                        key={tx.hash}
                        className="transition-all hover:bg-white/5"
                        style={{
                          borderBottom:
                            index < displayTransactions.length - 1
                              ? '1px solid rgba(124, 58, 237, 0.1)'
                              : 'none',
                        }}
                      >
                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300">
                            {formatDate(tx.timestamp)}
                          </span>
                        </td>

                        {/* Network */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300">
                            {tx.network}
                          </span>
                        </td>

                        {/* From - Clickable */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCopy(tx.from)}
                            className="flex items-center gap-1 group"
                            title="Click to copy address"
                          >
                            <span className="text-sm font-mono text-gray-300 group-hover:text-purple-400 transition-colors">
                              {sliceAddress(tx.from)}
                            </span>
                            {copiedHash === tx.from ? (
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </td>

                        {/* To - Clickable */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCopy(tx.to)}
                            className="flex items-center gap-1 group"
                            title="Click to copy address"
                          >
                            <span className="text-sm font-mono text-gray-300 group-hover:text-purple-400 transition-colors">
                              {sliceAddress(tx.to)}
                            </span>
                            {copiedHash === tx.to ? (
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-white">
                            {tx.value}
                          </span>
                        </td>

                        {/* Gas Fee */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-400">
                            {tx.gasFee}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(tx.hash)}
                              className="p-2 rounded-lg transition-all"
                              style={{
                                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                border: '1px solid rgba(124, 58, 237, 0.2)',
                              }}
                              title="Copy transaction hash"
                            >
                              {copiedHash === tx.hash ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-purple-400" />
                              )}
                            </button>
                            <a
                              href={getExplorerUrl(tx.hash, tx.chainId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg transition-all"
                              style={{
                                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                border: '1px solid rgba(124, 58, 237, 0.2)',
                              }}
                              title="View on Blockscout"
                            >
                              <ExternalLink className="w-4 h-4 text-purple-400" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Load More */}
              {transactions.length === INITIAL_LIMIT && (
                <div className="p-6 text-center border-t" style={{ borderColor: 'rgba(124, 58, 237, 0.2)' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      color: 'white',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;