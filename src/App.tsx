import React from 'react';
import { useAccount } from 'wagmi';
import { WalletConnection } from './components/WalletConnectionComponent.tsx';
import { MainLayout } from './components/MainLayout.tsx';

const App: React.FC = () => {
  const { isConnected } = useAccount();

  // Show wallet connection if not connected
  if (!isConnected) {
    return <WalletConnection />;
  }

  // Show main app layout when connected
  return <MainLayout />;
};

export default App;