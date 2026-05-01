import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import { parseEmployeeFile, generateCSVTemplate } from '@/utils/CsvEmployeeParser';

vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: { sheet_to_json: vi.fn() },
}));

const VALID_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const MOCK_SHEET = {};

/**
 * Configures the XLSX mock to return the given rows as if parsed from a spreadsheet.
 * Column names use natural casing — the parser's normalize() will lowercase and
 * strip spaces/underscores before validation.
 */
function mockXLSX(rows: Record<string, string>[]) {
  vi.mocked(XLSX.read).mockReturnValue({
    Sheets: { Sheet1: MOCK_SHEET },
    SheetNames: ['Sheet1'],
  } as unknown as ReturnType<typeof XLSX.read>);

  vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(rows as unknown as ReturnType<typeof XLSX.utils.sheet_to_json>);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// parseEmployeeFile — happy path
// ---------------------------------------------------------------------------

describe('parseEmployeeFile — valid input', () => {
  it('parses a row with all required fields', () => {
    mockXLSX([{
      Name: 'Alice Smith',
      'Wallet Address': VALID_ADDRESS,
      Role: 'Engineer',
      'Pay Usd': '5000',
    }]);

    const { valid, errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0]).toEqual({
      name: 'Alice Smith',
      walletAddress: VALID_ADDRESS,
      role: 'Engineer',
      payUsd: 5000,
      email: undefined,
      department: undefined,
    });
  });

  it('captures the optional email and department fields', () => {
    mockXLSX([{
      Name: 'Bob Jones',
      'Wallet Address': VALID_ADDRESS,
      Role: 'Designer',
      'Pay Usd': '4000',
      Email: 'bob@example.com',
      Department: 'Product',
    }]);

    const { valid } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(valid[0].email).toBe('bob@example.com');
    expect(valid[0].department).toBe('Product');
  });

  it('parses multiple valid rows in one file', () => {
    mockXLSX([
      { Name: 'Alice', 'Wallet Address': VALID_ADDRESS, Role: 'Dev', 'Pay Usd': '5000' },
      { Name: 'Bob', 'Wallet Address': `0x${'b'.repeat(40)}`, Role: 'Design', 'Pay Usd': '4000' },
    ]);

    const { valid, errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });

  it('normalises column names regardless of casing and separators', () => {
    // "wallet_address" (underscore) and "PAY USD" (uppercase + space) must be accepted
    mockXLSX([{
      name: 'Alice',
      wallet_address: VALID_ADDRESS,
      ROLE: 'Dev',
      'PAY USD': '5000',
    }]);

    const { valid, errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
  });

  it('trims whitespace from cell values', () => {
    mockXLSX([{
      Name: '  Alice  ',
      'Wallet Address': `  ${VALID_ADDRESS}  `,
      Role: '  Engineer  ',
      'Pay Usd': '  5000  ',
    }]);

    const { valid } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(valid[0].name).toBe('Alice');
    expect(valid[0].walletAddress).toBe(VALID_ADDRESS);
  });
});

// ---------------------------------------------------------------------------
// parseEmployeeFile — file-level errors
// ---------------------------------------------------------------------------

describe('parseEmployeeFile — file-level errors', () => {
  it('returns an error (row 0) when the file is empty', () => {
    mockXLSX([]);

    const { valid, errors } = parseEmployeeFile(new ArrayBuffer(0), 'empty.csv');

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(0);
    expect(errors[0].message).toMatch(/empty/i);
  });

  it('returns an error listing the missing columns', () => {
    // Only "name" is present; the rest are absent
    mockXLSX([{ Name: 'Alice' }]);

    const { errors } = parseEmployeeFile(new ArrayBuffer(0), 'partial.csv');

    expect(errors[0].row).toBe(0);
    expect(errors[0].message).toContain('Missing columns');
  });

  it('returns a parse-failure error when XLSX throws', () => {
    vi.mocked(XLSX.read).mockImplementation(() => { throw new Error('Corrupt file'); });

    const { valid, errors } = parseEmployeeFile(new ArrayBuffer(0), 'corrupt.xlsx');

    expect(valid).toHaveLength(0);
    expect(errors[0].message).toContain('Failed to parse "corrupt.xlsx"');
  });
});

// ---------------------------------------------------------------------------
// parseEmployeeFile — row-level errors
// ---------------------------------------------------------------------------

describe('parseEmployeeFile — row-level validation', () => {
  it('rejects a row with a missing name', () => {
    mockXLSX([{ Name: '', 'Wallet Address': VALID_ADDRESS, Role: 'Dev', 'Pay Usd': '5000' }]);

    const { valid, errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(valid).toHaveLength(0);
    expect(errors[0].row).toBe(1);
    expect(errors[0].message).toContain('Missing name');
  });

  it('rejects a row with an invalid wallet address', () => {
    mockXLSX([{ Name: 'Alice', 'Wallet Address': 'not-an-address', Role: 'Dev', 'Pay Usd': '5000' }]);

    const { errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(errors[0].row).toBe(1);
    expect(errors[0].message).toContain('Invalid wallet address');
    expect(errors[0].message).toContain('not-an-address');
  });

  it('rejects a row with a missing role', () => {
    mockXLSX([{ Name: 'Alice', 'Wallet Address': VALID_ADDRESS, Role: '', 'Pay Usd': '5000' }]);

    const { errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(errors[0].row).toBe(1);
    expect(errors[0].message).toContain('Missing role');
  });

  it('rejects a row with a non-numeric payUsd', () => {
    mockXLSX([{ Name: 'Alice', 'Wallet Address': VALID_ADDRESS, Role: 'Dev', 'Pay Usd': 'free' }]);

    const { errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(errors[0].message).toContain('Invalid payUsd');
  });

  it('rejects a row with payUsd of zero', () => {
    mockXLSX([{ Name: 'Alice', 'Wallet Address': VALID_ADDRESS, Role: 'Dev', 'Pay Usd': '0' }]);

    const { errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(errors[0].message).toContain('Invalid payUsd');
  });

  it('rejects a row with a negative payUsd', () => {
    mockXLSX([{ Name: 'Alice', 'Wallet Address': VALID_ADDRESS, Role: 'Dev', 'Pay Usd': '-100' }]);

    const { errors } = parseEmployeeFile(new ArrayBuffer(0), 'test.csv');

    expect(errors[0].message).toContain('Invalid payUsd');
  });

  it('segregates valid and invalid rows correctly in a mixed file', () => {
    mockXLSX([
      { Name: 'Alice', 'Wallet Address': VALID_ADDRESS, Role: 'Dev', 'Pay Usd': '5000' },
      { Name: '', 'Wallet Address': VALID_ADDRESS, Role: 'Dev', 'Pay Usd': '5000' }, // invalid
      { Name: 'Bob', 'Wallet Address': `0x${'b'.repeat(40)}`, Role: 'Design', 'Pay Usd': '4000' },
    ]);

    const { valid, errors } = parseEmployeeFile(new ArrayBuffer(0), 'mixed.csv');

    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(2); // second row (1-indexed)
  });
});

// ---------------------------------------------------------------------------
// generateCSVTemplate
// ---------------------------------------------------------------------------

describe('generateCSVTemplate', () => {
  it('returns a string that contains all required column headers', () => {
    const template = generateCSVTemplate();

    expect(template).toContain('Name');
    expect(template).toContain('WalletAddress');
    expect(template).toContain('Role');
    expect(template).toContain('PayUsd');
  });

  it('includes at least a header row and one sample data row', () => {
    const lines = generateCSVTemplate().trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('returns a non-empty string', () => {
    expect(generateCSVTemplate().length).toBeGreaterThan(0);
  });
});
