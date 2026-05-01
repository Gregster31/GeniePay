import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateLong } from '@/utils/Format';

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------

describe('formatCurrency', () => {
  it('formats a whole-dollar amount', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a negative amount', () => {
    expect(formatCurrency(-250)).toBe('-$250.00');
  });

  it('adds thousands separators for large values', () => {
    expect(formatCurrency(1_000_000)).toBe('$1,000,000.00');
  });

  it('rounds to two decimal places (half-up)', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
  });

  it('preserves two decimal places for a fractional amount', () => {
    expect(formatCurrency(4.5)).toBe('$4.50');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  it('returns the short locale date string (e.g. "Jan 15, 2024")', () => {
    // Use UTC constructor to avoid any timezone shift on the day component.
    const date = new Date(2024, 0, 15); // Jan 15, 2024, local time
    const result = formatDate(date);

    expect(result).toContain('2024');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });

  it('formats December correctly', () => {
    const date = new Date(2023, 11, 31); // Dec 31, 2023
    expect(formatDate(date)).toContain('Dec');
    expect(formatDate(date)).toContain('31');
    expect(formatDate(date)).toContain('2023');
  });
});

// ---------------------------------------------------------------------------
// formatDateLong
// ---------------------------------------------------------------------------

describe('formatDateLong', () => {
  it('includes the year, month abbreviation, day, and a time component', () => {
    const date = new Date(2024, 5, 20, 14, 30); // Jun 20, 2024, 14:30
    const result = formatDateLong(date);

    expect(result).toContain('2024');
    expect(result).toContain('Jun');
    expect(result).toContain('20');
    // Time portion — matches "2:30", "02:30", "14:30", etc.
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});
