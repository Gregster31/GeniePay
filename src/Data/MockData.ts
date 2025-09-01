import type { Employee } from "../models/EmployeeModel.ts";
import type { Transaction } from "../models/TransactionModel.ts";

export const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Developer',
    department: 'Engineering',
    walletAddress: '0x5Db7DaEFaa39E7e3C14e9dC9e2d2Fdca3127E722',
    avatar: null,
    salary: 0.005,
    paymentFrequency: 'Bi-weekly',
    employmentType: 'Full-time',
    status: 'Active',
    joinDate: new Date('2023-01-15'),
    lastPayment: new Date('2024-08-15'),
    totalPaid: 12.5,
    paymentHistory: [
      {
        id: 'tx1',
        date: new Date('2024-08-15'),
        amount: 0.5,
        txHash: '0xabc123...',
        status: 'Completed'
      },
      {
        id: 'tx2',
        date: new Date('2024-08-01'),
        amount: 0.5,
        txHash: '0xdef456...',
        status: 'Completed'
      }
    ]
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    phone: '+1 (555) 987-6543',
    role: 'Product Designer',
    department: 'Design',
    walletAddress: '0x8F2b3C4d5E6f7A8B9C0d1E2f3A4B5C6d7E8f9A0B',
    avatar: null,
    salary: 0.4,
    paymentFrequency: 'Bi-weekly',
    employmentType: 'Full-time',
    status: 'Active',
    joinDate: new Date('2023-03-22'),
    lastPayment: new Date('2024-08-15'),
    totalPaid: 9.6,
    paymentHistory: []
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1 (555) 456-7890',
    role: 'Marketing Specialist',
    department: 'Marketing',
    walletAddress: '0x1A2B3C4D5E6F7890ABCDEF1234567890ABCDEF12',
    avatar: null,
    salary: 0.3,
    paymentFrequency: 'Monthly',
    employmentType: 'Part-time',
    status: 'Active',
    joinDate: new Date('2023-06-10'),
    lastPayment: new Date('2024-08-01'),
    totalPaid: 6.9,
    paymentHistory: []
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    phone: '+1 (555) 321-9876',
    role: 'Data Analyst',
    department: 'Analytics',
    walletAddress: '0xFEDCBA0987654321ABCDEF1234567890FEDCBA09',
    avatar: null,
    salary: 0.35,
    paymentFrequency: 'Bi-weekly',
    employmentType: 'Contract',
    status: 'Inactive',
    joinDate: new Date('2024-01-08'),
    lastPayment: new Date('2024-07-15'),
    totalPaid: 4.2,
    paymentHistory: []
  }
];


// Mock transaction history
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    recipientName: 'John Doe',
    recipientAddress: '0x5Db7DaEFaa39E7e3C14e9dC9e2d2Fdca3127E722',
    amount: 0.5,
    token: 'ETH',
    date: new Date('2024-08-20T10:30:00'),
    status: 'Success',
    txHash: '0xabc123def456789012345678901234567890abcdef123456789012345678901234',
    note: 'Monthly salary payment'
  },
  {
    id: '2',
    recipientName: 'External Wallet',
    recipientAddress: '0x742d35Cc7bF429F4a7c9b7F4E8e6B9e1234567890',
    amount: 0.25,
    token: 'ETH',
    date: new Date('2024-08-19T14:15:00'),
    status: 'Success',
    txHash: '0xdef456abc789012345678901234567890123456def789012345678901234567',
    note: 'Contractor payment'
  },
  {
    id: '3',
    recipientName: 'Sarah Wilson',
    recipientAddress: '0x8F2b3C4d5E6f7A8B9C0d1E2f3A4B5C6d7E8f9A0B',
    amount: 0.3,
    token: 'ETH',
    date: new Date('2024-08-18T09:45:00'),
    status: 'Failed',
    txHash: '0x789012345def456abc789012345678901234567890def456789012345678901',
    note: 'Bonus payment - insufficient gas'
  }
];