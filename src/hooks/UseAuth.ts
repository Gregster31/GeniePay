import { AuthContext } from '@/contexts/AuthContext'
import { useContext } from 'react'

/**
 * Hook to access authentication state and methods
 * Must be used within an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}