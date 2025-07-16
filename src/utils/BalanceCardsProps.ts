export interface BalanceCardsProps {
  stablecoins: Coin[];
}

export interface Coin {
  symbol: string;
  balance: string;
  icon: string;
}