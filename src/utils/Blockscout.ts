import { SUPPORTED_TOKENS_PER_CHAIN } from '@/config/tokenConfig';

const BLOCKSCOUT_ENDPOINTS: Record<number, { url: string; name: string }> = {
  1:        { url: 'https://eth.blockscout.com/api',           name: 'Ethereum' },
  42161:    { url: 'https://arbitrum.blockscout.com/api',      name: 'Arbitrum' },
  10:       { url: 'https://optimism.blockscout.com/api',      name: 'Optimism' },
  8453:     { url: 'https://base.blockscout.com/api',          name: 'Base'     },
  137:      { url: 'https://polygon.blockscout.com/api',       name: 'Polygon'  },
  56:       { url: 'https://bsc.blockscout.com/api',           name: 'BNB'      },
  11155111: { url: 'https://eth-sepolia.blockscout.com/api',   name: 'Sepolia'  },
};

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
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

interface BlockscoutNativeTx {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  timeStamp: string;
  gasUsed: string;
}

interface BlockscoutTokenTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  gasUsed: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

async function fetchNative(
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

    return (data.result as BlockscoutNativeTx[]).map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '',
      value: formatNativeValue(tx.value),
      tokenSymbol: 'ETH',
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

async function fetchTokenTransfers(
  address: string,
  chainId: number,
  page: number,
  limit: number,
): Promise<Transaction[]> {
  const endpoint = BLOCKSCOUT_ENDPOINTS[chainId];
  if (!endpoint) return [];

  const params = new URLSearchParams({
    module: 'account',
    action: 'tokentx',
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

    const supportedSymbols = new Set<string>(SUPPORTED_TOKENS_PER_CHAIN[chainId] ?? []);
    return (data.result as BlockscoutTokenTx[])
      .filter(tx => supportedSymbols.has(tx.tokenSymbol))
      .map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: formatTokenValue(tx.value, parseInt(tx.tokenDecimal) || 18),
        tokenSymbol: tx.tokenSymbol,
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
 * @param chainId - If provided, only queries that chain.
 *                  If omitted, queries all chains in parallel (disconnected state).
 *                  Always pass the user's connected chainId when available.
 */
export async function fetchTransactions(
  address: string,
  page = 1,
  limit = 10,
  chainId?: number,
): Promise<Transaction[]> {
  // Single-chain mode: known chainId
  if (chainId && BLOCKSCOUT_ENDPOINTS[chainId]) {
    const supportsETH = (SUPPORTED_TOKENS_PER_CHAIN[chainId] ?? []).includes('ETH');
    const [native, tokens] = await Promise.all([
      supportsETH ? fetchNative(address, chainId, page, limit) : Promise.resolve([]),
      fetchTokenTransfers(address, chainId, page, limit),
    ]);
    const combined = [...native, ...tokens];
    combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return combined.slice(0, limit);
  }

  // All-chains fallback: no chainId or unknown chainId — native only across all chains
  const allChainIds = Object.keys(BLOCKSCOUT_ENDPOINTS).map(Number);
  const results = await Promise.all(
    allChainIds.map(id => fetchNative(address, id, page, limit)),
  );
  const combined = results.flat();
  combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return combined.slice(0, limit);
}

function formatNativeValue(value: string): string {
  const num = BigInt(value);
  const divisor = BigInt(10 ** 18);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;
  const fractionalStr = fractionalPart.toString().padStart(18, '0');
  const trimmed = fractionalStr.replace(/0+$/, '').slice(0, 6);
  return trimmed ? `${integerPart}.${trimmed}` : integerPart.toString();
}

function formatTokenValue(value: string, decimals: number): string {
  const num = BigInt(value);
  const divisor = BigInt(10 ** decimals);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmed = fractionalStr.replace(/0+$/, '').slice(0, decimals <= 6 ? 2 : 4);
  return trimmed ? `${integerPart}.${trimmed}` : integerPart.toString();
}
