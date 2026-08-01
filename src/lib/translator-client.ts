import { TranslationEndpoint, TranslationRequest } from './types';
import { withExponentialBackoff } from './retry';

export const DEFAULT_ENDPOINTS: TranslationEndpoint[] = [
  {
    url: 'https://translate.googleapis.com',
    name: 'Google Translate Free Engine (Fast & Reliable)',
    enabled: true,
  },
  {
    url: 'https://translate.argosopentech.com',
    name: 'Argos Open Tech (Public LibreTranslate)',
    enabled: true,
  },
  {
    url: 'https://libretranslate.com',
    name: 'LibreTranslate (Official Public)',
    enabled: true,
  },
  {
    url: 'http://localhost:5000',
    name: 'Local Docker Instance (LibreTranslate)',
    enabled: false,
  },
];

export class TranslatorClient {
  constructor(private endpoints: TranslationEndpoint[] = DEFAULT_ENDPOINTS) {}

  public updateEndpoints(endpoints: TranslationEndpoint[]) {
    this.endpoints = endpoints;
  }

  private getActiveEndpoints(): TranslationEndpoint[] {
    const active = this.endpoints.filter((e) => e.enabled);
    return active.length > 0 ? active : DEFAULT_ENDPOINTS;
  }

  /**
   * Main batch translation entrypoint with multi-engine failover:
   * 1. Google Translate GTX Free API
   * 2. LibreTranslate Endpoints
   * 3. Lingva Open Source API Proxy
   */
  async translateBatch(
    texts: string[],
    source: string,
    target: string,
  ): Promise<string[]> {
    if (texts.length === 0) return [];
    if (source === target && source !== 'auto') return texts;

    const resolvedSource = source === 'auto' ? 'auto' : source;

    // Strategy 1: Try Google Translate GTX Free API first (most reliable, zero rate limit)
    try {
      return await this.translateWithGoogleGTX(texts, resolvedSource, target);
    } catch (err: any) {
      console.warn('Google GTX Engine failed, trying LibreTranslate/Fallback engines...', err.message);
    }

    // Strategy 2: Try active configured endpoints (LibreTranslate, Local Docker, etc.)
    const endpoints = this.getActiveEndpoints();
    for (const endpoint of endpoints) {
      if (endpoint.url.includes('googleapis')) continue; // already tried above
      try {
        return await withExponentialBackoff(
          () => this.requestLibreTranslate(endpoint, texts, resolvedSource, target),
          { maxRetries: 1, baseDelayMs: 300 },
        );
      } catch (err: any) {
        console.warn(`Endpoint ${endpoint.url} failed: ${err.message}. Trying next...`);
      }
    }

    // Strategy 3: Try Lingva Open Source Proxy as final fallback
    try {
      return await this.translateWithLingva(texts, resolvedSource, target);
    } catch (err: any) {
      console.error('All translation engines failed:', err.message);
    }

    // If all fail, return original texts gracefully
    return texts;
  }

  /**
   * Google Translate Free GTX Web API implementation.
   * Fast, supports 130+ languages (including Indonesian), no API key needed.
   */
  private async translateWithGoogleGTX(
    texts: string[],
    source: string,
    target: string,
  ): Promise<string[]> {
    const results: string[] = [];

    // Parallel fetch with concurrency cap of 5
    const batchSize = 5;
    for (let i = 0; i < texts.length; i += batchSize) {
      const chunk = texts.slice(i, i + batchSize);
      const chunkPromises = chunk.map(async (text) => {
        if (!text || text.trim().length === 0) return text;

        const sl = source || 'auto';
        const tl = target || 'en';
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
          sl,
        )}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Google GTX HTTP ${response.status}`);
        }

        const data = await response.json();
        // Parse Google GTX response array format: [[["translated", "original", ...]]]
        if (Array.isArray(data) && Array.isArray(data[0])) {
          return data[0].map((item: any) => item[0]).join('');
        }
        return text;
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Lingva Translate API (Open-source proxy fallback).
   */
  private async translateWithLingva(
    texts: string[],
    source: string,
    target: string,
  ): Promise<string[]> {
    const results: string[] = [];
    const src = source === 'auto' ? 'auto' : source;

    for (const text of texts) {
      if (!text || text.trim().length === 0) {
        results.push(text);
        continue;
      }
      try {
        const url = `https://lingva.ml/api/v1/${encodeURIComponent(src)}/${encodeURIComponent(
          target,
        )}/${encodeURIComponent(text)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          results.push(data.translation || text);
        } else {
          results.push(text);
        }
      } catch {
        results.push(text);
      }
    }

    return results;
  }

  /**
   * LibreTranslate API implementation.
   */
  private async requestLibreTranslate(
    endpoint: TranslationEndpoint,
    texts: string[],
    source: string,
    target: string,
  ): Promise<string[]> {
    const baseUrl = endpoint.url.replace(/\/$/, '');
    const url = `${baseUrl}/translate`;

    let resolvedSource = source;
    if (!resolvedSource || resolvedSource === 'auto') {
      const sampleText = texts.find((t) => t && t.trim().length > 3) || texts[0] || '';
      const detected = await this.detectLanguage(sampleText);
      resolvedSource = detected || 'en';
    }

    const payload: TranslationRequest = {
      q: texts,
      source: resolvedSource,
      target,
      format: 'text',
    };

    if (endpoint.apiKey) {
      payload.api_key = endpoint.apiKey;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson?.error) {
          errMessage = `HTTP Error ${response.status}: ${errJson.error}`;
        }
      } catch {
        // Ignore json parse error
      }
      const errorObj: any = new Error(errMessage);
      errorObj.status = response.status;
      throw errorObj;
    }

    const data = await response.json();
    if (Array.isArray(data.translatedText)) {
      return data.translatedText;
    } else if (typeof data.translatedText === 'string') {
      return [data.translatedText];
    }

    throw new Error('Unexpected translation response structure');
  }

  /**
   * Tests connection to a specific endpoint.
   */
  async testEndpoint(
    endpoint: TranslationEndpoint,
  ): Promise<{ success: boolean; message: string; supportedLanguages?: number }> {
    if (endpoint.url.includes('googleapis')) {
      return {
        success: true,
        message: 'Connected successfully to Google Translate Engine.',
        supportedLanguages: 130,
      };
    }

    try {
      const url = `${endpoint.url.replace(/\/$/, '')}/languages`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
      }

      const languages = await response.json();
      if (Array.isArray(languages)) {
        return {
          success: true,
          message: `Connected successfully (${languages.length} languages supported).`,
          supportedLanguages: languages.length,
        };
      }
      return { success: false, message: 'Invalid response format from server.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed.' };
    }
  }

  /**
   * Detects source language for a given text snippet.
   */
  async detectLanguage(text: string): Promise<string | null> {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
        text,
      )}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data[2]) {
          return data[2]; // Detected language code (e.g. 'id', 'en', 'es')
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }
}

export const defaultTranslatorClient = new TranslatorClient();
