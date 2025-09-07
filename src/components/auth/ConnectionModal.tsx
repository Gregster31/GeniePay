// components/auth/ConnectionModal.tsx
import React, { useState } from 'react'
import { X, Wallet, Mail, Chrome, ArrowLeft } from 'lucide-react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAuth } from '../../contexts/AuthContext'

interface ConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

type ConnectionStep = 'select' | 'magic-link' | 'connecting'

export const ConnectionModal: React.FC<ConnectionModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [step, setStep] = useState<ConnectionStep>('select')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { signInWithGoogle, signInWithMagicLink } = useAuth()
  const { openConnectModal } = useConnectModal()

  if (!isOpen) return null

  const handleWalletConnect = async () => {
    try {
      // First open RainbowKit to connect wallet
      openConnectModal?.()
      
      // Note: We'll handle the actual Supabase session creation 
      // after wallet is connected in a separate function
      onClose()
    } catch (error) {
      console.error('Wallet connection error:', error)
    }
  }

  const handleGoogleConnect = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
    } catch (error) {
      setMessage('Failed to connect with Google. Please try again.')
      console.error('Google auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsLoading(true)
      setStep('connecting')
      await signInWithMagicLink(email)
      setMessage('Check your email for the magic link!')
    } catch (error) {
      setMessage('Failed to send magic link. Please try again.')
      console.error('Magic link error:', error)
      setStep('magic-link')
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setStep('select')
    setEmail('')
    setMessage('')
    setIsLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {step !== 'select' && (
              <button
                onClick={() => step === 'magic-link' ? setStep('select') : resetModal()}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'select' && 'Connect to GeniePay'}
              {step === 'magic-link' && 'Sign in with Email'}
              {step === 'connecting' && 'Check your email'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {step === 'select' && (
          <div className="space-y-4">
            <p className="text-gray-600 mb-6">
              Choose how you'd like to connect to access your payroll dashboard
            </p>

            {/* Wallet Connection */}
            <button
              onClick={handleWalletConnect}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
              disabled={isLoading}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-700">
                  Connect Wallet
                </h3>
                <p className="text-sm text-gray-500">
                  MetaMask, WalletConnect, and more
                </p>
              </div>
            </button>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleConnect}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all group"
              disabled={isLoading}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Chrome className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900 group-hover:text-red-700">
                  Continue with Google
                </h3>
                <p className="text-sm text-gray-500">
                  Quick and secure authentication
                </p>
              </div>
            </button>

            {/* Magic Link */}
            <button
              onClick={() => setStep('magic-link')}
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
              disabled={isLoading}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-gray-900 group-hover:text-green-700">
                  Email Magic Link
                </h3>
                <p className="text-sm text-gray-500">
                  One-time secure link to your email
                </p>
              </div>
            </button>

            {message && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {message}
              </p>
            )}
          </div>
        )}

        {step === 'magic-link' && (
          <form onSubmit={handleMagicLinkConnect} className="space-y-4">
            <p className="text-gray-600 mb-4">
              Enter your email address and we'll send you a secure link to sign in.
            </p>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>

            {message && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {message}
              </p>
            )}
          </form>
        )}

        {step === 'connecting' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Check your email
              </h3>
              <p className="text-gray-600 text-sm">
                We've sent a secure link to <strong>{email}</strong>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Click the link in the email to complete your sign in.
              </p>
            </div>

            {message && (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                {message}
              </p>
            )}

            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close this window
            </button>
          </div>
        )}
      </div>
    </div>
  )
}