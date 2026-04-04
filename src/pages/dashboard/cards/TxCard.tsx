import { Card, Label } from "@/components/ui";
import { ExternalLink, ArrowLeftRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchReceipts } from "@/services/ReceiptService";
import { sliceAddress } from "@/utils/WalletAddressSlicer";
import { formatCurrency } from "@/utils/Format";

const timeAgo = (date: Date) => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const TxCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts,
    staleTime: 60_000,
  });

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex justify-between items-center px-[18px] py-3.5 border-b dark:border-white/[0.07] border-black/[0.07]">
        <Label>Latest Transactions</Label>
        <button onClick={onClick} className="flex items-center gap-1 text-[11px] font-medium text-[#23DDC6] bg-transparent border-none cursor-pointer p-0">
          View all <ExternalLink size={10} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={16} className="animate-spin text-gray-500" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="px-[18px] py-8 text-center text-[12px] text-gray-500">No transactions yet</div>
      ) : (
        receipts.map(tx => (
          <div key={tx.id} onClick={onClick}
            className="flex items-center gap-3 px-[18px] py-3 border-b dark:border-white/[0.04] border-black/[0.05] cursor-pointer dark:hover:bg-white/[0.025] hover:bg-black/[0.03] transition-colors">
            <div className="p-1.5 rounded-lg dark:bg-white/[0.05] bg-black/[0.05] shrink-0">
              <ArrowLeftRight size={13} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#23DDC6]/10 text-[#23DDC6] border border-[#23DDC6]/20 uppercase tracking-wider">Sucess</span>
                <span className="text-[11px] text-gray-500">{timeAgo(tx.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Hash</span>
                <span className="text-[11px] font-mono dark:text-gray-300 text-gray-700">{sliceAddress(tx.txHash)}</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Amount</span>
                <span className="text-[12px] font-medium dark:text-gray-300 text-gray-700">{formatCurrency(tx.totalUsd)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </Card>
  );
};