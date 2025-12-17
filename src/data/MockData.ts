import type { AccountHistoryTransaction } from "../types/AccountHistoryTransactionModel.ts";
import type { Employee } from "../types/EmployeeModel.ts";

export const mockEmployees: Employee[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Developer',
    department: 'Engineering',
    wallet_address: '0x5Db7DaEFaa39E7e3C14e9dC9e2d2Fdca3127E722',
    avatar_url: null,
    salary: 120000,
    employment_type: 'employee'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    phone: '+1 (555) 987-6543',
    role: 'Product Designer',
    department: 'Design',
    wallet_address: '0x8F2b3C4d5E6f7A8B9C0d1E2f3A4B5C6d7E8f9A0B',
    avatar_url: null,
    salary: 95000,
    employment_type: 'employee'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    phone: '+1 (555) 456-7890',
    role: 'Marketing Specialist',
    department: 'Marketing',
    wallet_address: '0x1A2B3C4D5E6F7890ABCDEF1234567890ABCDEF12',
    avatar_url: null,
    salary: 75000,
    employment_type: 'employee'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    phone: null,
    role: 'Data Analyst',
    department: 'Analytics',
    wallet_address: '0xFEDCBA0987654321ABCDEF1234567890FEDCBA09',
    avatar_url: null,
    salary: 5500,
    employment_type: 'contractor'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Carlos Rodriguez',
    email: 'carlos.r@company.com',
    phone: '+1 (555) 234-5678',
    role: 'DevOps Engineer',
    department: 'Engineering',
    wallet_address: '0x9876543210FEDCBA9876543210FEDCBA98765432',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    salary: 115000,
    employment_type: 'employee'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Lisa Chen',
    email: 'lisa.chen@company.com',
    phone: '+1 (555) 876-5432',
    role: 'UX Researcher',
    department: 'Design',
    wallet_address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    salary: 88000,
    employment_type: 'employee'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Alex Turner',
    email: 'alex.turner@freelance.com',
    phone: '+1 (555) 345-6789',
    role: 'Content Writer',
    department: 'Marketing',
    wallet_address: '0x1111222233334444555566667777888899990000',
    avatar_url: null,
    salary: 4000,
    employment_type: 'contractor'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Rachel Green',
    email: 'rachel.green@company.com',
    phone: '+1 (555) 555-1234',
    role: 'Frontend Developer',
    department: 'Engineering',
    wallet_address: '0x2222333344445555666677778888999900001111',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    salary: 105000,
    employment_type: 'employee'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'James Miller',
    email: 'james.miller@consultant.com',
    phone: null,
    role: 'Security Consultant',
    department: 'Engineering',
    wallet_address: '0x3333444455556666777788889999000011112222',
    avatar_url: null,
    salary: 8000,
    employment_type: 'contractor'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    user_id: '0x1234567890123456789012345678901234567890',
    name: 'Sophia Martinez',
    email: 'sophia.m@company.com',
    phone: '+1 (555) 678-9012',
    role: 'HR Manager',
    department: 'Human Resources',
    wallet_address: '0x4444555566667777888899990000111122223333',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    salary: 92000,
    employment_type: 'employee'
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
  },
  {
    id: 'tx-007',
    date: new Date('2025-08-24T10:15:00Z'),
    recipientName: 'John Doe',
    recipientAddress: '0x5Db7DaEFaa39E7e3C14e9dC9e2d2Fdca3127E722',
    amount: 10000.00,
    token: 'USDC',
    type: 'Payroll',
    status: 'Success',
    txHash: '0xg6789012345678901234567890abcdef123456789012345678901234abcdef',
    gasUsed: '21000',
    companyName: 'GeniePay Demo Corp'
  },
  {
    id: 'tx-008',
    date: new Date('2025-08-24T10:10:00Z'),
    recipientName: 'Sarah Wilson',
    recipientAddress: '0x8F2b3C4d5E6f7A8B9C0d1E2f3A4B5C6d7E8f9A0B',
    amount: 7916.67,
    token: 'USDC',
    type: 'Payroll',
    status: 'Success',
    txHash: '0xh6789012345678901234567890abcdef123456789012345678901234abcdef',
    gasUsed: '21000',
    companyName: 'GeniePay Demo Corp'
  }
];