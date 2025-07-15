export interface BalanceCardsProps {
  stablecoins: Stablecoin[];
}

export interface Stablecoin {
  symbol: string;
  balance: string;
  icon: string;
}