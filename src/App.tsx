import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import config from '../wagmi-config' // Your wagmi config
import { AuthProvider } from './contexts/AuthContext'
import { MainLayout } from './components/MainLayout' // Your existing layout
import { BalanceProvider } from './contexts/BalanceContext' // Your existing balance context

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
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
              <MainLayout />
            </BalanceProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}