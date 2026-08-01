import { defineContentScript } from 'wxt/sandbox';
import browser from 'webextension-polyfill';
import {
  collectTextNodes,
  markNodesAsTranslating,
  applyNodeTranslations,
  revertTranslations,
  TranslatableNodeInfo,
} from '@/lib/dom-walker';
import { showSelectionPopover } from '@/lib/selection-popover';
import { MessageResponse } from '@/lib/types';
import '@/assets/content.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    console.log('[Hitar Content Script] Loaded on', window.location.hostname);

    let isTranslated = false;
    let observer: MutationObserver | null = null;
    let mutationBuffer: Node[] = [];
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let currentTargetLang = 'es';

    function detectDocLang(): string {
      const htmlLang = document.documentElement.lang || document.body?.getAttribute('lang');
      if (htmlLang && htmlLang.length >= 2) {
        return htmlLang.slice(0, 2).toLowerCase();
      }
      return 'auto';
    }

    async function translatePage(targetLang?: string) {
      const settingsResp: MessageResponse = await browser.runtime.sendMessage({ type: 'GET_SETTINGS' });
      const settings = settingsResp?.data || {};

      const sourceLang = detectDocLang();
      const target = targetLang || settings.perSiteTargetLangs?.[window.location.hostname] || settings.defaultTargetLang || 'es';
      currentTargetLang = target;

      const nodeInfos = collectTextNodes(document.body);
      if (nodeInfos.length === 0) return;

      markNodesAsTranslating(nodeInfos);
      isTranslated = true;

      const texts = nodeInfos.map((n) => n.originalText);
      try {
        const response: MessageResponse = await browser.runtime.sendMessage({
          type: 'TRANSLATE_BATCH',
          texts,
          source: sourceLang,
          target,
        });

        if (response?.success && Array.isArray(response.data)) {
          applyNodeTranslations(nodeInfos, response.data);
          startMutationObserver();
        } else {
          console.error('[Hitar Content Script] Translation batch failed:', response?.error);
          applyNodeTranslations(nodeInfos, []);
        }
      } catch (err) {
        console.error('[Hitar Content Script] Communication error:', err);
        applyNodeTranslations(nodeInfos, []);
      }
    }

    function revertPage() {
      revertTranslations(document.body);
      isTranslated = false;
      stopMutationObserver();
    }

    function startMutationObserver() {
      if (observer) return;

      observer = new MutationObserver((mutations) => {
        if (!isTranslated) return;

        for (const mut of mutations) {
          mut.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              mutationBuffer.push(node);
            }
          });
        }

        if (mutationBuffer.length > 0) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            processMutations();
          }, 300);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    function stopMutationObserver() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }

    async function processMutations() {
      const nodesToProcess = [...mutationBuffer];
      mutationBuffer = [];

      const newInfos: TranslatableNodeInfo[] = [];
      nodesToProcess.forEach((parent) => {
        newInfos.push(...collectTextNodes(parent));
      });

      if (newInfos.length === 0) return;

      markNodesAsTranslating(newInfos);

      const sourceLang = detectDocLang();
      const texts = newInfos.map((n) => n.originalText);

      try {
        const response: MessageResponse = await browser.runtime.sendMessage({
          type: 'TRANSLATE_BATCH',
          texts,
          source: sourceLang,
          target: currentTargetLang,
        });

        if (response?.success && Array.isArray(response.data)) {
          applyNodeTranslations(newInfos, response.data);
        } else {
          applyNodeTranslations(newInfos, []);
        }
      } catch {
        applyNodeTranslations(newInfos, []);
      }
    }

    // Check auto-translate preference on page load
    browser.runtime.sendMessage({ type: 'GET_SETTINGS' }).then((res: any) => {
      const settings = res?.data;
      if (!settings) return;

      const host = window.location.hostname;
      const isAlways = settings.alwaysTranslateDomains?.includes(host);
      const isNever = settings.neverTranslateDomains?.includes(host);

      if (isNever) return;
      if (isAlways || settings.autoTranslateOnLoad) {
        translatePage();
      }
    });

    // Listen for messages from Popup / Context Menu / Commands
    browser.runtime.onMessage.addListener((message: any): Promise<any> | void => {
      if (message.type === 'TOGGLE_TRANSLATION') {
        if (isTranslated) {
          revertPage();
        } else {
          translatePage(message.targetLang);
        }
        return Promise.resolve({ success: true, isTranslated });
      }

      if (message.type === 'REVERT_TRANSLATION') {
        revertPage();
        return Promise.resolve({ success: true, isTranslated: false });
      }

      if (message.type === 'TRANSLATE_SELECTION_TRIGGER') {
        const selection = window.getSelection();
        const selectedText = message.selectionText || selection?.toString().trim();
        if (selectedText && selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          showSelectionPopover(selectedText, rect, async (text) => {
            const resp: MessageResponse = await browser.runtime.sendMessage({
              type: 'TRANSLATE_BATCH',
              texts: [text],
              source: detectDocLang(),
              target: currentTargetLang,
            });
            return { translatedText: resp?.data?.[0] || text };
          });
        }
        return Promise.resolve({ success: true });
      }
    });
  },
});
