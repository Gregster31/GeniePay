const BLOCKSCOUT_ENDPOINTS: Record<number, { url: string; name: string }> = {
  1:        { url: 'https://eth.blockscout.com/api',           name: 'Ethereum' },
  11155111: { url: 'https://eth-sepolia.blockscout.com/api',   name: 'Sepolia'  },
  10:       { url: 'https://optimism.blockscout.com/api',      name: 'Optimism' },
  8453:     { url: 'https://base.blockscout.com/api',          name: 'Base'     },
  137:      { url: 'https://polygon.blockscout.com/api',       name: 'Polygon'  },
  42161:    { url: 'https://arbitrum.blockscout.com/api',      name: 'Arbitrum' },
};

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: Date;
  gasFee: string;
  network: string;
  usdValue: string;
  chainId: number;
}

export function getExplorerUrl(txHash: string, chainId: number): string {
  const endpoint = BLOCKSCOUT_ENDPOINTS[chainId] ?? BLOCKSCOUT_ENDPOINTS[11155111];
  return `${endpoint.url.replace('/api', '')}/tx/${txHash}`;
}

async function fetchFromNetwork(
  address: string,
  chainId: number,
  page: number,
  limit: number,
): Promise<Transaction[]> {
  const endpoint = BLOCKSCOUT_ENDPOINTS[chainId];
  if (!endpoint) return [];

  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    address: address.toLowerCase(),
    page: page.toString(),
    offset: limit.toString(),
    sort: 'desc',
  });

  try {
    const res = await fetch(`${endpoint.url}?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== '1' || !data.result) return [];

    return data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '',
      value: formatValue(tx.value),
      timestamp: new Date(parseInt(tx.timeStamp) * 1000),
      gasFee: tx.gasUsed,
      network: endpoint.name,
      usdValue: '',
      chainId,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch transactions for a given address.
 *
 * @param chainId - If provided, only queries that chain (1 request).
 *                  If omitted, queries all 6 chains in parallel (6 requests).
 *                  Always pass the user's connected chainId when available.
 */
export async function fetchTransactions(
  address: string,
  page = 1,
  limit = 10,
  chainId?: number,
): Promise<Transaction[]> {
  if (chainId && BLOCKSCOUT_ENDPOINTS[chainId]) {
    return fetchFromNetwork(address, chainId, page, limit);
  }

  // No chain info, fall back to querying all chains (disconnected state)
  const chainIds = Object.keys(BLOCKSCOUT_ENDPOINTS).map(Number);
  const results = await Promise.all(
    chainIds.map(id => fetchFromNetwork(address, id, page, limit)),
  );
  const all = results.flat();
  all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return all.slice(0, limit);
}

function formatValue(value: string): string {
  const num = BigInt(value);
  const divisor = BigInt(10 ** 18);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;
  const fractionalStr = fractionalPart.toString().padStart(18, '0');
  const trimmed = fractionalStr.replace(/0+$/, '').slice(0, 6);
  return trimmed ? `${integerPart}.${trimmed}` : integerPart.toString();
}