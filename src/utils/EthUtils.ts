const isDev = import.meta.env.VITE_ENV_KEY?.toUpperCase() === 'TEST';
export const isDevelopment = isDev;

const ETH_PRICE_FALLBACK = 3000;

export const fetchEthPrice = async (): Promise<number> => {
  if (isDev) return ETH_PRICE_FALLBACK;

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
    );
    if (!res.ok) return ETH_PRICE_FALLBACK;

    const data = await res.json();
    return data.ethereum?.usd ?? ETH_PRICE_FALLBACK;
  } catch (e) {
    console.error('Price fetch failed:', e);
    return ETH_PRICE_FALLBACK;
  }
};

export const ethToUsd = (eth: number, price: number): number => eth * price;

export const usdToEth = (usd: number, price: number): number =>
  price > 0 ? usd / price : 0;

export const isValidEthAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
