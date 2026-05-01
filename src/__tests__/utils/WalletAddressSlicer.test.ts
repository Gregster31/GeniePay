import { describe, it, expect } from 'vitest';
import { sliceAddress } from '@/utils/WalletAddressSlicer';

const FULL_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

describe('sliceAddress', () => {
  it('uses 6 start chars and 4 end chars by default', () => {
    // slice(0,6)="0x1234", slice(-4)="5678"
    expect(sliceAddress(FULL_ADDRESS)).toBe('0x1234...5678');
  });

  it('respects a custom startChars value', () => {
    expect(sliceAddress(FULL_ADDRESS, 8, 4)).toBe('0x123456...5678');
  });

  it('respects a custom endChars value', () => {
    expect(sliceAddress(FULL_ADDRESS, 6, 6)).toBe('0x1234...345678');
  });

  it('returns an empty string for an empty input', () => {
    expect(sliceAddress('')).toBe('');
  });

  it('returns the address unchanged when it is shorter than startChars + endChars', () => {
    // length=6, startChars=6, endChars=4 → 6 <= 10, return as-is
    expect(sliceAddress('0x1234', 6, 4)).toBe('0x1234');
  });

  it('returns the address unchanged when its length equals startChars + endChars', () => {
    // '0x12345678' is 10 chars; 6+4=10 → length <= sum, return as-is
    expect(sliceAddress('0x12345678', 6, 4)).toBe('0x12345678');
  });

  it('produces exactly one ellipsis separator', () => {
    const result = sliceAddress(FULL_ADDRESS);
    expect(result.split('...').length).toBe(2);
  });
});
