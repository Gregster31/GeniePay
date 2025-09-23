import React from 'react'
import { X, Shield, Wallet, AlertCircle } from 'lucide-react'
import { type Address } from 'viem'

interface SignatureRequestModalProps {
  isOpen: boolean
  walletAddress: Address
  chainId: number
  onSign: () => void
  onCancel: () => void
  isLoading: boolean
  error: string | null
}

export const SignatureRequestModal: React.FC<SignatureRequestModalProps> = ({
  isOpen,
  walletAddress,
  chainId,
  onSign,
  onCancel,
  isLoading,
  error
}) => {
  if (!isOpen) return null

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getExplorerUrl = () => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/address',
      11155111: 'https://sepolia.etherscan.io/address',
      137: 'https://polygonscan.com/address',
      10: 'https://optimistic.etherscan.io/address',
      42161: 'https://arbiscan.io/address',
      8453: 'https://basescan.org/address',
    }
    const baseUrl = explorers[chainId] || explorers[1]
    return `${baseUrl}/${walletAddress}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Sign Authentication Message
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Wallet Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Connected Wallet</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-gray-900">
                {formatAddress(walletAddress)}
              </span>
              <a
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View on Explorer
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800">
                  Safe Authentication
                </p>
                <p className="text-sm text-green-700">
                  This signature request will not trigger any blockchain transaction or cost gas fees. 
                  It's only used to verify wallet ownership.
                </p>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800">
                  Session Duration
                </p>
                <p className="text-sm text-blue-700">
                  Your authentication will remain active for 24 hours. 
                  After that, you'll need to sign again to continue using GeniePay.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Authentication Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium 
                     transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSign}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium 
                     transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing...
              </>
            ) : (
              'Sign Message'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}