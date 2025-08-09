import { LogOut, User } from "lucide-react";

// Header Component
const Header: React.FC<{ 
  title: string; 
  actions?: React.ReactNode; 
  walletAddress: string;
  onDisconnect: () => void;
}> = ({ title, actions, walletAddress, onDisconnect }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{formatAddress(walletAddress)}</span>
            </div>
            <button
              onClick={onDisconnect}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
