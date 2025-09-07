// components/auth/ConnectionModal.tsx
import React from 'react'
import { X, Wallet, Shield, CheckCircle } from 'lucide-react'
import { useConnectModal } from '@rainbow-me/rainbowkit'

interface ConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { openConnectModal } = useConnectModal()

  if (!isOpen) return null

  const handleWalletConnect = () => {
    // Open RainbowKit modal for wallet connection
    openConnectModal?.()
    // Close this modal as RainbowKit will handle the connection UI
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect to GeniePay
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Wallet Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Description */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 text-sm">
              Connect your crypto wallet to access GeniePay's payroll platform
            </p>
          </div>

          {/* Features List */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">No Account Required</p>
                <p className="text-xs text-gray-600">Connect and start using GeniePay instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Secure & Private</p>
                <p className="text-xs text-gray-600">Your keys, your crypto, always in control</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Wallet className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Multiple Wallets Supported</p>
                <p className="text-xs text-gray-600">MetaMask, WalletConnect, Coinbase & more</p>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleWalletConnect}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Connect Wallet
          </button>

          {/* Footer Note */}
          <p className="text-xs text-center text-gray-500">
            By connecting, you agree to GeniePay's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}