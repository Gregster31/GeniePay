export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Signature message template
export const createSignatureMessage = (address: string): string => 
  `GeniePay wants you to sign in with your account:\n${address}\n\nClick to sign in and accept the GeniePay Terms of Service.`;

export const PUBLIC_ROUTES = [
  '/',
] as const;

export const PROTECTED_ROUTES = [
  '/pay',
  '/payroll',
  '/history',
] as const;

export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'));
};