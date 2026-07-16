import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validatePassword, validateFileType, validateFileSize } from '@/lib/security';

describe('security.ts', () => {
  describe('validatePassword', () => {
    it('accepts a strong password', () => {
      const result = validatePassword('SecurePass1!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const result = validatePassword('Ab1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('rejects passwords without uppercase', () => {
      const result = validatePassword('lowercase1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain uppercase letter');
    });

    it('rejects passwords without lowercase', () => {
      const result = validatePassword('UPPERCASE1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain lowercase letter');
    });

    it('rejects passwords without numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain a number');
    });

    it('rejects passwords without special characters', () => {
      const result = validatePassword('NoSpecial1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain special character');
    });

    it('returns multiple errors for weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateFileType', () => {
    it('accepts allowed file type', () => {
      const file = new File([''], 'resume.pdf', { type: 'application/pdf' });
      expect(validateFileType(file, ['application/pdf'])).toBe(true);
    });

    it('rejects disallowed file type', () => {
      const file = new File([''], 'malware.exe', { type: 'application/octet-stream' });
      expect(validateFileType(file, ['application/pdf', 'image/jpeg'])).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('accepts file within size limit', () => {
      const smallFile = new File([new ArrayBuffer(1024)], 'small.pdf');
      expect(validateFileSize(smallFile, 5)).toBe(true); // 5MB limit
    });

    it('rejects file exceeding size limit', () => {
      const bigBuffer = new ArrayBuffer(10 * 1024 * 1024); // 10MB
      const bigFile = new File([bigBuffer], 'big.pdf');
      expect(validateFileSize(bigFile, 5)).toBe(false); // 5MB limit
    });
  });
});
