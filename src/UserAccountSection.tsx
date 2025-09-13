// components/auth/UserAccountSection.tsx
import React from 'react'
import { Copy, ExternalLink, User, Wallet, Mail, Chrome } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface UserAccountSectionProps {
  onCopyAddress?: () => void
}

export const UserAccountSection: React.FC<UserAccountSectionProps> = ({ 
  onCopyAddress 
}) => {
  const { 
    profile, 
    walletAddress, 
    connectionType, 
    isConnected 
  } = useAuth()

  if (!isConnected) return null

  const displayAddress = walletAddress || profile?.wallet_address
  const displayName = profile?.display_name || profile?.email || 'Anonymous User'

  const handleCopyAddress = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress)
      onCopyAddress?.()
    }
  }

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'wallet':
        return <Wallet className="w-4 h-4 text-blue-600" />
      case 'google':
        return <Chrome className="w-4 h-4 text-red-600" />
      case 'magic_link':
        return <Mail className="w-4 h-4 text-green-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getConnectionLabel = () => {
    switch (connectionType) {
      case 'wallet':
        return 'Wallet Connected'
      case 'google':
        return 'Google Account'
      case 'magic_link':
        return 'Email Account'
      default:
        return 'Connected'
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50/50">
      {/* User Info */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* User Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getConnectionIcon()}
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {getConnectionLabel()}
            </span>
          </div>
          
          <h3 className="font-medium text-gray-900 truncate text-sm">
            {displayName}
          </h3>
          
          {profile?.email && connectionType !== 'magic_link' && (
            <p className="text-xs text-gray-500 truncate">
              {profile.email}
            </p>
          )}
        </div>
      </div>

      {/* Wallet Address (if available) */}
      {displayAddress && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-1">
                Wallet Address
              </p>
              <p className="text-sm font-mono text-gray-900 truncate">
                {shortenAddress(displayAddress)}
              </p>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Copy Button */}
              <button
                onClick={handleCopyAddress}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Copy address"
              >
                <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
              </button>
              
              {/* Explorer Link */}
              <button
                onClick={() => window.open(`https://etherscan.io/address/${displayAddress}`, '_blank')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
          <p className="font-medium text-gray-900">
            {profile?.created_at ? 
              new Date(profile.created_at).toLocaleDateString() : 
              'Today'
            }
          </p>
          <p className="text-gray-500">Member since</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
          <p className="font-medium text-gray-900">
            {connectionType === 'wallet' ? 'Web3' : 'Web2'}
          </p>
          <p className="text-gray-500">Auth type</p>
        </div>
      </div>
    </div>
  )
}