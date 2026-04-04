import { useState, useEffect, useRef } from 'react';
import { isAddress } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const ensClient = createPublicClient({ chain: mainnet, transport: http() });

export const useEnsResolution = (input: string) => {
  const [resolved, setResolved] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const val = input.trim();
    setResolved(null);
    setError(false);

    if (!val)           return;
    if (isAddress(val)) return;

    if (!val.endsWith('.eth')) return;

    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const addr = await ensClient.getEnsAddress({ name: val });
        if (addr) { setResolved(addr); setError(false); }
        else      { setError(true); }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer.current);
  }, [input]);

  const address = resolved ?? (isAddress(input.trim()) ? input.trim() : null);

  return { address, resolved, loading, error };
};