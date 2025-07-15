export default interface WalletConnectionProps {
  onConnect: () => void;
  isConnecting?: boolean;
  error?: string;
}