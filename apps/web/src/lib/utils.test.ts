import { cn, getInitials, formatRelativeTime } from './utils';

describe('cn (classname merger)', () => {
  it('should merge class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('should handle conflicting tailwind classes', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
  });

  it('should handle undefined and null', () => {
    expect(cn('base', undefined, null, 'extra')).toBe('base extra');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('getInitials', () => {
  it('should return first 2 initials of a full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('should handle 3-word names (take first 2)', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  it('should return uppercase', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

describe('formatRelativeTime', () => {
  it('should return "Baru saja" for very recent dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('Baru saja');
  });

  it('should return minutes for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe('5 menit yang lalu');
  });

  it('should return hours for dates within same day', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 jam yang lalu');
  });

  it('should return days for recent past dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 hari yang lalu');
  });

  it('should return formatted date for old dates', () => {
    const oldDate = new Date('2024-01-15').toISOString();
    const result = formatRelativeTime(oldDate);
    // Should contain year and be a proper date string
    expect(result).toContain('2024');
  });
});
