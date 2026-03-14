import * as XLSX from 'xlsx';
import type { Employee } from '@/models/EmployeeModel';
import { isValidEthAddress } from './EthUtils';

export interface CSVParseResult {
  valid: Omit<Employee, 'id' | 'dateAdded'>[];
  errors: { row: number; message: string }[];
}

export const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls';

const normalize = (s: string) => s.toLowerCase().replace(/[\s_]/g, '');

const rowsToEmployees = (rows: Record<string, string>[]): CSVParseResult => {
  const valid: CSVParseResult['valid'] = [];
  const errors: CSVParseResult['errors'] = [];

  if (rows.length === 0)
    return { valid, errors: [{ row: 0, message: 'File is empty or missing data rows.' }] };

  const required = ['name', 'walletaddress', 'role', 'payusd'];
  const missing = required.filter(r => !(r in rows[0]));
  if (missing.length)
    return { valid, errors: [{ row: 0, message: `Missing columns: ${missing.join(', ')}` }] };

  rows.forEach((row, i) => {
    const rowNum = i + 1;

    if (!row['name'])
      { errors.push({ row: rowNum, message: 'Missing name' }); return; }
    if (!isValidEthAddress(row['walletaddress']))
      { errors.push({ row: rowNum, message: `Invalid wallet address: "${row['walletaddress']}"` }); return; }
    if (!row['role'])
      { errors.push({ row: rowNum, message: 'Missing role' }); return; }

    const payUsd = parseFloat(row['payusd']);
    if (isNaN(payUsd) || payUsd <= 0)
      { errors.push({ row: rowNum, message: `Invalid payUsd: "${row['payusd']}"` }); return; }

    valid.push({
      name: row['name'],
      walletAddress: row['walletaddress'],
      role: row['role'],
      payUsd,
      email: row['email'] || undefined,
      department: row['department'] || undefined,
    });
  });

  return { valid, errors };
};

export const parseEmployeeFile = (buffer: ArrayBuffer, fileName: string): CSVParseResult => {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false, defval: '' });

    const rows = rawRows.map((row: { [s: string]: unknown; } | ArrayLike<unknown>) =>
      Object.fromEntries(Object.entries(row).map(([k, v]) => [normalize(k), v.trim()]))
    );

    return rowsToEmployees(rows);
  } catch {
    return { valid: [], errors: [{ row: 0, message: `Failed to parse "${fileName}". Make sure it is a valid CSV or Excel file.` }] };
  }
};

// Downloadable template for users
export const generateCSVTemplate = () =>
  `Name,Email,WalletAddress,Role,Department,PayUsd\nGreg Smith,greg@geniepay.com,0xAbc1234567890123456789012345678901234abcd,Developer,Engineering,5000\n`;