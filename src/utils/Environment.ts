const getEnv = (key: string, fallback = ''): string => {
  return import.meta.env[key] || fallback;
};

// App environment
export const isProduction = getEnv('VITE_ENV') === 'PRODUCTION';

// Blockchain config
export const chainId = isProduction ? 1 : 11155111; // Mainnet : Sepolia

// WalletConnect (required for RainbowKit)
export const walletConnectProjectId = getEnv('VITE_WALLET_CONNECT_PROJECT_ID');

if (!walletConnectProjectId) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID in .env file');
}

// Export simple config object
export const config = {
  isProduction,
  chainId,
  walletConnectProjectId,
  appName: 'GeniePay',
  appVersion: '2.0.0',
};