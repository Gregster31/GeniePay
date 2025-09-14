import { PlaceholderPage } from "@/components/shared";
import { Settings } from "lucide-react";

const SettingsPage: React.FC = () => {
  return (
    <PlaceholderPage
      title="Settings"
      description="Configure your blockchain payroll preferences"
      icon={<Settings className="w-8 h-8 text-gray-400" />}
    />
  );
};

export default SettingsPage;