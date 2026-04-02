import { Card, Label } from "@/components/ui";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { sliceAddress } from "@/utils/WalletAddressSlicer";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";

export const WalletCard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { copy, copiedValue: cp } = useCopyToClipboard();

  return (
    <Card>
      <div className="flex justify-between mb-3.5">
        <Label>Connected Wallet</Label>
        {isConnected && address && (
          <div className="flex gap-0.5">
            <button onClick={() => copy(address)}
              className={`p-1 rounded flex items-center bg-transparent border-none cursor-pointer transition-colors ${cp === address ? 'text-[#23DDC6]' : 'text-gray-500 hover:text-white'}`}>
              {cp === address ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <a href={`https://etherscan.io/address/${address}`} target="_blank" rel="noopener noreferrer"
              className="p-1 rounded flex items-center text-gray-500 hover:text-white transition-colors">
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>

      <div
        className="rounded-lg px-3 py-2 flex items-center"
        style={{ backgroundColor: 'rgba(26,27,34,0.6)', border: '1px solid rgba(124,58,237,0.2)' }}
      >
        <p className="font-mono text-[13px] font-medium tracking-wide text-gray-200">
          {sliceAddress(address)}
        </p>
      </div>
    </Card>
  );
};