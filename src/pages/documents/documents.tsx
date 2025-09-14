import { PlaceholderPage } from "@/components/shared";
import { FileText } from "lucide-react";

const Documents: React.FC = () => {
  return (
    <PlaceholderPage
      title="Documents"
      description="Store and manage payroll documents on IPFS"
      icon={<FileText className="w-8 h-8 text-gray-400" />}
    />
  );
};

export default Documents;