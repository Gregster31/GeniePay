export interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  walletAddress: string;
  avatar?: string | null;
  salary: number;
  paymentFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  status: 'Active' | 'Inactive' | 'Terminated';
  joinDate: Date;
  lastPayment?: Date;
  totalPaid?: number;
  paymentHistory?: PaymentRecord[];
}

interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  txHash: string;
  status: 'Completed' | 'Pending' | 'Failed';
}