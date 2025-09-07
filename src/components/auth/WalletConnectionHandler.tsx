// components/auth/WalletConnectionHandler.tsx
import React, { useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useAuth } from '../../contexts/AuthContext'
import { Shield, AlertCircle } from 'lucide-react'

interface WalletConnectionHandlerProps {
  children: React.ReactNode
}

export const WalletConnectionHandler: React.FC<WalletConnectionHandlerProps> = ({ 
  children 
}) => {
  const { address, isConnected: isWalletConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { session, signInWithWallet } = useAuth()
  
  const [showWalletConfirm, setShowWalletConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle wallet connection
  useEffect(() => {
    // If wallet just connected and we don't have a session, show confirmation
    if (isWalletConnected && address && !session) {
      console.log('🦊 Wallet connected, showing confirmation modal for:', address)
      setShowWalletConfirm(true)
      setError(null)
    }
    
    // If wallet disconnected, hide confirmation
    if (!isWalletConnected) {
      setShowWalletConfirm(false)
      setError(null)
    }
  }, [isWalletConnected, address, session])

  const handleConfirmWalletConnection = async () => {
    if (!address) {
      setError('No wallet address found')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      
      console.log('✍️ Requesting signature for address:', address)
      
      // Create message to sign
      const timestamp = Date.now()
      const message = `Welcome to GeniePay!

Please sign this message to verify ownership of your wallet.

Wallet: ${address}
Timestamp: ${timestamp}
Network: Ethereum

This signature is only used for authentication and does not permit any transactions.`
      
      console.log('📝 Message to sign:', message)
      
      // Sign the message
      const signature = await signMessageAsync({ message })
      console.log('✅ Message signed successfully')
      
      // Create Supabase session with wallet
      await signInWithWallet(address, signature)
      
      console.log('🎉 Wallet connection completed!')
      setShowWalletConfirm(false)
    } catch (error: any) {
      console.error('❌ Error confirming wallet connection:', error)
      if (error?.message?.includes('User rejected')) {
        setError('Signature cancelled. Please try again to complete connection.')
      } else {
        setError('Failed to connect wallet. Please try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelWalletConnection = () => {
    console.log('❌ User cancelled wallet connection')
    setShowWalletConfirm(false)
    setError(null)
  }

  return (
    <>
      {children}
      
      {/* Wallet Confirmation Modal */}
      {showWalletConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {/* Header with Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Verify Wallet Ownership
                </h2>
                <p className="text-sm text-gray-600">One more step to complete</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              To secure your GeniePay account, please sign a message with your wallet. This proves you own the wallet and creates your session.
            </p>
            
            {/* Wallet Address Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-600 mb-1 font-medium uppercase tracking-wide">Connected Wallet</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {address}
              </p>
            </div>

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <div className="flex gap-2">
                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 font-medium">Safe & Secure</p>
                  <p className="text-xs text-blue-800 mt-1">
                    Signing this message is safe and doesn't allow any transactions. It only verifies you own this wallet address.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelWalletConnection}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWalletConnection}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing...
                  </span>
                ) : (
                  'Sign Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}