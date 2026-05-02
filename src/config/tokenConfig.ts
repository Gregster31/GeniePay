import type { Address } from 'viem';

export type TokenSymbol = 'ETH' | 'USDC' | 'USDT';

export const SUPPORTED_CHAIN_IDS = [1, 42161, 10, 8453, 137, 56, 11155111] as const;

export const SUPPORTED_TOKENS_PER_CHAIN: Record<number, TokenSymbol[]> = {
  1:        ['ETH', 'USDC', 'USDT'],  // Ethereum
  42161:    ['ETH', 'USDC', 'USDT'],  // Arbitrum
  10:       ['ETH', 'USDC', 'USDT'],  // Optimism
  8453:     ['ETH', 'USDC'],           // Base (no USDT)
  137:      ['USDC', 'USDT'],          // Polygon (no native ETH)
  56:       ['USDC', 'USDT'],          // BNB (no native ETH)
  11155111: ['ETH', 'USDC'],           // Sepolia testnet (no USDT)
};

export const TOKEN_ADDRESSES: Record<number, Partial<Record<TokenSymbol, Address | 'native'>>> = {
  1: {                                                           // Ethereum
    ETH:  'native',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  42161: {                                                       // Arbitrum
    ETH:  'native',
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  10: {                                                          // Optimism
    ETH:  'native',
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  },
  8453: {                                                        // Base (no USDT)
    ETH:  'native',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  137: {                                                         // Polygon (no native ETH)
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  56: {                                                          // BNB (no native ETH)
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    USDT: '0x55d398326f99059fF775485246999027B3197955',
  },
  11155111: {                                                    // Sepolia testnet (no USDT)
    ETH:  'native',
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  },
};

export const TOKEN_DECIMALS: Record<TokenSymbol, number> = {
  ETH:  18,
  USDC: 6,
  USDT: 6,
};

export const DISPERSE_CONTRACTS: Record<number, Address> = {
  1:        '0xD152f549545093347A162Dce210e7293f1452150',  // Ethereum
  42161:    '0x692B5A7eCcCaD243a07535E8C24b0e7433238c6a',  // Arbitrum (different address)
  10:       '0xD152f549545093347A162Dce210e7293f1452150',  // Optimism
  8453:     '0xD152f549545093347A162Dce210e7293f1452150',  // Base
  137:      '0xD152f549545093347A162Dce210e7293f1452150',  // Polygon
  56:       '0xD152f549545093347A162Dce210e7293f1452150',  // BNB
  11155111: '0xD152f549545093347A162Dce210e7293f1452150',  // Sepolia
};

export const CHAIN_NAMES: Record<number, string> = {
  1:        'Ethereum',
  42161:    'Arbitrum',
  10:       'Optimism',
  8453:     'Base',
  137:      'Polygon',
  56:       'BNB',
  11155111: 'Sepolia',
};

export function getSupportedTokens(chainId: number | undefined): TokenSymbol[] {
  if (!chainId) return [];
  return SUPPORTED_TOKENS_PER_CHAIN[chainId] ?? [];
}

export function isTokenSupported(chainId: number | undefined, token: TokenSymbol): boolean {
  return getSupportedTokens(chainId).includes(token);
}

export function getTokenAddress(chainId: number, token: TokenSymbol): Address | 'native' | undefined {
  return TOKEN_ADDRESSES[chainId]?.[token];
}

export function isChainSupported(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId);
}
