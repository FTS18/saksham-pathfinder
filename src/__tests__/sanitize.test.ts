import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeUrl, validateEmail } from '@/lib/sanitize';

describe('sanitize.ts', () => {
  describe('sanitizeText', () => {
    it('removes < and > brackets (XSS prevention)', () => {
      expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<');
      expect(sanitizeText('<script>alert(1)</script>')).not.toContain('>');
    });

    it('removes javascript: protocol (XSS)', () => {
      expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:');
    });

    it('removes on* event handlers', () => {
      expect(sanitizeText('onclick=alert(1)')).not.toContain('onclick=');
      expect(sanitizeText('onmouseover=evil()')).not.toContain('onmouseover=');
    });

    it('trims whitespace', () => {
      expect(sanitizeText('  hello world  ')).toBe('hello world');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeText('')).toBe('');
    });

    it('preserves normal text', () => {
      expect(sanitizeText('React Developer Internship')).toBe('React Developer Internship');
    });
  });

  describe('sanitizeUrl', () => {
    it('allows https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('allows http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('blocks javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('blocks ftp: protocol', () => {
      expect(sanitizeUrl('ftp://evil.com')).toBe('');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeUrl('')).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('rejects email without @', () => {
      expect(validateEmail('notanemail')).toBe(false);
    });

    it('rejects email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });
});
