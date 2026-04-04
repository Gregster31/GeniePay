import { Copy, CheckCircle2 } from 'lucide-react';

interface CopyBtnProps {
  id: string;
  value: string;
  copiedKey: string | null;
  onCopy: (key: string, value: string) => void;
}

export function CopyBtn({ id, value, copiedKey, onCopy }: CopyBtnProps) {
  return (
    <button
      onClick={() => onCopy(id, value)}
      className="shrink-0 text-gray-400 dark:text-[#6f6b77] hover:text-gray-700 dark:hover:text-[#c4bfce] transition-colors"
    >
      {copiedKey === id
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
