import { describe, it, expect } from 'vitest';
import { fnv1aHash, getCacheKey } from '../../src/lib/hash';

describe('Hash & CacheKey Utilities', () => {
  it('generates consistent FNV-1a hash', () => {
    const hash1 = fnv1aHash('Hello World');
    const hash2 = fnv1aHash('Hello World');
    const hash3 = fnv1aHash('Different');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1).toHaveLength(8);
  });

  it('generates unique cache keys for different languages or text', () => {
    const key1 = getCacheKey('Hello', 'en', 'es');
    const key2 = getCacheKey('Hello', 'en', 'fr');
    const key3 = getCacheKey('Goodbye', 'en', 'es');

    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
  });
});
