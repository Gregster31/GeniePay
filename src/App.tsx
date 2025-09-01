import { useAccount } from 'wagmi';
import { WalletConnection } from './components/WalletConnectionComponent';
import { MainLayout } from './components/MainLayout';
import { BalanceProvider } from './contexts/BalanceContext';

function App() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <WalletConnection />;
  }

  return (
    <BalanceProvider>
      <MainLayout />
    </BalanceProvider>
  );
}

export default App;