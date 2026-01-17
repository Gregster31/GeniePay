import type { Employee } from '@/models/EmployeeModel';

export const mockEmployees: Employee[] = [
  {
    id: 1,
    name: 'MetaMask Testing',
    walletAddress: '0x5Db7DaEFaa39E7e3C14e9dC9e2d2Fdca3127E722',
    role: 'Senior Developer',
    payUsd: 0.1,
    dateAdded: new Date('2024-01-15'),
    email: 'meta.test@genie.com',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'Coinbase Testing',
    walletAddress: '0xa5c8117B2B6E8506203036cCdfC9d3C90b301D26',
    role: 'Product Designer',
    payUsd: 0.1,
    dateAdded: new Date('2024-02-20'),
    email: 'base.test@genie.com',
    department: 'Design',
  },
];