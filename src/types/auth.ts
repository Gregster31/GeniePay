/**
 * Simple Authentication Types
 * No database, no persistence - just signature verification
 */

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Signature message template
export const createSignatureMessage = (address: string): string => 
  `GeniePay wants you to sign in with your account:\n${address}\n\nClick to sign in and accept the GeniePay Terms of Service.`;

// Route configuration
export const PUBLIC_ROUTES = [
  '/',
] as const;

export const PROTECTED_ROUTES = [
  '/team',
  '/pay',
  '/payroll',
  '/account-history',
  '/documents',
  '/deposit',
  '/settings',
] as const;

export const isPublicRoute = (path: string): boolean => {
  const normalized = path === '/' ? '/' : path.replace(/\/$/, '');
  return PUBLIC_ROUTES.some(route => route === normalized);
};