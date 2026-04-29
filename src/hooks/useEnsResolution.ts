import { useState, useEffect, useRef } from 'react';
import { isAddress } from 'viem';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { supabase } from '@/lib/supabase';

const ensClient = createPublicClient({ chain: mainnet, transport: http('https://eth.drpc.org') });

export const useEnsResolution = (input: string) => {
  const [resolved, setResolved] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const val = input.trim();
    setResolved(null);
    setError(false);

    if (!val || isAddress(val)) { setLoading(false); return; }
    if (!val.includes('.'))     { setLoading(false); return; }

    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        let addr: string | null = null;

        if (val.endsWith('.eth')) {
          addr = await ensClient.getEnsAddress({ name: normalize(val) });
        } else {
          const { data, error: fnError } = await supabase.functions.invoke('resolve-domain', {
            body: { domain: val },
          });
          if (!fnError) addr = data?.address ?? null;
        }

        if (addr && isAddress(addr)) {
          setResolved(addr);
        } else {
          setError(true);
        }
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
