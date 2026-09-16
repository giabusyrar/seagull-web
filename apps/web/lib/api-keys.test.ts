import { describe, it, expect, beforeEach } from 'vitest';
import { generateApiKey, hashApiKey, checkRateLimit, _resetRateLimitStateForTests } from './api-keys';

describe('generateApiKey', () => {
  it('returns a plaintext key, its hash, and last four characters', () => {
    const { plaintext, hash, lastFour } = generateApiKey();
    expect(plaintext.startsWith('wpk_')).toBe(true);
    expect(hash).toBe(hashApiKey(plaintext));
    expect(lastFour).toBe(plaintext.slice(-4));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates a different key each call', () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.plaintext).not.toBe(b.plaintext);
  });
});

describe('hashApiKey', () => {
  it('is deterministic for the same input', () => {
    expect(hashApiKey('wpk_abc')).toBe(hashApiKey('wpk_abc'));
  });

  it('differs for different input', () => {
    expect(hashApiKey('wpk_abc')).not.toBe(hashApiKey('wpk_xyz'));
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    _resetRateLimitStateForTests();
  });

  it('allows unlimited requests when limitPerMinute is null', () => {
    for (let i = 0; i < 1000; i++) {
      expect(checkRateLimit('key-1', null)).toBe(true);
    }
  });

  it('allows requests up to the limit within one window', () => {
    const now = 1_000_000;
    expect(checkRateLimit('key-2', 3, now)).toBe(true);
    expect(checkRateLimit('key-2', 3, now + 1)).toBe(true);
    expect(checkRateLimit('key-2', 3, now + 2)).toBe(true);
  });

  it('rejects the request once the limit is exceeded within the window', () => {
    const now = 2_000_000;
    checkRateLimit('key-3', 2, now);
    checkRateLimit('key-3', 2, now + 1);
    expect(checkRateLimit('key-3', 2, now + 2)).toBe(false);
  });

  it('resets the count once a new window starts', () => {
    const now = 3_000_000;
    checkRateLimit('key-4', 1, now);
    expect(checkRateLimit('key-4', 1, now + 1)).toBe(false);
    expect(checkRateLimit('key-4', 1, now + 60_001)).toBe(true);
  });

  it('tracks separate keys independently', () => {
    const now = 4_000_000;
    checkRateLimit('key-5a', 1, now);
    expect(checkRateLimit('key-5b', 1, now)).toBe(true);
  });
});
