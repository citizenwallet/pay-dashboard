import { formatBytes, humanizeDate } from '@/lib/utils';
import { describe, expect, it } from '@jest/globals';

describe('Utility Functions', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly with default precision', () => {
      expect(formatBytes(0)).toBe('0 Byte');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should format bytes with custom precision', () => {
      expect(formatBytes(1536, { decimals: 2 })).toBe('1.50 KB');
      expect(formatBytes(1536 * 1024, { decimals: 2 })).toBe('1.50 MB');
    });

    it('should handle accurate size type', () => {
      expect(formatBytes(1000, { decimals: 2, sizeType: 'accurate' })).toBe(
        '1000.00 Bytes'
      );
      expect(formatBytes(1000000, { decimals: 2, sizeType: 'accurate' })).toBe(
        '976.56 KiB'
      );
    });
  });

  describe('humanizeDate', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2023-01-01T12:00:00Z');
      const formattedDate = humanizeDate(testDate.toISOString());

      // This test might need adjustment based on the actual implementation
      expect(formattedDate).toContain('Jan');
      expect(formattedDate).toContain('2023');
    });
  });
});
