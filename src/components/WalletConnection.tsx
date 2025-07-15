import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import type { EthereumProvider } from '../types/ethereum';

interface WalletConnectionProps {
  onConnect: () => void;
  isConnecting?: boolean;
  error?: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  onConnect, 
  isConnecting = false,
  error 
}) => {
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  useEffect(() => {
    const checkMetaMask = (): boolean => {
      return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    };

    setIsMetaMaskAvailable(checkMetaMask());
  }, []);

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="avatar-placeholder w-16 h-16 mx-auto mb-6">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Crypto Payroll
        </h1>

        <p className="text-gray-600 mb-8">
          Connect your wallet to get started with crypto payments
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {isMetaMaskAvailable ? (
          <button
            onClick={onConnect}
            disabled={isConnecting}
            className={`w-full py-3 px-6 btn-primary btn-icon ${
              isConnecting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Wallet className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <button
            onClick={handleInstallMetaMask}
            className="w-full py-3 px-6 bg-orange-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <Wallet className="w-5 h-5" />
            Install MetaMask
          </button>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;
