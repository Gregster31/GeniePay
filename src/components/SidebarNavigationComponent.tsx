import { Calendar, CreditCard, DollarSign, FileText, HelpCircle, LogOut, Settings, TrendingUp, Users, History } from "lucide-react";
import { useDisconnect } from 'wagmi';

// Sidebar Navigation Component
const Sidebar: React.FC<{ activeTab: string; onTabChange: (tab: string) => void }> = ({ activeTab, onTabChange }) => {
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'action-items', label: 'Action Items', icon: Calendar, badge: '4' },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'pay', label: 'Pay', icon: DollarSign, badge: 'New', badgeColor: 'bg-orange-500' },
    { id: 'payroll', label: 'Payroll', icon: Calendar },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'account-history', label: 'Account History', icon: History },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'deposit', label: 'Deposit', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-bold">GeniePay</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">Crypto Payroll</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      item.badgeColor || 'bg-blue-600'
                    } text-white`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-center mb-4">
          <div className="text-sm text-blue-100 mb-1">WALLET BALANCE</div>
          <div className="text-2xl font-bold text-white">4.78 ETH</div>
          <div className="text-xs text-blue-100 mt-1">≈ $15,847.00</div>
        </div>
        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm w-full">
          <HelpCircle className="w-4 h-4" />
          Support
        </button>
        <button 
          onClick={handleDisconnect} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mt-2 w-full"
          title="Disconnect Wallet">
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
