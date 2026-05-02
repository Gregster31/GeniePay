import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, bsc, sepolia } from 'wagmi/chains';
import { http } from 'viem';

export const wagmiConfig = getDefaultConfig({
  appName: 'GeniePay',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, arbitrum, optimism, base, polygon, bsc, sepolia],

  transports: {
    [mainnet.id]:  http('https://eth.drpc.org'),
    [arbitrum.id]: http('https://arbitrum.drpc.org'),
    [optimism.id]: http('https://optimism.drpc.org'),
    [base.id]:     http('https://base.drpc.org'),
    [polygon.id]:  http('https://polygon.drpc.org'),
    [bsc.id]:      http('https://bsc.drpc.org'),
    [sepolia.id]:  http('https://sepolia.drpc.org'),
  },

  pollingInterval: 60_000,
  ssr: false,
});

export default wagmiConfig;