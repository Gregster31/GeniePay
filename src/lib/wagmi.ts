import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { http } from 'viem';

export const wagmiConfig = getDefaultConfig({
  appName: 'GeniePay',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],

  transports: {
    [mainnet.id]:  http('https://eth.drpc.org'),
    [polygon.id]:  http('https://polygon.drpc.org'),
    [optimism.id]: http('https://optimism.drpc.org'),
    [arbitrum.id]: http('https://arbitrum.drpc.org'),
    [base.id]:     http('https://base.drpc.org'),
    [sepolia.id]:  http('https://sepolia.drpc.org'),
  },

  pollingInterval: 60_000,
  ssr: false,
});

export default wagmiConfig;