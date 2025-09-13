import React from 'react'
import { Wallet, Shield, CheckCircle } from 'lucide-react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Modal } from '@/components/ui/Modal'

export const ConnectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { openConnectModal } = useConnectModal()

  const handleWalletConnect = () => {
    // Open RainbowKit modal for wallet connection
    openConnectModal?.()
    // Close this modal as RainbowKit will handle the connection UI
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect to GeniePay"
      maxWidth="max-w-md"
    >
      <div className="p-6 space-y-6">
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
              <p className="text-xs text-gray-600">Your keys, your funds, your control</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Global Payments</p>
              <p className="text-xs text-gray-600">Pay employees worldwide in crypto</p>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleWalletConnect}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Connect Wallet
        </button>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </Modal>
  )
}