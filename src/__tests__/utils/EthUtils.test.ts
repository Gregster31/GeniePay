import { describe, it, expect, vi, afterEach } from 'vitest';
import { ethToUsd, usdToEth, isValidEthAddress, fetchEthPrice } from '@/utils/EthUtils';

const VALID_ADDRESS = `0x${'a'.repeat(40)}`;

// ---------------------------------------------------------------------------
// ethToUsd
// ---------------------------------------------------------------------------

describe('ethToUsd', () => {
  it('multiplies eth amount by price', () => {
    expect(ethToUsd(1, 2000)).toBe(2000);
  });

  it('handles fractional ETH amounts', () => {
    expect(ethToUsd(0.5, 4000)).toBe(2000);
  });

  it('returns 0 for 0 ETH regardless of price', () => {
    expect(ethToUsd(0, 3000)).toBe(0);
  });

  it('returns 0 when price is 0', () => {
    expect(ethToUsd(1, 0)).toBe(0);
  });

  it('handles large values without overflow', () => {
    expect(ethToUsd(100, 5000)).toBe(500000);
  });
});

// ---------------------------------------------------------------------------
// usdToEth
// ---------------------------------------------------------------------------

describe('usdToEth', () => {
  it('divides USD amount by price', () => {
    expect(usdToEth(2000, 2000)).toBeCloseTo(1);
  });

  it('handles fractional results', () => {
    expect(usdToEth(1000, 4000)).toBeCloseTo(0.25);
  });

  it('returns 0 when price is 0 (division guard)', () => {
    expect(usdToEth(5000, 0)).toBe(0);
  });

  it('returns 0 for 0 USD', () => {
    expect(usdToEth(0, 2000)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// isValidEthAddress
// ---------------------------------------------------------------------------

describe('isValidEthAddress', () => {
  it('accepts a valid all-lowercase address', () => {
    expect(isValidEthAddress(VALID_ADDRESS)).toBe(true);
  });

  it('accepts a valid mixed-case checksum address', () => {
    expect(isValidEthAddress('0xAbCdEf1234567890AbCdEf1234567890AbCdEf12')).toBe(true);
  });

  it('accepts an all-uppercase hex address', () => {
    expect(isValidEthAddress(`0x${'A'.repeat(40)}`)).toBe(true);
  });

  it('rejects an address without the 0x prefix', () => {
    expect(isValidEthAddress('a'.repeat(42))).toBe(false);
  });

  it('rejects an address that is too short', () => {
    expect(isValidEthAddress('0x1234')).toBe(false);
  });

  it('rejects an address that is too long (41 hex chars)', () => {
    expect(isValidEthAddress(`0x${'a'.repeat(41)}`)).toBe(false);
  });

  it('rejects an address containing non-hex characters', () => {
    expect(isValidEthAddress(`0x${'g'.repeat(40)}`)).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEthAddress('')).toBe(false);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEthAddress(`  ${VALID_ADDRESS}  `)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// fetchEthPrice
// ---------------------------------------------------------------------------

describe('fetchEthPrice', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the parsed price on a successful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ price: '2500.75' }),
    }));

    await expect(fetchEthPrice()).resolves.toBe(2500.75);
  });

  it('returns 0 when the HTTP response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(fetchEthPrice()).resolves.toBe(0);
  });

  it('returns 0 on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    await expect(fetchEthPrice()).resolves.toBe(0);
  });

  it('returns 0 when the price field is not a valid number', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ price: 'not-a-number' }),
    }));

    await expect(fetchEthPrice()).resolves.toBe(0);
  });

  it('returns 0 when the price field is missing from the response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));

    await expect(fetchEthPrice()).resolves.toBe(0);
  });
});
