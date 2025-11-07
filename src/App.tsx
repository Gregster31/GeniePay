import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import config from './lib/wagmi'
import { AuthProvider } from './contexts/AuthContext'
import { BalanceProvider } from './contexts/BalanceContext'
import { AppRouter } from '@/router/AppRouter'
import { AuthenticationWrapper } from '@/components/auth/AuthenticationWrapper'

// Required for wagmi hoooks
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Queries become stale after 1m
    },
  },
})

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthProvider>
            <BalanceProvider>
              <AuthenticationWrapper>
                <AppRouter />
              </AuthenticationWrapper>
            </BalanceProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}