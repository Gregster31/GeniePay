import { useState } from 'react';
import { copyToClipboard } from '@/utils/ClipboardCopy';

export const useCopyToClipboard = (resetDelay = 2000) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedValue(text);
      setTimeout(() => setCopiedValue(null), resetDelay);
    }
  };

  return { copy, copiedValue };
};