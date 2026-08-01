import { defineBackground } from 'wxt/sandbox';
import browser from 'webextension-polyfill';
import { defaultTranslatorClient } from '@/lib/translator-client';
import { translationCache } from '@/lib/cache';
import { createBatches } from '@/lib/batcher';
import { getSettings, saveSettings } from '@/lib/storage';
import { MessageType, MessageResponse } from '@/lib/types';

export default defineBackground(() => {
  console.log('[Hitar Background] Service worker initialized.');

  // Initialize context menu on startup/install
  browser.runtime.onInstalled.addListener(() => {
    setupContextMenu();
  });

  setupContextMenu();

  // Listen for extension shortcut commands (Alt+Shift+T)
  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'translate-page') {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_TRANSLATION' });
      }
    }
  });

  // Listen for context menu clicks
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) return;
    if (info.menuItemId === 'hitar_translate_page') {
      browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_TRANSLATION' });
    } else if (info.menuItemId === 'hitar_translate_selection' && info.selectionText) {
      browser.tabs.sendMessage(tab.id, {
        type: 'TRANSLATE_SELECTION_TRIGGER',
        selectionText: info.selectionText,
      });
    }
  });

  // Central RPC Message Handler
  browser.runtime.onMessage.addListener(
    (message: unknown, _sender: browser.Runtime.MessageSender): Promise<MessageResponse> => {
      return handleMessage(message as MessageType);
    },
  );
});

function setupContextMenu() {
  browser.contextMenus.removeAll().then(() => {
    browser.contextMenus.create({
      id: 'hitar_translate_page',
      title: 'Translate this page with Hitar',
      contexts: ['page'],
    });

    browser.contextMenus.create({
      id: 'hitar_translate_selection',
      title: 'Translate selection ("%s")',
      contexts: ['selection'],
    });
  });
}

async function handleMessage(message: MessageType): Promise<MessageResponse> {
  try {
    switch (message.type) {
      case 'TRANSLATE_BATCH': {
        const { texts, source, target } = message;
        const settings = await getSettings();
        defaultTranslatorClient.updateEndpoints(settings.endpoints);

        // 1. Look up cached items first
        const cacheHits = await translationCache.getMany(texts, source, target);
        const finalResults: string[] = new Array(texts.length);
        const uncachedTexts: string[] = [];
        const uncachedIndices: number[] = [];

        texts.forEach((text, i) => {
          if (cacheHits.has(text)) {
            finalResults[i] = cacheHits.get(text)!;
          } else {
            uncachedTexts.push(text);
            uncachedIndices.push(i);
          }
        });

        // 2. If uncached items exist, batch and translate them
        if (uncachedTexts.length > 0) {
          const batches = createBatches(uncachedTexts, settings.batchCharBudget);
          const newCacheEntries: Array<{ sourceText: string; translatedText: string }> = [];

          for (const batch of batches) {
            const translatedBatch = await defaultTranslatorClient.translateBatch(
              batch.texts,
              source,
              target,
            );

            batch.texts.forEach((original, idx) => {
              const translated = translatedBatch[idx] || original;
              const uncachedIndex = batch.indices[idx];
              const originalIndex = uncachedIndices[uncachedIndex];
              finalResults[originalIndex] = translated;
              newCacheEntries.push({ sourceText: original, translatedText: translated });
            });
          }

          // 3. Save new translations to IndexedDB cache
          await translationCache.setMany(newCacheEntries, source, target);
        }

        return { success: true, data: finalResults };
      }

      case 'DETECT_LANG': {
        const settings = await getSettings();
        defaultTranslatorClient.updateEndpoints(settings.endpoints);
        const detected = await defaultTranslatorClient.detectLanguage(message.text);
        return { success: true, data: detected };
      }

      case 'GET_SETTINGS': {
        const settings = await getSettings();
        return { success: true, data: settings };
      }

      case 'SAVE_SETTINGS': {
        const updated = await saveSettings(message.settings);
        defaultTranslatorClient.updateEndpoints(updated.endpoints);
        return { success: true, data: updated };
      }

      case 'TEST_ENDPOINT': {
        const result = await defaultTranslatorClient.testEndpoint(message.endpoint);
        return { success: true, data: result };
      }

      case 'CLEAR_CACHE': {
        await translationCache.clear();
        return { success: true, data: 'Cache cleared successfully' };
      }

      case 'GET_CACHE_STATS': {
        const stats = await translationCache.getStats();
        return { success: true, data: stats };
      }

      default:
        return { success: false, error: 'Unknown message type' };
    }
  } catch (err: any) {
    console.error('[Hitar Background] Error handling message:', err);
    return { success: false, error: err.message || 'Internal error' };
  }
}
