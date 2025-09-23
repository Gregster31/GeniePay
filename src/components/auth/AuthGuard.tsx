import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useAuth } from '@/hooks/UseAuth'
import { SignatureRequestModal } from './SignatureRequestModal'
import { TermsOfServiceModal } from './TermsOfServiceModal'
import { Wallet, Shield, FileText, AlertCircle, CheckCircle } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const location = useLocation()
  const { isConnected, address, chainId } = useAccount()
  const { 
    authState, 
    isAuthenticated, 
    error, 
    isLoading,
    requestSignature,
    acceptTerms,
    declineTerms,
    disconnect
  } = useAuth()

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>
  }

  // If wallet is not connected, show connection UI
  if (!isConnected || !address) {
    return <WalletConnectionScreen />
  }

  // If authenticated, render children
  if (isAuthenticated && authState === 'authenticated') {
    return <>{children}</>
  }

  // Handle different authentication states
  switch (authState) {
    case 'pending_signature':
      return (
        <>
          <AuthenticationLoadingScreen 
            title="Signature Required"
            description="Please sign the authentication message in your wallet"
            icon={Shield}
          />
          <SignatureRequestModal
            isOpen={true}
            walletAddress={address}
            chainId={chainId || 1}
            onSign={requestSignature}
            onCancel={disconnect}
            isLoading={isLoading}
            error={error}
          />
        </>
      )

    case 'pending_terms':
      return (
        <>
          <AuthenticationLoadingScreen 
            title="Terms of Service"
            description="Please review and accept the terms to continue"
            icon={FileText}
          />
          <TermsOfServiceModal
            isOpen={true}
            onAccept={acceptTerms}
            onDecline={declineTerms}
            isLoading={isLoading}
          />
        </>
      )

    case 'disconnected':
    default:
      // Redirect to home or show connection screen
      if (location.pathname !== '/') {
        return <Navigate to="/" replace />
      }
      return <WalletConnectionScreen />
  }
}

// Wallet connection screen component
const WalletConnectionScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo/Icon */}
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to access GeniePay's crypto payroll platform
          </p>

          {/* Connect Button */}
          <div className="mb-6">
            <ConnectButton />
          </div>

          {/* Features */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No account required</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Entirely free to use</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure wallet authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Authentication loading screen component
interface AuthenticationLoadingScreenProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const AuthenticationLoadingScreen: React.FC<AuthenticationLoadingScreenProps> = ({
  title,
  description,
  icon: Icon
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-blue-600" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600 mb-8">
            {description}
          </p>

          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Processing...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Session expiry notification component
export const SessionExpiryNotification: React.FC = () => {
  const { authState, error, refreshSession } = useAuth()
  
  if (authState !== 'authenticated' || !error?.includes('expired')) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-amber-800">Session Expired</h3>
          <p className="text-sm text-amber-700 mt-1">
            Your session has expired. Please sign in again to continue.
          </p>
          <button
            onClick={refreshSession}
            className="text-sm font-medium text-amber-800 hover:text-amber-900 mt-2"
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  )
}