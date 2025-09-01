import type { AccountHistoryTransaction } from "../models/AccountHistoryTransactionModel.ts";
import type { Employee } from "../models/EmployeeModel.ts";

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


// Mock transaction data
export const mockTransactions: AccountHistoryTransaction[] = [
  {
    id: 'tx-001',
    date: new Date('2025-08-31T14:30:00Z'),
    recipientName: 'Alice Johnson',
    recipientAddress: '0x742d35Cc6634C0532925a3b8D404B0532925a3b8',
    amount: 2500.00,
    token: 'USDC',
    type: 'Payroll',
    status: 'Success',
    txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef123456789012345678901234',
    gasUsed: '21000',
    companyName: 'GeniePay Demo Corp'
  },
  {
    id: 'tx-002',
    date: new Date('2025-08-31T14:25:00Z'),
    recipientName: 'Bob Smith',
    recipientAddress: '0x8ba1f109551bD432803012645Hac189B739c9BF',
    amount: 3.2,
    token: 'ETH',
    type: 'Payroll',
    status: 'Failed',
    txHash: '0xb2c3d4e5f6789012345678901234567890abcdef123456789012345678901234a',
    companyName: 'GeniePay Demo Corp'
  },
  {
    id: 'tx-003',
    date: new Date('2025-08-30T09:15:00Z'),
    recipientName: 'Carol Davis',
    recipientAddress: '0x9cb2f109551bD432803012645Hac189B739c9CF',
    amount: 500.00,
    token: 'USDC',
    type: 'Bonus',
    status: 'Success',
    txHash: '0xc3d4e5f6789012345678901234567890abcdef123456789012345678901234ab',
    gasUsed: '28500',
    companyName: 'GeniePay Demo Corp'
  },
  {
    id: 'tx-004',
    date: new Date('2025-08-29T16:45:00Z'),
    recipientName: 'External Wallet',
    recipientAddress: '0x1a2b3c4d5e6f789012345678901234567890abcd',
    amount: 1.2,
    token: 'ETH',
    type: 'One-off Pay',
    status: 'Success',
    txHash: '0xd4e5f6789012345678901234567890abcdef123456789012345678901234abc',
    gasUsed: '21000',
    companyName: 'GeniePay Demo Corp'
  },
  {
    id: 'tx-005',
    date: new Date('2025-08-28T11:20:00Z'),
    recipientName: 'David Wilson',
    recipientAddress: '0x2b3c4d5e6f789012345678901234567890abcdef',
    amount: 150.75,
    token: 'USDC',
    type: 'Reimbursement',
    status: 'Failed',
    txHash: '0xe5f6789012345678901234567890abcdef123456789012345678901234abcd',
    companyName: 'GeniePay Demo Corp'
  },
  {
    id: 'tx-006',
    date: new Date('2025-08-25T08:30:00Z'),
    recipientName: 'Emma Brown',
    recipientAddress: '0x3c4d5e6f789012345678901234567890abcdef12',
    amount: 2.8,
    token: 'ETH',
    type: 'Payroll',
    status: 'Success',
    txHash: '0xf6789012345678901234567890abcdef123456789012345678901234abcde',
    gasUsed: '21000',
    companyName: 'GeniePay Demo Corp'
  }
];