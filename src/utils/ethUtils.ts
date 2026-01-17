const isDev = import.meta.env.VITE_ENV_KEY === 'TEST';

// Fetch ETH price from CoinGecko (returns 1 in dev mode)
export const fetchEthPrice = async (): Promise<number> => {
  if (isDev) return 1;
  
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await res.json();
    return data.ethereum?.usd || 1;
  } catch (e) {
    console.error('Price fetch failed:', e);
    return 1;
  }
};

// Convert ETH to USD
export const ethToUsd = (eth: number, price: number): number => {
  return eth * price;
};

// Convert USD to ETH
export const usdToEth = (usd: number, price: number): number => {
  return price > 0 ? usd / price : 0;
};

export const isDevelopment = isDev;