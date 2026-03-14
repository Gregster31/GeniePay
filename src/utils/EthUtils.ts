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

export const isValidEthAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
