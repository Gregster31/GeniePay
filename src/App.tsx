import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import config from './lib/wagmi'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppRouter } from '@/router/AppRouter'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

const queryClient = new QueryClient();

// ── Dark theme ───────────────────────────────────────────────────────────────
const _dark = darkTheme({
  accentColor: '#5D00F2',
  accentColorForeground: 'white',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

const geniePayDark = {
  ..._dark,
  colors: {
    ..._dark.colors,
    modalBackground:      '#0d0d14',
    modalBorder:          'rgba(93,0,242,0.22)',
    generalBorder:        'rgba(255,255,255,0.08)',
    generalBorderDim:     'rgba(255,255,255,0.04)',
    menuItemBackground:   'rgba(93,0,242,0.08)',
    connectionIndicator:  '#23DDC6',
    closeButtonBackground:'rgba(255,255,255,0.06)',
    selectedOptionBorder: 'rgba(93,0,242,0.5)',
    profileForeground:    '#100d1e',
    profileAction:        'rgba(255,255,255,0.04)',
    profileActionHover:   'rgba(93,0,242,0.15)',
    modalText:            '#ffffff',
    modalTextSecondary:   'rgba(255,255,255,0.55)',
    modalTextDim:         'rgba(255,255,255,0.3)',
  },
  shadows: {
    ..._dark.shadows,
    dialog:         '0 40px 120px rgba(93,0,242,0.30), 0 0 0 1px rgba(93,0,242,0.12)',
    selectedWallet: '0 4px 20px rgba(93,0,242,0.25)',
    selectedOption: '0 4px 20px rgba(93,0,242,0.25)',
  },
};

// ── Light theme ──────────────────────────────────────────────────────────────
const _light = lightTheme({
  accentColor: '#5D00F2',
  accentColorForeground: 'white',
  borderRadius: 'large',
  fontStack: 'system',
  overlayBlur: 'small',
});

const geniePayLight = {
  ..._light,
  colors: {
    ..._light.colors,
    modalBackground:      '#FCFAFF',
    modalBorder:          'rgba(93,0,242,0.15)',
    generalBorder:        'rgba(93,0,242,0.12)',
    generalBorderDim:     'rgba(93,0,242,0.06)',
    menuItemBackground:   'rgba(93,0,242,0.05)',
    connectionIndicator:  '#0A8B7D',
    selectedOptionBorder: 'rgba(93,0,242,0.4)',
    profileForeground:    '#F5F0FA',
    profileAction:        'rgba(93,0,242,0.06)',
    profileActionHover:   'rgba(93,0,242,0.12)',
  },
  shadows: {
    ..._light.shadows,
    dialog:         '0 20px 80px rgba(93,0,242,0.15), 0 0 0 1px rgba(93,0,242,0.08)',
    selectedWallet: '0 4px 20px rgba(93,0,242,0.12)',
    selectedOption: '0 4px 20px rgba(93,0,242,0.12)',
  },
};

// ── Wrapper that reads app theme and feeds it to RainbowKit ──────────────────
function ThemedRainbowKit({ children }: { children: React.ReactNode }) {
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
              <AppRouter />
            </AuthProvider>
          </ThemedRainbowKit>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

export default App;
