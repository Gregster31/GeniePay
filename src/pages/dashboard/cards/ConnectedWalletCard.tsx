import { Card, Label } from "@/components/ui";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { sliceAddress } from "@/utils/WalletAddressSlicer";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";

export const WalletCard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { copy, copiedKey: cp } = useCopyToClipboard();

  return (
    <Card>
      <div className="flex justify-between mb-3.5">
        <Label>Connected Wallet</Label>
        {isConnected && address && (
          <div className="flex gap-0.5">
            <button onClick={() => copy('wallet', address)}
              className={`p-1 rounded flex items-center bg-transparent border-none cursor-pointer transition-colors ${cp === 'wallet' ? 'text-[#23DDC6]' : 'text-gray-500 hover:text-white'}`}>
              {cp === 'wallet' ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer"
              className="p-1 rounded flex items-center text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>

      {isConnected && address ? (
        <div className="rounded-lg px-3 py-2 flex items-center bg-gray-100 dark:bg-[#1a1b22]/60 border border-purple-200 dark:border-[#7c3aed]/20">
          <p className="font-mono text-[13px] font-medium tracking-wide text-gray-700 dark:text-gray-200">
            {sliceAddress(address)}
          </p>
        </div>
      ) : (
        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-gray-100 dark:bg-[#1a1b22]/60 border border-gray-200 dark:border-gray-700/50">
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
          <p className="text-[13px] text-gray-400 dark:text-gray-500">Not connected</p>
        </div>
      )}
    </Card>
  );
};