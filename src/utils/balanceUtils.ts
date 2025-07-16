import type { EthereumProvider } from '../types/ethereum';

export interface AccountBalance {
  symbol: string;
  balance: string;
  icon: string;
  loading: boolean;
  error?: string;
}

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const getMetaMask = (): EthereumProvider | null => {
  return isMetaMaskInstalled() ? window.ethereum! : null;
};

// Helper function to convert hex to decimal and format
const formatBalance = (hexBalance: string, decimals: number = 18): string => {
  try {
    const balance = parseInt(hexBalance, 16);
    const formattedBalance = balance / Math.pow(10, decimals);
    return formattedBalance.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.0000';
  }
};

// Function to fetch ETH balance
export const fetchEthBalance = async (userAddress: string): Promise<string> => {
  try {
    const ethereum = getMetaMask();
    if (!ethereum) throw new Error('Ethereum provider not found');

    const result = await ethereum.request({
      method: 'eth_getBalance',
      params: [userAddress, 'latest'],
    });

    return formatBalance(result as string, 18);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    throw error;
  }
};

// Function to get current network name
export const getCurrentNetwork = async (): Promise<string> => {
  try {
    const ethereum = getMetaMask();
    if (!ethereum) return 'Unknown';
    
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    
    // Convert common chain IDs to network names
    switch (chainId) {
      case '0x1':
        return 'Ethereum Mainnet';
      case '0x5':
        return 'Goerli Testnet';
      case '0xaa36a7':
        return 'Sepolia Testnet';
      case '0x89':
        return 'Polygon Mainnet';
      case '0xa4b1':
        return 'Arbitrum One';
      case '0xa':
        return 'Optimism';
      default:
        return `Chain ID: ${chainId}`;
    }
  } catch (error) {
    console.error('Error getting network:', error);
    return 'Unknown';
  }
};