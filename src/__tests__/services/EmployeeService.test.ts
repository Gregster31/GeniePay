import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Supabase mock
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase', () => {
  const auth = {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
  return { supabase: { auth, from: vi.fn() } };
});

import { supabase } from '@/lib/supabase';
import {
  signInWithWallet,
  signOutWallet,
  fetchEmployees,
  insertEmployee,
  updateEmployee,
  deleteEmployee,
} from '@/services/EmployeeService';
import type { Employee } from '@/models/EmployeeModel';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a Supabase query-builder mock where every chained method returns the
 * same thenable object so that `await supabase.from(...).select().eq()...`
 * resolves to `resolved`.
 */
function makeChain(resolved: { data: unknown; error: { message: string } | null }) {
  const promise = Promise.resolve(resolved);
  const chain: Record<string, unknown> = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single']) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  return chain;
}

const USER_ID = 'user-abc-123';
const VALID_ADDRESS = `0x${'a'.repeat(40)}`;

const RAW_ROW = {
  id: 'emp-1',
  owner_id: USER_ID,
  name: 'Alice Smith',
  wallet_address: VALID_ADDRESS,
  role: 'Engineer',
  pay_usd: 5000,
  email: 'alice@example.com',
  department: 'Engineering',
  created_at: '2024-01-15T10:00:00Z',
};

const EMPLOYEE_FIELDS: Omit<Employee, 'id' | 'dateAdded'> = {
  name: 'Alice Smith',
  walletAddress: VALID_ADDRESS,
  role: 'Engineer',
  payUsd: 5000,
  email: 'alice@example.com',
  department: 'Engineering',
};

function mockAuth(user: { id: string } | null = { id: USER_ID }) {
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user } as never,
    error: null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// signInWithWallet
// ---------------------------------------------------------------------------

describe('signInWithWallet', () => {
  it('signs in with an existing account on first try', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {} as never,
      error: null,
    });

    await expect(signInWithWallet(VALID_ADDRESS)).resolves.toBeUndefined();
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledOnce();
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  it('falls back to signUp when sign-in fails (first-time user)', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {} as never,
      error: { message: 'Invalid login credentials' },
    });
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: {} as never,
      error: null,
    });

    await expect(signInWithWallet(VALID_ADDRESS)).resolves.toBeUndefined();
    expect(supabase.auth.signUp).toHaveBeenCalledOnce();
  });

  it('throws when both signIn and signUp fail', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {} as never,
      error: { message: 'Invalid login credentials' },
    });
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: {} as never,
      error: { message: 'Email already registered' },
    });

    await expect(signInWithWallet(VALID_ADDRESS)).rejects.toThrow('Email already registered');
  });

  it('derives the email from the wallet address (lowercase)', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {} as never,
      error: null,
    });

    await signInWithWallet('0xABCDEF1234567890abcdef1234567890ABCDEF12');

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        email: '0xabcdef1234567890abcdef1234567890abcdef12@geniepay.wallet',
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// signOutWallet
// ---------------------------------------------------------------------------

describe('signOutWallet', () => {
  it('calls supabase.auth.signOut', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    await signOutWallet();
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// fetchEmployees
// ---------------------------------------------------------------------------

describe('fetchEmployees', () => {
  it('returns mapped Employee objects for the authenticated user', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: [RAW_ROW], error: null }) as never);

    const result = await fetchEmployees();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('emp-1');
    expect(result[0].name).toBe('Alice Smith');
    expect(result[0].walletAddress).toBe(VALID_ADDRESS);
    expect(result[0].role).toBe('Engineer');
    expect(result[0].payUsd).toBe(5000);
    expect(result[0].email).toBe('alice@example.com');
    expect(result[0].department).toBe('Engineering');
    expect(result[0].dateAdded).toBeInstanceOf(Date);
  });

  it('throws when no user is authenticated', async () => {
    mockAuth(null);
    await expect(fetchEmployees()).rejects.toThrow('Not authenticated');
  });

  it('throws when Supabase returns an error', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: null, error: { message: 'DB unavailable' } }) as never,
    );

    await expect(fetchEmployees()).rejects.toThrow('DB unavailable');
  });

  it('returns an empty array when there are no employees', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: [], error: null }) as never);

    expect(await fetchEmployees()).toEqual([]);
  });

  it('maps null email/department to undefined on the model', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: [{ ...RAW_ROW, email: null, department: null }], error: null }) as never,
    );

    const [emp] = await fetchEmployees();
    expect(emp.email).toBeUndefined();
    expect(emp.department).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// insertEmployee
// ---------------------------------------------------------------------------

describe('insertEmployee', () => {
  it('inserts and returns the new employee', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: RAW_ROW, error: null }) as never);

    const result = await insertEmployee(EMPLOYEE_FIELDS);

    expect(result.id).toBe('emp-1');
    expect(result.name).toBe('Alice Smith');
    expect(supabase.from).toHaveBeenCalledWith('employees');
  });

  it('throws when no user is authenticated', async () => {
    mockAuth(null);
    await expect(insertEmployee(EMPLOYEE_FIELDS)).rejects.toThrow('Not authenticated');
  });

  it('throws when Supabase returns an insert error', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: null, error: { message: 'Unique constraint violated' } }) as never,
    );

    await expect(insertEmployee(EMPLOYEE_FIELDS)).rejects.toThrow('Unique constraint violated');
  });

  it('maps undefined optional fields to null in the insert payload', async () => {
    mockAuth();
    const chain = makeChain({ data: { ...RAW_ROW, email: null, department: null }, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    const result = await insertEmployee({ ...EMPLOYEE_FIELDS, email: undefined, department: undefined });

    // Verify what was actually sent to Supabase (undefined → null, not undefined)
    const insertSpy = chain.insert as ReturnType<typeof vi.fn>;
    expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({ email: null, department: null }));
    // Verify the mapped output (null DB value → undefined on the model)
    expect(result.email).toBeUndefined();
    expect(result.department).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// updateEmployee
// ---------------------------------------------------------------------------

describe('updateEmployee', () => {
  it('updates and returns the modified employee', async () => {
    mockAuth();
    const updated = { ...RAW_ROW, name: 'Alice Updated', pay_usd: 6000 };
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: updated, error: null }) as never);

    const result = await updateEmployee('emp-1', { ...EMPLOYEE_FIELDS, name: 'Alice Updated', payUsd: 6000 });

    expect(result.name).toBe('Alice Updated');
    expect(result.payUsd).toBe(6000);
  });

  it('throws when no user is authenticated', async () => {
    mockAuth(null);
    await expect(updateEmployee('emp-1', EMPLOYEE_FIELDS)).rejects.toThrow('Not authenticated');
  });

  it('throws when Supabase returns an update error', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: null, error: { message: 'Record not found' } }) as never,
    );

    await expect(updateEmployee('emp-1', EMPLOYEE_FIELDS)).rejects.toThrow('Record not found');
  });

  it('scopes the update to both id and owner_id for security', async () => {
    mockAuth();
    const chain = makeChain({ data: RAW_ROW, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await updateEmployee('emp-1', EMPLOYEE_FIELDS);

    const eqSpy = chain.eq as ReturnType<typeof vi.fn>;
    expect(eqSpy).toHaveBeenCalledWith('id', 'emp-1');
    expect(eqSpy).toHaveBeenCalledWith('owner_id', USER_ID);
  });
});

// ---------------------------------------------------------------------------
// deleteEmployee
// ---------------------------------------------------------------------------

describe('deleteEmployee', () => {
  it('resolves without a return value on success', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: null, error: null }) as never);

    await expect(deleteEmployee('emp-1')).resolves.toBeUndefined();
  });

  it('throws when no user is authenticated', async () => {
    mockAuth(null);
    await expect(deleteEmployee('emp-1')).rejects.toThrow('Not authenticated');
  });

  it('throws when Supabase returns a delete error', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: null, error: { message: 'Foreign key constraint' } }) as never,
    );

    await expect(deleteEmployee('emp-1')).rejects.toThrow('Foreign key constraint');
  });

  it('scopes the delete to both id and owner_id for security', async () => {
    mockAuth();
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await deleteEmployee('emp-99');

    const eqSpy = chain.eq as ReturnType<typeof vi.fn>;
    expect(eqSpy).toHaveBeenCalledWith('id', 'emp-99');
    expect(eqSpy).toHaveBeenCalledWith('owner_id', USER_ID);
  });
});
