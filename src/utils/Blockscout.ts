/**
 * Blockscout API Service
 * Handles fetching transaction history from Blockscout across multiple networks
 */
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

// Blockscout API endpoints for different networks
const BLOCKSCOUT_ENDPOINTS: Record<number, { url: string; name: string }> = {
  1: { url: 'https://eth.blockscout.com/api', name: 'Ethereum' },
  11155111: { url: 'https://eth-sepolia.blockscout.com/api', name: 'Sepolia' },
  10: { url: 'https://optimism.blockscout.com/api', name: 'Optimism' },
  8453: { url: 'https://base.blockscout.com/api', name: 'Base' },
  137: { url: 'https://polygon.blockscout.com/api', name: 'Polygon' },
  42161: { url: 'https://arbitrum.blockscout.com/api', name: 'Arbitrum' },
};

export function getExplorerUrl(txHash: string, chainId: number): string {
  const endpoint = BLOCKSCOUT_ENDPOINTS[chainId] || BLOCKSCOUT_ENDPOINTS[11155111];
  const baseUrl = endpoint.url.replace('/api', '');
  return `${baseUrl}/tx/${txHash}`;
}

async function fetchFromNetwork(
  address: string,
  chainId: number,
  page: number,
  limit: number
): Promise<Transaction[]> {
  const endpoint = BLOCKSCOUT_ENDPOINTS[chainId];
  
  if (!endpoint) {
    return [];
  }

  const params = new URLSearchParams({
    module: 'account',
    action: 'txlist',
    address: address.toLowerCase(),
    page: page.toString(),
    offset: limit.toString(),
    sort: 'desc',
  });

  try {
    const response = await fetch(`${endpoint.url}?${params}`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.status !== '1' || !data.result) {
      return [];
    }

    return data.result.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '',
      value: formatValue(tx.value),
      timestamp: new Date(parseInt(tx.timeStamp) * 1000),
      gasFee: tx.gasUsed, // Keep in Wei
      network: endpoint.name,
      chainId: chainId,
    }));
  } catch (error) {
    console.error(`Error fetching from chain ${chainId}:`, error);
    return [];
  }
}

export async function fetchTransactions(
  address: string,
  page: number = 1,
  limit: number = 10
): Promise<Transaction[]> {
  const chainIds = [1, 11155111, 10, 8453, 137, 42161];
  
  // Fetch from all networks in parallel
  const results = await Promise.all(
    chainIds.map(chainId => fetchFromNetwork(address, chainId, page, limit))
  );
  const allTransactions = results.flat();
  allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return allTransactions.slice(0, limit);
}

function formatValue(value: string): string {
  const num = BigInt(value);
  const divisor = BigInt(10 ** 18);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;
  
  const fractionalStr = fractionalPart.toString().padStart(18, '0');
  const trimmed = fractionalStr.replace(/0+$/, '').slice(0, 6);
  
  if (trimmed) {
    return `${integerPart}.${trimmed}`;
  }
  return integerPart.toString();
}