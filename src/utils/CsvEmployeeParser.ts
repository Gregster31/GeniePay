import ExcelJS from 'exceljs';
import type { Employee } from '@/models/EmployeeModel';
import { isValidEthAddress } from './EthUtils';

export const MAX_CSV_ROWS = 500;

export interface CSVParseResult {
  valid: Omit<Employee, 'id' | 'dateAdded'>[];
  errors: { row: number; message: string }[];
}

export const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls';

const normalize = (s: string) => s.toLowerCase().replace(/[\s_]/g, '');

export const rowsToEmployees = (rows: Record<string, string>[]): CSVParseResult => {
  const valid: CSVParseResult['valid'] = [];
  const errors: CSVParseResult['errors'] = [];

  if (rows.length === 0)
    return { valid, errors: [{ row: 0, message: 'File is empty or missing data rows.' }] };

  if (rows.length > MAX_CSV_ROWS)
    return { valid, errors: [{ row: 0, message: `File exceeds the ${MAX_CSV_ROWS}-row limit (${rows.length} rows found). Split your file and re-import.` }] };

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

// RFC 4180-compliant CSV line parser (handles quoted fields with embedded commas)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
};

export const parseEmployeeFile = async (buffer: ArrayBuffer, fileName: string): Promise<CSVParseResult> => {
  try {
    const ext = fileName.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      // ExcelJS CSV support requires Node.js streams; parse as text in the browser instead
      const text = new TextDecoder().decode(buffer);
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length === 0)
        return { valid: [], errors: [{ row: 0, message: 'File is empty or missing data rows.' }] };

      const headerCols = parseCSVLine(lines[0]).map(h => normalize(h));
      const rawRows = lines.slice(1).map(line => {
        const cols = parseCSVLine(line);
        const obj: Record<string, string> = {};
        headerCols.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
        return obj;
      });
      return rowsToEmployees(rawRows);
    }

    // Excel formats (.xlsx / .xls)
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) return { valid: [], errors: [{ row: 0, message: 'No sheet found.' }] };

    const headers: Record<number, string> = {};
    sheet.getRow(1).eachCell((cell, col) => {
      headers[col] = normalize(String(cell.value ?? ''));
    });

    const rawRows: Record<string, string>[] = [];
    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const obj: Record<string, string> = {};
      row.eachCell((cell, col) => {
        if (headers[col]) obj[headers[col]] = String(cell.value ?? '').trim();
      });
      rawRows.push(obj);
    });

    return rowsToEmployees(rawRows);
  } catch {
    return { valid: [], errors: [{ row: 0, message: `Failed to parse "${fileName}". Make sure it is a valid CSV or Excel file.` }] };
  }
};

// Downloadable template for users
export const generateCSVTemplate = () =>
  `Name,Email,WalletAddress,Role,Department,PayUsd\nGreg Smith,greg@geniepay.com,0xAbc1234567890123456789012345678901234abcd,Developer,Engineering,5000\n`;
