// components/auth/WalletConnectionHandler.tsx
import React, { useEffect, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useAuth } from '../../contexts/AuthContext'

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
      const message = `Sign this message to connect your wallet to GeniePay.

Address: ${address}
Timestamp: ${timestamp}

This signature proves you own this wallet address.`
      
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
        setError('Signature was rejected. Please try again.')
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
    // Optionally disconnect wallet here if you want
  }

  return (
    <>
      {children}
      
      {/* Wallet Confirmation Modal */}
      {showWalletConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Complete Wallet Connection
            </h2>
            
            <p className="text-gray-600 mb-4">
              Your wallet is connected. To complete the sign-in process, please sign a message to verify ownership of this wallet address.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Wallet Address:</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {address}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Why sign a message?</strong><br />
                This proves you own the wallet address and creates your secure GeniePay account.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelWalletConnection}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWalletConnection}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
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