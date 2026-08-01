import browser from 'webextension-polyfill';
import { ExtensionSettings } from './types';
import { DEFAULT_ENDPOINTS } from './translator-client';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  endpoints: DEFAULT_ENDPOINTS,
  defaultSourceLang: 'auto',
  defaultTargetLang: 'es',
  alwaysTranslateDomains: [],
  neverTranslateDomains: [],
  perSiteTargetLangs: {},
  batchCharBudget: 2000,
  maxCacheEntries: 20000,
  autoTranslateOnLoad: false,
  theme: 'system',
};

const STORAGE_KEY = 'hitar_settings';

export async function getSettings(): Promise<ExtensionSettings> {
  try {
    const res = await browser.storage.local.get(STORAGE_KEY);
    if (res?.[STORAGE_KEY]) {
      return { ...DEFAULT_SETTINGS, ...res[STORAGE_KEY] };
    }
  } catch (err) {
    console.warn('Failed to read settings from storage:', err);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(
  newSettings: Partial<ExtensionSettings>,
): Promise<ExtensionSettings> {
  const current = await getSettings();
  const updated: ExtensionSettings = { ...current, ...newSettings };
  try {
    await browser.storage.local.set({ [STORAGE_KEY]: updated });
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
  return updated;
}

export async function getSiteRule(hostname: string): Promise<'always' | 'never' | 'default'> {
  const settings = await getSettings();
  if (settings.alwaysTranslateDomains.includes(hostname)) return 'always';
  if (settings.neverTranslateDomains.includes(hostname)) return 'never';
  return 'default';
}

export async function setSiteRule(
  hostname: string,
  rule: 'always' | 'never' | 'default',
): Promise<ExtensionSettings> {
  const settings = await getSettings();
  let always = settings.alwaysTranslateDomains.filter((d) => d !== hostname);
  let never = settings.neverTranslateDomains.filter((d) => d !== hostname);

  if (rule === 'always') always.push(hostname);
  if (rule === 'never') never.push(hostname);

  return saveSettings({
    alwaysTranslateDomains: always,
    neverTranslateDomains: never,
  });
}
