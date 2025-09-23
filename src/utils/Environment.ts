export const isProduction = import.meta.env.VITE_ENV === 'PRODUCTION';

export const config = {
  isProduction,
  chainId: isProduction ? 1 : 11155111, // 1 for mainnet, 11155111 for Sepolia
};

interface EnvironmentConfig {
  supabase: {
    url: string
    anonKey: string
  }
  walletConnect: {
    projectId: string
  }
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }
  auth: {
    signatureValidityMinutes: number
    sessionDurationHours: number
    termsVersion: string
    requireScrollToAcceptTerms: boolean
  }
  blockchain: {
    defaultChainId: number
    supportedChainIds: number[]
  }
  features: {
    enhancedAuth: boolean
    sessionPersistence: boolean
    biometricAuth: boolean
  }
  api: {
    baseUrl: string
    timeout: number
  }
}

// Validate and parse environment variables
function validateEnvironment(): EnvironmentConfig {
  const missing: string[] = []
  
  const get = (key: string, required = true): string => {
    const value = import.meta.env[key]
    if (required && !value) {
      missing.push(key)
    }
    return value || ''
  }

  const config: EnvironmentConfig = {
    supabase: {
      url: get('VITE_SUPABASE_URL'),
      anonKey: get('VITE_SUPABASE_ANON_KEY'),
    },
    walletConnect: {
      projectId: get('VITE_WALLET_CONNECT_PROJECT_ID'),
    },
    app: {
      name: get('VITE_APP_NAME', false) || 'GeniePay',
      version: get('VITE_APP_VERSION', false) || '2.0.0',
      environment: (get('VITE_APP_ENVIRONMENT', false) || 'development') as any,
    },
    auth: {
      signatureValidityMinutes: parseInt(get('VITE_SIGNATURE_VALIDITY_MINUTES', false) || '15'),
      sessionDurationHours: parseInt(get('VITE_SESSION_DURATION_HOURS', false) || '24'),
      termsVersion: get('VITE_TERMS_VERSION', false) || '1.0.0',
      requireScrollToAcceptTerms: get('VITE_TERMS_REQUIRE_SCROLL', false) !== 'false',
    },
    blockchain: {
      defaultChainId: parseInt(get('VITE_DEFAULT_CHAIN_ID', false) || '11155111'),
      supportedChainIds: (get('VITE_SUPPORTED_CHAINS', false) || '1,11155111')
        .split(',')
        .map(id => parseInt(id.trim())),
    },
    features: {
      enhancedAuth: get('VITE_ENABLE_ENHANCED_AUTH', false) !== 'false',
      sessionPersistence: get('VITE_ENABLE_SESSION_PERSISTENCE', false) === 'true',
      biometricAuth: get('VITE_ENABLE_BIOMETRIC_AUTH', false) === 'true',
    },
    api: {
      baseUrl: get('VITE_API_BASE_URL', false) || 'http://localhost:3000',
      timeout: parseInt(get('VITE_API_TIMEOUT', false) || '10000'),
    },
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return config
}

export const env = validateEnvironment()

// Export individual configs for convenience
export const supabaseConfig = env.supabase
export const walletConnectConfig = env.walletConnect
export const appConfig = env.app
export const authConfig = env.auth
export const blockchainConfig = env.blockchain
export const featureFlags = env.features
export const apiConfig = env.api