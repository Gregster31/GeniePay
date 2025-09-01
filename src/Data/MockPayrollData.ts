// mockPayrollData.ts
import type { Employee } from '../models/EmployeeModel';

export interface PayrollEmployee extends Employee {
  taxRate: number;
  deductionsAmount: number;
  netPay: number;
  payrollStatus: 'pending' | 'processing' | 'success' | 'failed';
}

export interface PayrollRun {
  id: string;
  date: Date;
  employeesCount: number;
  totalGrossAmount: number;
  totalNetAmount: number;
  totalTaxDeducted: number;
  status: 'completed' | 'failed' | 'partial';
  currency: string;
  batchTxHash?: string;
  gasUsed?: string;
  invoiceUrl?: string;
  reportUrl?: string;
}

export interface PayrollSchedule {
  id: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  nextRunDate: Date;
  isActive: boolean;
  employeeIds: number[];
  createdAt: Date;
}

// Mock payroll employees with tax/deduction calculations
export const mockPayrollEmployees: PayrollEmployee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Developer',
    department: 'Engineering',
    walletAddress: '0x5Db7DaEFaa39E7e3C14e9dC9e2d2Fdca3127E722',
    avatar: null,
    salary: 2500.00, // Monthly salary in USDC
    paymentFrequency: 'Monthly',
    employmentType: 'Full-time',
    status: 'Active',
    joinDate: new Date('2023-01-15'),
    lastPayment: new Date('2024-08-15'),
    totalPaid: 30000,
    paymentHistory: [],
    taxRate: 0.22, // 22% tax
    deductionsAmount: 150.00, // Health insurance, etc.
    netPay: 2100.00, // After tax and deductions
    payrollStatus: 'pending'
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
    salary: 2200.00,
    paymentFrequency: 'Monthly',
    employmentType: 'Full-time',
    status: 'Active',
    joinDate: new Date('2023-03-22'),
    lastPayment: new Date('2024-08-15'),
    totalPaid: 26400,
    paymentHistory: [],
    taxRate: 0.20,
    deductionsAmount: 120.00,
    netPay: 1840.00,
    payrollStatus: 'pending'
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
    salary: 1800.00,
    paymentFrequency: 'Monthly',
    employmentType: 'Part-time',
    status: 'Active',
    joinDate: new Date('2023-06-10'),
    lastPayment: new Date('2024-08-01'),
    totalPaid: 18000,
    paymentHistory: [],
    taxRate: 0.18,
    deductionsAmount: 50.00,
    netPay: 1526.00,
    payrollStatus: 'pending'
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
    salary: 2800.00,
    paymentFrequency: 'Monthly',
    employmentType: 'Contract',
    status: 'Active',
    joinDate: new Date('2024-01-08'),
    lastPayment: new Date('2024-07-15'),
    totalPaid: 22400,
    paymentHistory: [],
    taxRate: 0.25,
    deductionsAmount: 0.00, // Contractors handle their own
    netPay: 2100.00,
    payrollStatus: 'pending'
  },
  {
    id: 5,
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    phone: '+1 (555) 789-0123',
    role: 'DevOps Engineer',
    department: 'Engineering',
    walletAddress: '0x9876543210ABCDEF1234567890ABCDEF98765432',
    avatar: null,
    salary: 2400.00,
    paymentFrequency: 'Monthly',
    employmentType: 'Full-time',
    status: 'Active',
    joinDate: new Date('2023-09-01'),
    lastPayment: new Date('2024-08-15'),
    totalPaid: 24000,
    paymentHistory: [],
    taxRate: 0.22,
    deductionsAmount: 180.00,
    netPay: 1992.00,
    payrollStatus: 'pending'
  },
  {
    id: 6,
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@company.com',
    phone: '+1 (555) 654-3210',
    role: 'HR Manager',
    department: 'Human Resources',
    walletAddress: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    avatar: null,
    salary: 2600.00,
    paymentFrequency: 'Monthly',
    employmentType: 'Full-time',
    status: 'Active',
    joinDate: new Date('2022-11-15'),
    lastPayment: new Date('2024-08-15'),
    totalPaid: 46800,
    paymentHistory: [],
    taxRate: 0.24,
    deductionsAmount: 200.00,
    netPay: 1976.00,
    payrollStatus: 'pending'
  }
];

// Mock payroll run history
export const mockPayrollRuns: PayrollRun[] = [
  {
    id: 'pr-2024-08',
    date: new Date('2024-08-15T10:00:00Z'),
    employeesCount: 6,
    totalGrossAmount: 14300.00,
    totalNetAmount: 11535.00,
    totalTaxDeducted: 2765.00,
    status: 'completed',
    currency: 'USDC',
    batchTxHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef123456789012345678901234',
    gasUsed: '125000',
    invoiceUrl: '#invoice-2024-08',
    reportUrl: '#report-2024-08'
  },
  {
    id: 'pr-2024-07',
    date: new Date('2024-07-15T10:00:00Z'),
    employeesCount: 5,
    totalGrossAmount: 12500.00,
    totalNetAmount: 10100.00,
    totalTaxDeducted: 2400.00,
    status: 'completed',
    currency: 'USDC',
    batchTxHash: '0xb2c3d4e5f6789012345678901234567890abcdef123456789012345678901234a',
    gasUsed: '105000',
    invoiceUrl: '#invoice-2024-07',
    reportUrl: '#report-2024-07'
  },
  {
    id: 'pr-2024-06',
    date: new Date('2024-06-15T10:00:00Z'),
    employeesCount: 4,
    totalGrossAmount: 9600.00,
    totalNetAmount: 7680.00,
    totalTaxDeducted: 1920.00,
    status: 'failed',
    currency: 'USDC',
    invoiceUrl: '#invoice-2024-06',
    reportUrl: '#report-2024-06'
  },
  {
    id: 'pr-2024-05',
    date: new Date('2024-05-15T10:00:00Z'),
    employeesCount: 6,
    totalGrossAmount: 14300.00,
    totalNetAmount: 11535.00,
    totalTaxDeducted: 2765.00,
    status: 'partial',
    currency: 'USDC',
    batchTxHash: '0xc3d4e5f6789012345678901234567890abcdef123456789012345678901234ab',
    gasUsed: '87000',
    invoiceUrl: '#invoice-2024-05',
    reportUrl: '#report-2024-05'
  }
];

// Mock payroll schedules
export const mockPayrollSchedules: PayrollSchedule[] = [
  {
    id: 'schedule-monthly',
    frequency: 'monthly',
    nextRunDate: new Date('2025-09-15T10:00:00Z'),
    isActive: true,
    employeeIds: [1, 2, 3, 4, 5, 6],
    createdAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 'schedule-contractors',
    frequency: 'bi-weekly',
    nextRunDate: new Date('2025-09-07T10:00:00Z'),
    isActive: false,
    employeeIds: [4],
    createdAt: new Date('2024-06-01T00:00:00Z')
  }
];

// Available currencies for payroll
export const availableCurrencies = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xa0b86a33e6776454dc73d16b4' },
  { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x6b175474e89094c44da98b954' },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: 'native' },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xdac17f958d2ee523a2206206994' }
];