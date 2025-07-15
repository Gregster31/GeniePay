import React from 'react';
import { Wallet } from 'lucide-react';

interface WalletConnectionProps {
  onConnect: () => void;
  isConnecting?: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  onConnect, 
  isConnecting = false 
}) => {
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
      </div>
    </div>
  );
};

export default WalletConnection;