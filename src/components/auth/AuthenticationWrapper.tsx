import React from 'react'
import { useAuth } from '@/hooks/UseAuth'
import { useAccount } from 'wagmi'
import { SignatureRequestModal } from './SignatureRequestModal'
import { TermsOfServiceModal } from './TermsOfServiceModal'
import { SessionExpiryNotification } from './AuthGuard'

interface AuthenticationWrapperProps {
  children: React.ReactNode
}

/**
 * AuthenticationWrapper handles authentication modals and notifications
 * without interfering with your existing layout structure.
 * 
 * Simply wrap your app content with this component.
 */
export const AuthenticationWrapper: React.FC<AuthenticationWrapperProps> = ({ children }) => {
  const { address, chainId } = useAccount()
  const { 
    authState, 
    error, 
    isLoading,
    requestSignature,
    acceptTerms,
    declineTerms,
    disconnect
  } = useAuth()

  return (
    <>
      {/* Your app content renders normally */}
      {children}
      
      {/* Authentication modals overlay when needed */}
      {address && (
        <>
          <SignatureRequestModal
            isOpen={authState === 'pending_signature'}
            walletAddress={address}
            chainId={chainId || 1}
            onSign={requestSignature}
            onCancel={disconnect}
            isLoading={isLoading}
            error={error}
          />
          
          {/* <TermsOfServiceModal
            isOpen={authState === 'pending_terms'}
            onAccept={acceptTerms}
            onDecline={declineTerms}
            isLoading={isLoading}
          /> */}
        </>
      )}
      
      {/* Session expiry notification */}
      <SessionExpiryNotification />
    </>
  )
}