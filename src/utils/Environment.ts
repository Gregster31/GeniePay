// src/config/environment.ts
export const isProduction = import.meta.env.VITE_ENV === 'PRODUCTION';

export const config = {
  isProduction,
  chainId: isProduction ? 1 : 11155111, // 1 for mainnet, 11155111 for Sepolia
};