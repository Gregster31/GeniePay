import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import config from './lib/wagmi'
import { geniePayDark, geniePayLight } from './lib/rainbowkit-themes'
import { AuthProvider } from '@/contexts/AuthContext'
import { TokenProvider } from '@/contexts/TokenContext'
import { AppRouter } from '@/router/AppRouter'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const queryClient = new QueryClient();

function ThemedRainbowKit({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();
  return (
    <RainbowKitProvider theme={isDark ? geniePayDark : geniePayLight}>
      {children}
    </RainbowKitProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ThemedRainbowKit>
            <AuthProvider>
              <TokenProvider>
                <ErrorBoundary>
                  <AppRouter />
                </ErrorBoundary>
              </TokenProvider>
            </AuthProvider>
          </ThemedRainbowKit>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

export default App;
