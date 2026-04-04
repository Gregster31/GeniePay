import { useState } from 'react';
import { copyToClipboard } from '@/utils/ClipboardCopy';

export const useCopyToClipboard = (resetDelay = 2000) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), resetDelay);
    }
  };

  return { copy, copiedKey };
};
