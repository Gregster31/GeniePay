import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getExplorerUrl, fetchTransactions } from '@/utils/Blockscout';

// ---------------------------------------------------------------------------
// getExplorerUrl
// ---------------------------------------------------------------------------

describe('getExplorerUrl', () => {
  it('returns the Ethereum Mainnet URL for chainId 1', () => {
    expect(getExplorerUrl('0xabc', 1)).toBe('https://eth.blockscout.com/tx/0xabc');
  });

  it('returns the Sepolia URL for chainId 11155111', () => {
    expect(getExplorerUrl('0xabc', 11155111)).toBe('https://eth-sepolia.blockscout.com/tx/0xabc');
  });

  it('returns the Optimism URL for chainId 10', () => {
    expect(getExplorerUrl('0xabc', 10)).toBe('https://optimism.blockscout.com/tx/0xabc');
  });

  it('returns the Base URL for chainId 8453', () => {
    expect(getExplorerUrl('0xabc', 8453)).toBe('https://base.blockscout.com/tx/0xabc');
  });

  it('returns the Polygon URL for chainId 137', () => {
    expect(getExplorerUrl('0xabc', 137)).toBe('https://polygon.blockscout.com/tx/0xabc');
  });

  it('returns the Arbitrum URL for chainId 42161', () => {
    expect(getExplorerUrl('0xabc', 42161)).toBe('https://arbitrum.blockscout.com/tx/0xabc');
  });

  it('falls back to the Sepolia URL for an unknown chainId', () => {
    expect(getExplorerUrl('0xabc', 999999)).toBe('https://eth-sepolia.blockscout.com/tx/0xabc');
  });

  it('embeds the tx hash verbatim in the URL', () => {
    const hash = '0xdeadbeefcafe';
    expect(getExplorerUrl(hash, 1)).toContain(hash);
  });
});

// ---------------------------------------------------------------------------
// fetchTransactions
// ---------------------------------------------------------------------------

const TX_STUB = {
  hash: '0xtxhash',
  from: '0xsender',
  to: '0xrecipient',
  value: '1000000000000000000', // 1 ETH in wei
  timeStamp: '1700000000',
  gasUsed: '21000',
};

describe('fetchTransactions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed transactions for a single known chainId', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: '1', result: [TX_STUB] }),
    } as Response);

    const results = await fetchTransactions('0xaddr', 1, 10, 1);

    expect(results).toHaveLength(1);
    expect(results[0].hash).toBe('0xtxhash');
    expect(results[0].network).toBe('Ethereum');
    expect(results[0].chainId).toBe(1);
    expect(results[0].from).toBe('0xsender');
    expect(results[0].to).toBe('0xrecipient');
    expect(results[0].timestamp).toBeInstanceOf(Date);
  });

  it('converts whole-number wei to an ETH string without decimals', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: '1', result: [TX_STUB] }),
    } as Response);

    const [tx] = await fetchTransactions('0xaddr', 1, 10, 1);
    // 1_000_000_000_000_000_000 wei = 1 ETH
    expect(tx.value).toBe('1');
  });

  it('converts fractional wei to a trimmed ETH decimal string', async () => {
    // 500_000_000_000_000_000 wei = 0.5 ETH
    const fractionalTx = { ...TX_STUB, value: '500000000000000000' };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: '1', result: [fractionalTx] }),
    } as Response);

    const [tx] = await fetchTransactions('0xaddr', 1, 10, 1);
    expect(tx.value).toBe('0.5');
  });

  it('returns an empty array when the API status is not "1"', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: '0', result: [] }),
    } as Response);

    expect(await fetchTransactions('0xaddr', 1, 10, 1)).toEqual([]);
  });

  it('returns an empty array when the HTTP response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

    expect(await fetchTransactions('0xaddr', 1, 10, 1)).toEqual([]);
  });

  it('returns an empty array on a network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network down'));

    expect(await fetchTransactions('0xaddr', 1, 10, 1)).toEqual([]);
  });

  it('treats an unknown chainId as "no chain" and falls back to querying all chains', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: '0', result: null }),
    } as Response);

    const result = await fetchTransactions('0xaddr', 1, 10, 999999);

    // Unknown chainId is not in BLOCKSCOUT_ENDPOINTS, so the condition
    // `chainId && BLOCKSCOUT_ENDPOINTS[chainId]` is falsy → all-chains fallback.
    expect(result).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it('queries all 6 supported chains when no chainId is supplied', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: '0', result: null }),
    } as Response);

    await fetchTransactions('0xaddr', 1, 10);

    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it('caps results to the requested limit when aggregating all chains', async () => {
    const makeTx = (i: number) => ({ ...TX_STUB, hash: `0x${i}`, timeStamp: String(1700000000 + i) });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: '1', result: Array.from({ length: 10 }, (_, i) => makeTx(i)) }),
    } as Response);

    const results = await fetchTransactions('0xaddr', 1, 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it('sorts multi-chain results newest-first', async () => {
    const older = { ...TX_STUB, hash: '0xold', timeStamp: '1600000000' };
    const newer = { ...TX_STUB, hash: '0xnew', timeStamp: '1700000000' };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: '1', result: [older] }) } as Response)
      .mockResolvedValue({ ok: true, json: async () => ({ status: '1', result: [newer] }) } as Response);

    const results = await fetchTransactions('0xaddr', 1, 10);
    expect(results[0].hash).toBe('0xnew');
  });
});
