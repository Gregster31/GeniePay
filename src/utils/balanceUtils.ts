/**
 * Balance and Transaction Utilities
 * --------------------------------
 * Utilities for interacting with Ethereum blockchain, including:
 * - Balance fetching
 * - Network detection
 * - Transaction sending
 * - Gas price estimation
 * - MetaMask integration
 */

import type { EthereumProvider } from '../types/ethereum';

export interface AccountBalance {
  symbol: string;
  balance: string;
  icon: string;
  loading: boolean;
  error?: string;
}

export interface GasEstimate {
  gasPrice: string;
  estimatedFee: string;
  gasLimit: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const getMetaMask = (): EthereumProvider | null => {
  return isMetaMaskInstalled() ? window.ethereum! : null;
};

/**
 * Helper function to convert hex to decimal and format
 */
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

/**
 * Convert Wei to Ether
 */
const weiToEther = (wei: string): string => {
  const weiAmount = BigInt(wei);
  const etherAmount = Number(weiAmount) / Math.pow(10, 18);
  return etherAmount.toFixed(6);
};

/**
 * Convert Ether to Wei
 */
const etherToWei = (ether: string): string => {
  const etherAmount = parseFloat(ether);
  const weiAmount = Math.floor(etherAmount * Math.pow(10, 18));
  return weiAmount.toString();
};

/**
 * Convert Gwei to Wei
 */
const gweiToWei = (gwei: string): string => {
  const gweiAmount = parseFloat(gwei);
  const weiAmount = Math.floor(gweiAmount * Math.pow(10, 9));
  return weiAmount.toString();
};

/**
 * Convert Wei to Gwei
 */
const weiToGwei = (wei: string): string => {
  const weiAmount = BigInt(wei);
  const gweiAmount = Number(weiAmount) / Math.pow(10, 9);
  return gweiAmount.toFixed(2);
};

/**
 * Function to fetch ETH balance
 */
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

/**
 * Function to get current network name
 */
export const getCurrentNetwork = async (): Promise<string> => {
  try {
    const ethereum = getMetaMask();
    if (!ethereum) return 'Unknown';

    const chainId = await ethereum.request({ method: 'eth_chainId' });

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

/**
 * Get EIP-1559 gas fees
 */
const getEIP1559GasFees = async (): Promise<{
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  baseFeePerGas: string;
}> => {
  try {
    const ethereum = getMetaMask();
    if (!ethereum) throw new Error('MetaMask not found');

    // Get the latest block to extract base fee
    const latestBlock = await ethereum.request({
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    });

    const baseFeePerGas = latestBlock?.baseFeePerGas || '0x0';
    
    const maxPriorityFeePerGas = gweiToWei('2.5');
    
    const baseFeeWei = BigInt(baseFeePerGas);
    const priorityFeeWei = BigInt(maxPriorityFeePerGas);
    const maxFeePerGasWei = baseFeeWei * BigInt(2) + priorityFeeWei;
    
    const minMaxFee = gweiToWei('10');
    const finalMaxFee = maxFeePerGasWei < BigInt(minMaxFee) ? minMaxFee : maxFeePerGasWei.toString();

    console.log('EIP-1559 Gas Fees:', {
      baseFeePerGas: weiToGwei(baseFeePerGas) + ' gwei',
      maxPriorityFeePerGas: weiToGwei(maxPriorityFeePerGas) + ' gwei',
      maxFeePerGas: weiToGwei(finalMaxFee) + ' gwei'
    });

    return {
      maxFeePerGas: finalMaxFee,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      baseFeePerGas: baseFeePerGas,
    };
  } catch (error) {
    console.error('Error getting EIP-1559 fees, using fallback:', error);
    return {
      maxFeePerGas: gweiToWei('15'), 
      maxPriorityFeePerGas: gweiToWei('2'), 
      baseFeePerGas: gweiToWei('10'), 
    };
  }
};

/**
 * Estimate gas price and transaction fee with EIP-1559 support
 */
export const estimateGasPrice = async (
  toAddress?: string, 
  tokenSymbol?: string, 
  amount?: string,
  fromAddress?: string
): Promise<GasEstimate> => {
  try {
    const ethereum = getMetaMask();
    if (!ethereum) throw new Error('MetaMask not found');

    const gasFees = await getEIP1559GasFees();
    let gasLimit = '21000'; 

    if (toAddress && fromAddress) {
      try {
        if (tokenSymbol === 'ETH' && amount) {
          const estimatedGas = await ethereum.request({
            method: 'eth_estimateGas',
            params: [{
              from: fromAddress,
              to: toAddress,
              value: '0x' + BigInt(etherToWei(amount)).toString(16)
            }]
          });
          gasLimit = parseInt(estimatedGas, 16).toString();
        } else if (tokenSymbol && tokenSymbol !== 'ETH') {
          gasLimit = '65000'; 
        }
      } catch (estimateError) {
        console.log('Gas estimation failed, using defaults');
        gasLimit = tokenSymbol === 'ETH' ? '21000' : '65000';
      }
    }

    const bufferedGasLimit = Math.ceil(parseInt(gasLimit) * 1.2).toString();
    
    const maxFeeWei = BigInt(gasFees.maxFeePerGas);
    const estimatedFeeWei = maxFeeWei * BigInt(bufferedGasLimit);
    const estimatedFeeEth = weiToEther(estimatedFeeWei.toString());

    const minFeeEth = '0.002';
    const finalFeeEth = parseFloat(estimatedFeeEth) < parseFloat(minFeeEth) 
      ? minFeeEth 
      : estimatedFeeEth;

    console.log('Gas estimation details:', {
      maxFeePerGas: weiToGwei(gasFees.maxFeePerGas) + ' gwei',
      maxPriorityFeePerGas: weiToGwei(gasFees.maxPriorityFeePerGas) + ' gwei',
      gasLimit: bufferedGasLimit,
      estimatedFee: finalFeeEth + ' ETH',
      tokenSymbol: tokenSymbol || 'ETH'
    });

    return {
      gasPrice: weiToGwei(gasFees.maxFeePerGas),
      estimatedFee: finalFeeEth,
      gasLimit: bufferedGasLimit,
      maxFeePerGas: gasFees.maxFeePerGas,
      maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
    };
  } catch (error) {
    console.error('Error estimating gas price:', error);
    return {
      gasPrice: '15.00',
      estimatedFee: '0.003', 
      gasLimit: '65000',
      maxFeePerGas: gweiToWei('15'),
      maxPriorityFeePerGas: gweiToWei('2'),
    };
  }
};

/**
 * Send ETH transaction with EIP-1559 support
 */
export const sendEthTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string
): Promise<string> => {
  try {
    const ethereum = getMetaMask();
    if (!ethereum) throw new Error('MetaMask not found');

    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(fromAddress) || !ethAddressRegex.test(toAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    const amountWei = etherToWei(amount);
    const gasEstimate = await estimateGasPrice(toAddress, 'ETH', amount, fromAddress);

    // Use EIP-1559 transaction format
    const transactionParams = {
      from: fromAddress,
      to: toAddress,
      value: '0x' + BigInt(amountWei).toString(16),
      gas: '0x' + parseInt(gasEstimate.gasLimit).toString(16),
      maxFeePerGas: '0x' + BigInt(gasEstimate.maxFeePerGas!).toString(16),
      maxPriorityFeePerGas: '0x' + BigInt(gasEstimate.maxPriorityFeePerGas!).toString(16),
    };

    console.log('Sending EIP-1559 transaction with params:', {
      ...transactionParams,
      value: amount + ' ETH',
      gas: gasEstimate.gasLimit,
      maxFeePerGas: weiToGwei(gasEstimate.maxFeePerGas!) + ' gwei',
      maxPriorityFeePerGas: weiToGwei(gasEstimate.maxPriorityFeePerGas!) + ' gwei'
    });

    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParams],
    });

    return txHash as string;
  } catch (error: any) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

/**
 * Wait for transaction confirmation
 */
export const waitForTransactionConfirmation = async (txHash: string): Promise<any> => {
  try {
    const ethereum = getMetaMask();
    if (!ethereum) throw new Error('MetaMask not found');

    let receipt = null;
    let attempts = 0;
    const maxAttempts = 60;

    while (!receipt && attempts < maxAttempts) {
      try {
        receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });

        if (receipt && receipt.blockNumber) {
          return receipt;
        }
      } catch (error) {
        console.log(`Waiting for confirmation... (${attempts + 1}s)`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Transaction confirmation timed out');
  } catch (error) {
    console.error('Error waiting for transaction confirmation:', error);
    throw error;
  }
};