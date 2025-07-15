export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
  selectedAddress?: string;
  chainId?: string;
  networkVersion?: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const METAMASK_ERRORS = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  PENDING_REQUEST: -32002,
} as const;

export type MetaMaskError = {
  code: number;
  message: string;
  data?: any;
};