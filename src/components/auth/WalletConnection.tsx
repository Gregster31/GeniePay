import React from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet, Shield, CheckCircle } from "lucide-react";

/**
 * Simplified wallet connection component that uses only RainbowKit
 * No custom modals - just the RainbowKit connect button
 */
export const WalletConnection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to GeniePay
        </h1>

        <p className="text-gray-600 mb-8">
          Connect your wallet to access the crypto payroll platform
        </p>

        {/* Features List */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8 space-y-3">
          <div className="flex items-center gap-3 text-left">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">No Account Required</p>
              <p className="text-xs text-gray-600">Connect and start using GeniePay instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Secure & Private</p>
              <p className="text-xs text-gray-600">Your keys, your funds, your control</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-left">
            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Global Payments</p>
              <p className="text-xs text-gray-600">Pay employees worldwide in crypto</p>
            </div>
          </div>
        </div>

        {/* RainbowKit Connect Button */}
        <div className="mb-8">
          <ConnectButton />
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};