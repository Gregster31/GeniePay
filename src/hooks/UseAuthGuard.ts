import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';

export interface RouteConfig {
  requiresWallet: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

// Route configuration - centralized and type-safe
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Public routes (no wallet required)
  '/': { requiresWallet: false },
  '/dashboard': { requiresWallet: false },
  '/settings': { requiresWallet: false },
  
  // Protected routes (wallet required)
  '/team': { requiresWallet: true },
  '/pay': { requiresWallet: true },
  '/payroll': { requiresWallet: true },
  '/account-history': { requiresWallet: true },
  '/documents': { requiresWallet: true },
  '/deposit': { requiresWallet: true },
} as const;

export interface AuthGuardResult {
  isAllowed: boolean;
  isLoading: boolean;
  hasWallet: boolean;
  shouldShowConnectWallet: boolean;
  redirectPath?: string;
}

/**
 * Custom hook for handling route-based authentication
 * More efficient than wrapping every route component
 */
export const useAuthGuard = (pathname: string): AuthGuardResult => {
  const { isConnected, isConnecting } = useAccount();
  const { isAuthenticated } = useAuth();
  
  const routeConfig = ROUTE_CONFIG[pathname];
  const hasWallet = isConnected || isAuthenticated;
  const isLoading = isConnecting;
  
  // If route doesn't exist in config, assume it's public
  if (!routeConfig) {
    return {
      isAllowed: true,
      isLoading,
      hasWallet,
      shouldShowConnectWallet: false,
    };
  }
  
  // If route doesn't require wallet, always allow
  if (!routeConfig.requiresWallet) {
    return {
      isAllowed: true,
      isLoading,
      hasWallet,
      shouldShowConnectWallet: false,
    };
  }
  
  // If loading, don't make auth decisions yet
  if (isLoading) {
    return {
      isAllowed: false,
      isLoading: true,
      hasWallet,
      shouldShowConnectWallet: false,
    };
  }
  
  // Route requires wallet but user doesn't have one
  if (!hasWallet) {
    return {
      isAllowed: false,
      isLoading: false,
      hasWallet: false,
      shouldShowConnectWallet: true,
      redirectPath: routeConfig.redirectTo,
    };
  }
  
  // All checks passed
  return {
    isAllowed: true,
    isLoading: false,
    hasWallet: true,
    shouldShowConnectWallet: false,
  };
};

/**
 * Utility function to check if a route requires wallet (for navigation UI)
 */
export const doesRouteRequireWallet = (pathname: string): boolean => {
  return ROUTE_CONFIG[pathname]?.requiresWallet ?? false;
};

/**
 * Get all public routes (for navigation when wallet not connected)
 */
export const getPublicRoutes = (): string[] => {
  return Object.entries(ROUTE_CONFIG)
    .filter(([_, config]) => !config.requiresWallet)
    .map(([path]) => path);
};

/**
 * Get all protected routes (for navigation when wallet connected)
 */
export const getProtectedRoutes = (): string[] => {
  return Object.entries(ROUTE_CONFIG)
    .filter(([_, config]) => config.requiresWallet)
    .map(([path]) => path);
};