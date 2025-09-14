import PlaceholderPage from "@/components/shared/PlaceholderComponent";
import { CreditCard } from "lucide-react";

const Deposit: React.FC = () => {
  return (
    <PlaceholderPage
      title="Deposit Funds"
      description="Add cryptocurrency to your payroll account"
      icon={<CreditCard className="w-8 h-8 text-gray-400" />}
    />
  );
};

export default Deposit;