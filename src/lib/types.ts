export interface TranslationEndpoint {
  url: string;
  apiKey?: string;
  name?: string;
  enabled: boolean;
}

export interface TranslationRequest {
  q: string[];
  source: string;
  target: string;
  format?: 'text' | 'html';
  api_key?: string;
}

export interface LibreTranslateSingleResponse {
  translatedText: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
  error?: string;
}

export interface LibreTranslateBatchResponse {
  translatedText: string[];
  error?: string;
}

export interface DetectionResult {
  confidence: number;
  language: string;
}

export interface CacheEntry {
  key: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  lastAccessed: number;
}

export interface ExtensionSettings {
  endpoints: TranslationEndpoint[];
  defaultSourceLang: string;
  defaultTargetLang: string;
  alwaysTranslateDomains: string[];
  neverTranslateDomains: string[];
  perSiteTargetLangs: Record<string, string>;
  batchCharBudget: number;
  maxCacheEntries: number;
  autoTranslateOnLoad: boolean;
  theme: 'system' | 'light' | 'dark';
}

export interface TranslationBatch {
  texts: string[];
  totalChars: number;
  indices: number[];
}

export type MessageType =
  | { type: 'TRANSLATE_BATCH'; texts: string[]; source: string; target: string }
  | { type: 'DETECT_LANG'; text: string }
  | { type: 'GET_SETTINGS' }
  | { type: 'SAVE_SETTINGS'; settings: Partial<ExtensionSettings> }
  | { type: 'TEST_ENDPOINT'; endpoint: TranslationEndpoint }
  | { type: 'CLEAR_CACHE' }
  | { type: 'GET_CACHE_STATS' }
  | { type: 'TOGGLE_TRANSLATION'; enabled?: boolean }
  | { type: 'REVERT_TRANSLATION' };

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
