import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';
import { http } from 'viem';

const sepoliaWithRPC = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://rpc.sepolia.org',
        'https://eth-sepolia.public.blastapi.io',
        'https://sepolia.gateway.tenderly.co',
      ]
    },
    public: {
      http: [
        'https://ethereum-sepolia-rpc.publicnode.com',
        'https://rpc.sepolia.org',
      ]
    }
  }
};

export const wagmiConfig = getDefaultConfig({
  appName: 'GeniePay',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepoliaWithRPC],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: false,
});

export default wagmiConfig;