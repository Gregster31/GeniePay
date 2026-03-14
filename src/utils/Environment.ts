const getEnv = (key: string, fallback = ''): string => {
  return import.meta.env[key] || fallback;
};

// WalletConnect (required for RainbowKit)
export const walletConnectProjectId = getEnv('VITE_WALLET_CONNECT_PROJECT_ID');

if (!walletConnectProjectId) {
  throw new Error('Missing VITE_WALLET_CONNECT_PROJECT_ID in .env file');
}