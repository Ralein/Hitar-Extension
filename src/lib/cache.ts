import { CacheEntry } from './types';
import { getCacheKey } from './hash';

const DB_NAME = 'hitar_translation_cache';
const DB_VERSION = 1;
const STORE_NAME = 'translations';
const DEFAULT_MAX_ENTRIES = 20000;

export class TranslationCache {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(private readonly maxEntries: number = DEFAULT_MAX_ENTRIES) {}

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise !== null) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async get(sourceText: string, sourceLang: string, targetLang: string): Promise<string | null> {
    const key = getCacheKey(sourceText, sourceLang, targetLang);
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const entry: CacheEntry | undefined = req.result;
          if (entry) {
            entry.lastAccessed = Date.now();
            store.put(entry);
            resolve(entry.translatedText);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async getMany(
    texts: string[],
    sourceLang: string,
    targetLang: string,
  ): Promise<Map<string, string>> {
    const resultMap = new Map<string, string>();
    if (texts.length === 0) return resultMap;

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const now = Date.now();

      await Promise.all(
        texts.map(
          (text) =>
            new Promise<void>((resolve) => {
              const key = getCacheKey(text, sourceLang, targetLang);
              const req = store.get(key);

              req.onsuccess = () => {
                const entry: CacheEntry | undefined = req.result;
                if (entry) {
                  resultMap.set(text, entry.translatedText);
                  entry.lastAccessed = now;
                  store.put(entry);
                }
                resolve();
              };

              req.onerror = () => resolve();
            }),
        ),
      );
    } catch {
      // Fallback gracefully on IDB error
    }

    return resultMap;
  }

  async setMany(
    translations: Array<{ sourceText: string; translatedText: string }>,
    sourceLang: string,
    targetLang: string,
  ): Promise<void> {
    if (translations.length === 0) return;

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const now = Date.now();

      for (const item of translations) {
        if (!item.sourceText || !item.translatedText) continue;
        const key = getCacheKey(item.sourceText, sourceLang, targetLang);
        const entry: CacheEntry = {
          key,
          sourceText: item.sourceText,
          translatedText: item.translatedText,
          sourceLang,
          targetLang,
          timestamp: now,
          lastAccessed: now,
        };
        store.put(entry);
      }

      tx.oncomplete = () => {
        this.evictIfNeeded();
      };
    } catch {
      // Fallback gracefully on IDB error
    }
  }

  private async evictIfNeeded(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();

      countReq.onsuccess = () => {
        const count = countReq.result;
        if (count <= this.maxEntries) return;

        const overage = count - this.maxEntries;
        const index = store.index('lastAccessed');
        const cursorReq = index.openCursor();
        let deleted = 0;

        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && deleted < overage) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      };
    } catch {
      // Ignore eviction errors
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignore clear errors
    }
  }

  async getStats(): Promise<{ count: number; maxEntries: number }> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count();

        req.onsuccess = () => {
          resolve({ count: req.result, maxEntries: this.maxEntries });
        };
        req.onerror = () => {
          resolve({ count: 0, maxEntries: this.maxEntries });
        };
      });
    } catch {
      return { count: 0, maxEntries: this.maxEntries };
    }
  }
}

export const translationCache = new TranslationCache();
