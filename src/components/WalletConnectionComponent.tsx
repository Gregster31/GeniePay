import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

// Wallet Connection Component using RainbowKit
export const WalletConnection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          GeniePay Crypto Payroll
        </h1>

        <p className="text-gray-600 mb-8">
          Connect your wallet to get started with GeniePay
        </p>

        <div className="mb-8 flex justify-center">
          <ConnectButton />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Supported Features:</p>
          <div className="flex justify-center gap-4 text-xs text-gray-400">
            <span>• ETH Payments</span>
            <span>• Team Management</span>
            <span>• Transaction History</span>
          </div>
        </div>
      </div>
    </div>
  );
};
