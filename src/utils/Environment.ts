const getEnv = (key: string, fallback = ''): string => {
  return import.meta.env[key] || fallback;
};

const envKey = getEnv('VITE_ENV_KEY', 'production');
export const isDevelopment = envKey.toLowerCase() === 'test';
export const isProduction = envKey.toLowerCase() === 'production';

export const chainId = isProduction ? 1 : 11155111; // Mainnet : Sepolia

// WalletConnect (required for RainbowKit)
export const walletConnectProjectId = getEnv('VITE_WALLET_CONNECT_PROJECT_ID');

if (!walletConnectProjectId) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID in .env file');
}

// Export simple config object
export const config = {
  isDevelopment,
  isProduction,
  chainId,
  walletConnectProjectId,
  appName: 'GeniePay',
  appVersion: '4.0.0',
};