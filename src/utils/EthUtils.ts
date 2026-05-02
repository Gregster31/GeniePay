import type { TokenSymbol } from '@/config/tokenConfig';

const ETH_PRICE_FALLBACK = 0;

export const fetchEthPrice = async (): Promise<number> => {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT');
    if (!res.ok) return ETH_PRICE_FALLBACK;
    const data = await res.json();
    return parseFloat(data.price) || ETH_PRICE_FALLBACK;
  } catch {
    return ETH_PRICE_FALLBACK;
  }
};

export const ethToUsd = (eth: number, price: number): number => eth * price;

export const usdToEth = (usd: number, price: number): number =>
  price > 0 ? usd / price : 0;

/** Returns the USD price of 1 unit of a token. Stablecoins are always $1. */
export const getTokenPrice = (token: TokenSymbol, ethPrice: number): number =>
  token === 'ETH' ? ethPrice : 1;

/** Converts a token amount to its USD value. */
export const tokenToUsd = (amount: number, token: TokenSymbol, ethPrice: number): number =>
  amount * getTokenPrice(token, ethPrice);

/** Converts a USD amount to token units. */
export const usdToToken = (usd: number, token: TokenSymbol, ethPrice: number): number => {
  const price = getTokenPrice(token, ethPrice);
  return price > 0 ? usd / price : 0;
};

export const isValidEthAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
