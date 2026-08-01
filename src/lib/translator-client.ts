import { TranslationEndpoint, TranslationRequest } from './types';
import { withExponentialBackoff } from './retry';

export const DEFAULT_ENDPOINTS: TranslationEndpoint[] = [
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
    name: 'Local Docker Instance',
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
   * Translates an array of text strings using configured endpoints with retry and endpoint failover.
   */
  async translateBatch(
    texts: string[],
    source: string,
    target: string,
  ): Promise<string[]> {
    if (texts.length === 0) return [];
    if (source === target && source !== 'auto') return texts;

    const endpoints = this.getActiveEndpoints();
    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const results = await withExponentialBackoff(
          () => this.requestTranslation(endpoint, texts, source, target),
          {
            maxRetries: 2,
            baseDelayMs: 500,
            shouldRetry: (err) => {
              // Retry on network errors or 429 / 5xx status codes
              if (err.status === 429 || (err.status >= 500 && err.status < 600) || !err.status) {
                return true;
              }
              return false;
            },
          },
        );
        return results;
      } catch (err: any) {
        lastError = err;
        console.warn(`Endpoint ${endpoint.url} failed: ${err.message}. Trying next endpoint...`);
      }
    }

    throw lastError || new Error('All translation endpoints failed.');
  }

  /**
   * Tests connection to a specific LibreTranslate endpoint.
   */
  async testEndpoint(endpoint: TranslationEndpoint): Promise<{ success: boolean; message: string; supportedLanguages?: number }> {
    try {
      const url = `${endpoint.url.replace(/\/$/, '')}/languages`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
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
    const endpoints = this.getActiveEndpoints();
    for (const endpoint of endpoints) {
      try {
        const url = `${endpoint.url.replace(/\/$/, '')}/detect`;
        const body: Record<string, string> = { q: text };
        if (endpoint.apiKey) body.api_key = endpoint.apiKey;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0 && data[0].language) {
            return data[0].language;
          }
        }
      } catch {
        // Try next
      }
    }
    return null;
  }

  private async requestTranslation(
    endpoint: TranslationEndpoint,
    texts: string[],
    source: string,
    target: string,
  ): Promise<string[]> {
    const baseUrl = endpoint.url.replace(/\/$/, '');
    const url = `${baseUrl}/translate`;

    // LibreTranslate requires a valid 2-letter source language code (e.g., 'en').
    // If source is 'auto', detect language from first snippet or fallback to 'en'.
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
        // Ignore json parse error on non-json error page
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
    } else if (data.error) {
      const err: any = new Error(data.error);
      err.status = response.status;
      throw err;
    }

    throw new Error('Unexpected translation response structure');
  }
}

export const defaultTranslatorClient = new TranslatorClient();
