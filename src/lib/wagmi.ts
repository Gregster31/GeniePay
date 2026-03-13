import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { http } from 'viem';

export const wagmiConfig = getDefaultConfig({
  appName: 'GeniePay',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],

  transports: {
    [mainnet.id]:  http('https://cloudflare-eth.com'),
    [polygon.id]:  http('https://polygon-rpc.com'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
    [base.id]:     http('https://mainnet.base.org'),
    [sepolia.id]:  http('https://ethereum-sepolia-rpc.publicnode.com'),
  },

  pollingInterval: 60_000,

  ssr: false,
});

export default wagmiConfig;