import { type Address } from 'viem'

/**
 * Generate a cryptographically secure nonce for signature requests
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create the signature message for wallet authentication
 */
export function createSignatureMessage(
  walletAddress: Address,
  nonce: string,
  timestamp: number = Date.now()
): string {
  return `Welcome to GeniePay!

This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will reset after 24 hours.

Wallet address: ${walletAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}`
}

/**
 * Normalize wallet address to lowercase for consistent storage
 */
export function normalizeWalletAddress(address: string): string {
  return address.toLowerCase()
}

/**
 * Check if session is expired (24 hour expiry)
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt
}

/**
 * Calculate session expiry timestamp (24 hours from now)
 */
export function getSessionExpiry(): number {
  return Date.now() + (24 * 60 * 60 * 1000) // 24 hours
}

/**
 * Check if signature is within valid timeframe (15 minutes)
 */
export function isSignatureExpired(timestamp: number): boolean {
  const maxAge = 15 * 60 * 1000 // 15 minutes
  return Date.now() - timestamp > maxAge
}

/**
 * Terms of Service configuration
 */
export const TERMS_CONFIG = {
  version: '1.0.0',
  lastUpdated: '2025-01-01',
  requireScrollToBottom: true,
} as const