/**
 * Generates a fast, deterministic 32-bit FNV-1a hash formatted as hex string,
 * suitable for string cache keys.
 */
export function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    const codePoint = str.codePointAt(i) || 0;
    hash ^= codePoint;
    /* hash * 16777619 */
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Creates a unique, deterministic cache key for a translation request.
 */
export function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  const normalizedText = text.trim();
  const rawKey = `${normalizedText}::${sourceLang}::${targetLang}`;
  return fnv1aHash(rawKey) + '_' + normalizedText.length;
}
