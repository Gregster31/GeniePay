export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const PUBLIC_ROUTES = ['/', '/about'] as const;

export const PROTECTED_ROUTES = ['/dashboard', '/pay', '/payroll', '/history'] as const;

export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'));
};