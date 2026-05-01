import { describe, it, expect } from 'vitest';
import { rowsToEmployees, parseEmployeeFile, generateCSVTemplate } from '@/utils/CsvEmployeeParser';

const VALID_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

/**
 * Build a pre-normalised row (keys already lowercased, spaces/underscores stripped)
 * as rowsToEmployees expects them after the file-parsing stage.
 */
function row(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    name: 'Alice Smith',
    walletaddress: VALID_ADDRESS,
    role: 'Engineer',
    payusd: '5000',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// rowsToEmployees — happy path
// ---------------------------------------------------------------------------

describe('rowsToEmployees — valid input', () => {
  it('parses a row with all required fields', () => {
    const { valid, errors } = rowsToEmployees([row()]);

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
    const { valid } = rowsToEmployees([row({ email: 'bob@example.com', department: 'Product' })]);

    expect(valid[0].email).toBe('bob@example.com');
    expect(valid[0].department).toBe('Product');
  });

  it('parses multiple valid rows in one file', () => {
    const { valid, errors } = rowsToEmployees([
      row({ name: 'Alice', walletaddress: VALID_ADDRESS }),
      row({ name: 'Bob',   walletaddress: `0x${'b'.repeat(40)}`, payusd: '4000' }),
    ]);

    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// rowsToEmployees — file-level errors
// ---------------------------------------------------------------------------

describe('rowsToEmployees — file-level errors', () => {
  it('returns an error (row 0) when given an empty array', () => {
    const { valid, errors } = rowsToEmployees([]);

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(0);
    expect(errors[0].message).toMatch(/empty/i);
  });

  it('returns an error listing the missing columns', () => {
    const { errors } = rowsToEmployees([{ name: 'Alice' }]);

    expect(errors[0].row).toBe(0);
    expect(errors[0].message).toContain('Missing columns');
  });

  it('rejects files that exceed MAX_CSV_ROWS', () => {
    const rows = Array.from({ length: 501 }, (_, i) =>
      row({ name: `Person ${i}`, walletaddress: `0x${'a'.repeat(40)}` })
    );
    const { valid, errors } = rowsToEmployees(rows);

    expect(valid).toHaveLength(0);
    expect(errors[0].row).toBe(0);
    expect(errors[0].message).toMatch(/500/);
  });
});

// ---------------------------------------------------------------------------
// rowsToEmployees — row-level validation
// ---------------------------------------------------------------------------

describe('rowsToEmployees — row-level validation', () => {
  it('rejects a row with a missing name', () => {
    const { valid, errors } = rowsToEmployees([row({ name: '' })]);

    expect(valid).toHaveLength(0);
    expect(errors[0].row).toBe(1);
    expect(errors[0].message).toContain('Missing name');
  });

  it('rejects a row with an invalid wallet address', () => {
    const { errors } = rowsToEmployees([row({ walletaddress: 'not-an-address' })]);

    expect(errors[0].row).toBe(1);
    expect(errors[0].message).toContain('Invalid wallet address');
    expect(errors[0].message).toContain('not-an-address');
  });

  it('rejects a row with a missing role', () => {
    const { errors } = rowsToEmployees([row({ role: '' })]);

    expect(errors[0].row).toBe(1);
    expect(errors[0].message).toContain('Missing role');
  });

  it('rejects a row with a non-numeric payUsd', () => {
    const { errors } = rowsToEmployees([row({ payusd: 'free' })]);

    expect(errors[0].message).toContain('Invalid payUsd');
  });

  it('rejects a row with payUsd of zero', () => {
    const { errors } = rowsToEmployees([row({ payusd: '0' })]);

    expect(errors[0].message).toContain('Invalid payUsd');
  });

  it('rejects a row with a negative payUsd', () => {
    const { errors } = rowsToEmployees([row({ payusd: '-100' })]);

    expect(errors[0].message).toContain('Invalid payUsd');
  });

  it('segregates valid and invalid rows correctly in a mixed file', () => {
    const { valid, errors } = rowsToEmployees([
      row({ name: 'Alice' }),
      row({ name: '' }),                                     // invalid — row 2
      row({ name: 'Bob', walletaddress: `0x${'b'.repeat(40)}` }),
    ]);

    expect(valid).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// parseEmployeeFile — CSV smoke tests (real buffers, no mocking)
// ---------------------------------------------------------------------------

describe('parseEmployeeFile — CSV parsing', () => {
  const encode = (text: string) => new TextEncoder().encode(text).buffer;

  it('parses a well-formed CSV into valid employees', async () => {
    const csv = `Name,WalletAddress,Role,PayUsd\nAlice,${VALID_ADDRESS},Dev,5000`;
    const { valid, errors } = await parseEmployeeFile(encode(csv), 'staff.csv');

    expect(errors).toHaveLength(0);
    expect(valid[0].name).toBe('Alice');
    expect(valid[0].payUsd).toBe(5000);
  });

  it('returns a parse-failure error for a corrupt xlsx buffer', async () => {
    const { valid, errors } = await parseEmployeeFile(encode('not excel'), 'corrupt.xlsx');

    expect(valid).toHaveLength(0);
    expect(errors[0].message).toContain('Failed to parse "corrupt.xlsx"');
  });

  it('handles quoted CSV fields that contain commas', async () => {
    const csv = `Name,WalletAddress,Role,PayUsd\n"Smith, Alice",${VALID_ADDRESS},Dev,5000`;
    const { valid } = await parseEmployeeFile(encode(csv), 'quoted.csv');

    expect(valid[0].name).toBe('Smith, Alice');
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
