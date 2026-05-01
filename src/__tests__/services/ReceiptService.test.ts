import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Supabase mock
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase', () => {
  const auth = { getUser: vi.fn() };
  return { supabase: { auth, from: vi.fn() } };
});

import { supabase } from '@/lib/supabase';
import { fetchReceipts, saveReceipt, deleteReceipt } from '@/services/ReceiptService';
import type { Receipt } from '@/models/ReceiptModel';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a thenable Supabase query-builder stub where every chained method
 * returns itself. Awaiting the chain (or any step in it) resolves to `resolved`.
 */
function makeChain(resolved: { data: unknown; error: { message: string } | null }) {
  const promise = Promise.resolve(resolved);
  const chain: Record<string, unknown> = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  for (const m of ['select', 'insert', 'delete', 'eq', 'order', 'single']) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  return chain;
}

const USER_ID = 'user-xyz-456';

const RAW_ROW = {
  id: 'rcpt-1',
  owner_id: USER_ID,
  type: 'quickpay',
  tx_hash: '0xtxhash',
  network: 'Ethereum',
  currency: 'ETH',
  total_usd: 500,
  total_crypto: 0.2,
  gas_fee: '0.001',
  from_address: `0x${'a'.repeat(40)}`,
  recipients: [{ address: `0x${'b'.repeat(40)}`, amountEth: 0.2, amountUsd: 500 }],
  created_at: '2024-03-01T12:00:00Z',
};

const RECEIPT_INPUT: Omit<Receipt, 'id' | 'createdAt'> = {
  type: 'quickpay',
  txHash: '0xtxhash',
  network: 'Ethereum',
  currency: 'ETH',
  totalUsd: 500,
  totalCrypto: 0.2,
  gasFee: '0.001',
  from: `0x${'a'.repeat(40)}`,
  recipients: [{ address: `0x${'b'.repeat(40)}`, amountEth: 0.2, amountUsd: 500 }],
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
// fetchReceipts
// ---------------------------------------------------------------------------

describe('fetchReceipts', () => {
  it('returns mapped Receipt objects for the authenticated user', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: [RAW_ROW], error: null }) as never);

    const result = await fetchReceipts();

    expect(result).toHaveLength(1);
    const r = result[0];
    expect(r.id).toBe('rcpt-1');
    expect(r.type).toBe('quickpay');
    expect(r.txHash).toBe('0xtxhash');
    expect(r.network).toBe('Ethereum');
    expect(r.currency).toBe('ETH');
    expect(r.totalUsd).toBe(500);
    expect(r.totalCrypto).toBe(0.2);
    expect(r.gasFee).toBe('0.001');
    expect(r.createdAt).toBeInstanceOf(Date);
    expect(r.recipients).toHaveLength(1);
  });

  it('maps a null gas_fee to undefined on the model', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: [{ ...RAW_ROW, gas_fee: null }], error: null }) as never,
    );

    const [r] = await fetchReceipts();
    expect(r.gasFee).toBeUndefined();
  });

  it('throws when no user is authenticated', async () => {
    mockAuth(null);
    await expect(fetchReceipts()).rejects.toThrow('Not authenticated');
  });

  it('throws when Supabase returns an error', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: null, error: { message: 'Permission denied' } }) as never,
    );

    await expect(fetchReceipts()).rejects.toThrow('Permission denied');
  });

  it('returns an empty array when the user has no receipts', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: [], error: null }) as never);

    expect(await fetchReceipts()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// saveReceipt
// ---------------------------------------------------------------------------

describe('saveReceipt', () => {
  it('inserts and returns the new receipt when below the 5-receipt cap', async () => {
    mockAuth();

    const existingRows = Array.from({ length: 3 }, (_, i) => ({
      id: `rcpt-${i}`,
      created_at: `2024-0${i + 1}-01T00:00:00Z`,
    }));

    // First from() → list existing; second from() → insert
    vi.mocked(supabase.from)
      .mockReturnValueOnce(makeChain({ data: existingRows, error: null }) as never)
      .mockReturnValueOnce(makeChain({ data: RAW_ROW, error: null }) as never);

    const result = await saveReceipt(RECEIPT_INPUT);

    expect(result.id).toBe('rcpt-1');
    expect(result.txHash).toBe('0xtxhash');
    // delete should NOT have been called (only 3 existing < 5 cap)
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });

  it('deletes the oldest receipt before inserting when exactly at the cap (5)', async () => {
    mockAuth();

    const existingRows = Array.from({ length: 5 }, (_, i) => ({
      id: `rcpt-${i}`,
      created_at: `2024-0${i + 1}-01T00:00:00Z`,
    }));

    // Chains: list → delete → insert
    const listChain = makeChain({ data: existingRows, error: null });
    const deleteChain = makeChain({ data: null, error: null });
    const insertChain = makeChain({ data: RAW_ROW, error: null });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(listChain as never)  // select existing
      .mockReturnValueOnce(deleteChain as never) // delete oldest
      .mockReturnValueOnce(insertChain as never); // insert new

    const result = await saveReceipt(RECEIPT_INPUT);

    expect(result.id).toBe('rcpt-1');
    // 3 from() calls: list, delete, insert
    expect(supabase.from).toHaveBeenCalledTimes(3);
  });

  it('deletes the chronologically oldest receipt (first row after ascending sort)', async () => {
    mockAuth();

    const existingRows = [
      { id: 'oldest', created_at: '2024-01-01T00:00:00Z' },
      { id: 'newer',  created_at: '2024-06-01T00:00:00Z' },
      { id: 'newest', created_at: '2024-12-01T00:00:00Z' },
      { id: 'mid1',   created_at: '2024-03-01T00:00:00Z' },
      { id: 'mid2',   created_at: '2024-04-01T00:00:00Z' },
    ];

    const deleteChain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from)
      .mockReturnValueOnce(makeChain({ data: existingRows, error: null }) as never)
      .mockReturnValueOnce(deleteChain as never)
      .mockReturnValueOnce(makeChain({ data: RAW_ROW, error: null }) as never);

    await saveReceipt(RECEIPT_INPUT);

    // The delete chain's .eq() should have been called with the id of the first row
    const eqSpy = deleteChain.eq as ReturnType<typeof vi.fn>;
    expect(eqSpy).toHaveBeenCalledWith('id', 'oldest');
  });

  it('throws when no user is authenticated', async () => {
    mockAuth(null);
    await expect(saveReceipt(RECEIPT_INPUT)).rejects.toThrow('Not authenticated');
  });

  it('throws when the listing query fails', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: null, error: { message: 'Listing failed' } }) as never,
    );

    await expect(saveReceipt(RECEIPT_INPUT)).rejects.toThrow('Listing failed');
  });

  it('throws when the insert query fails', async () => {
    mockAuth();
    vi.mocked(supabase.from)
      .mockReturnValueOnce(makeChain({ data: [], error: null }) as never) // list
      .mockReturnValueOnce(makeChain({ data: null, error: { message: 'Insert error' } }) as never);

    await expect(saveReceipt(RECEIPT_INPUT)).rejects.toThrow('Insert error');
  });

  it('stores undefined gasFee as null in the DB', async () => {
    mockAuth();

    const listChain = makeChain({ data: [], error: null });
    const insertChain = makeChain({ data: { ...RAW_ROW, gas_fee: null }, error: null });

    vi.mocked(supabase.from)
      .mockReturnValueOnce(listChain as never)
      .mockReturnValueOnce(insertChain as never);

    const result = await saveReceipt({ ...RECEIPT_INPUT, gasFee: undefined });

    expect(result.gasFee).toBeUndefined();
    const insertSpy = insertChain.insert as ReturnType<typeof vi.fn>;
    expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({ gas_fee: null }));
  });
});

// ---------------------------------------------------------------------------
// deleteReceipt
// ---------------------------------------------------------------------------

describe('deleteReceipt', () => {
  it('resolves without a return value on success', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(makeChain({ data: null, error: null }) as never);

    await expect(deleteReceipt('rcpt-1')).resolves.toBeUndefined();
  });

  it('throws when no user is authenticated', async () => {
    mockAuth(null);
    await expect(deleteReceipt('rcpt-1')).rejects.toThrow('Not authenticated');
  });

  it('throws when Supabase returns a delete error', async () => {
    mockAuth();
    vi.mocked(supabase.from).mockReturnValue(
      makeChain({ data: null, error: { message: 'Row not found' } }) as never,
    );

    await expect(deleteReceipt('rcpt-1')).rejects.toThrow('Row not found');
  });

  it('scopes the delete to both id and owner_id for security', async () => {
    mockAuth();
    const chain = makeChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain as never);

    await deleteReceipt('rcpt-99');

    const eqSpy = chain.eq as ReturnType<typeof vi.fn>;
    expect(eqSpy).toHaveBeenCalledWith('id', 'rcpt-99');
    expect(eqSpy).toHaveBeenCalledWith('owner_id', USER_ID);
  });
});
