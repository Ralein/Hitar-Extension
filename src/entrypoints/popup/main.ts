import browser from 'webextension-polyfill';
import { ExtensionSettings, MessageResponse } from '@/lib/types';
import { setSiteRule } from '@/lib/storage';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

document.addEventListener('DOMContentLoaded', async () => {
  const currentHostEl = document.getElementById('current-host') as HTMLElement;
  const hostBadgeEl = document.getElementById('host-badge') as HTMLElement;
  const targetLangSelect = document.getElementById('target-lang') as HTMLSelectElement;
  const toggleBtn = document.getElementById('toggle-translate-btn') as HTMLButtonElement;
  const btnLabel = document.getElementById('btn-label') as HTMLElement;
  const btnIcon = document.getElementById('btn-icon') as HTMLElement;
  const alwaysChk = document.getElementById('always-translate-chk') as HTMLInputElement;
  const neverChk = document.getElementById('never-translate-chk') as HTMLInputElement;
  const openOptionsBtn = document.getElementById('open-options') as HTMLButtonElement;
  const themeToggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
  const sunIcon = document.getElementById('theme-icon-sun') as HTMLElement;
  const moonIcon = document.getElementById('theme-icon-moon') as HTMLElement;

  let activeTab: browser.Tabs.Tab | null = null;
  let currentHost = '';
  let isTranslatedState = false;

  // Populate target languages dynamically
  targetLangSelect.innerHTML = '';
  SUPPORTED_LANGUAGES.forEach((lang) => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = `${lang.name} (${lang.nativeName})`;
    targetLangSelect.appendChild(opt);
  });

  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  activeTab = tabs[0] || null;

  if (activeTab?.url) {
    try {
      const url = new URL(activeTab.url);
      currentHost = url.hostname;
      currentHostEl.textContent = currentHost || 'Current Page';
    } catch {
      currentHostEl.textContent = 'Special Page';
    }
  } else {
    currentHostEl.textContent = 'Active Page';
  }

  const settingsResp: MessageResponse<ExtensionSettings> = await browser.runtime.sendMessage({ type: 'GET_SETTINGS' });
  const settings: ExtensionSettings = settingsResp?.data || ({} as ExtensionSettings);

  applyTheme(settings.theme || 'system');

  themeToggleBtn.addEventListener('click', async () => {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    await browser.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      settings: { theme: newTheme },
    });
  });

  function applyTheme(theme: 'system' | 'light' | 'dark') {
    let dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark') {
      dark = true;
    } else if (theme === 'light') {
      dark = false;
    }

    if (dark) {
      document.documentElement.classList.add('dark');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }

  const siteTarget = currentHost ? settings.perSiteTargetLangs?.[currentHost] : null;
  targetLangSelect.value = siteTarget || settings.defaultTargetLang || 'id';

  targetLangSelect.addEventListener('change', async () => {
    const selectedLang = targetLangSelect.value;
    if (currentHost) {
      const updatedPerSite = { ...settings.perSiteTargetLangs, [currentHost]: selectedLang };
      await browser.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        settings: { perSiteTargetLangs: updatedPerSite },
      });
    }
  });

  const isAlways = settings.alwaysTranslateDomains?.includes(currentHost);
  const isNever = settings.neverTranslateDomains?.includes(currentHost);

  alwaysChk.checked = !!isAlways;
  neverChk.checked = !!isNever;
  updateHostBadge();

  alwaysChk.addEventListener('change', async () => {
    if (alwaysChk.checked) {
      neverChk.checked = false;
      await setSiteRule(currentHost, 'always');
    } else {
      await setSiteRule(currentHost, 'default');
    }
    updateHostBadge();
  });

  neverChk.addEventListener('change', async () => {
    if (neverChk.checked) {
      alwaysChk.checked = false;
      await setSiteRule(currentHost, 'never');
    } else {
      await setSiteRule(currentHost, 'default');
    }
    updateHostBadge();
  });

  function updateHostBadge() {
    if (alwaysChk.checked) {
      hostBadgeEl.textContent = 'ALWAYS';
      hostBadgeEl.className =
        'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
    } else if (neverChk.checked) {
      hostBadgeEl.textContent = 'NEVER';
      hostBadgeEl.className =
        'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300';
    } else {
      hostBadgeEl.textContent = 'DEFAULT';
      hostBadgeEl.className =
        'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  }

  toggleBtn.addEventListener('click', async () => {
    if (!activeTab?.id) return;
    const targetLang = targetLangSelect.value;
    
    // Show loading state on button
    toggleBtn.disabled = true;
    btnLabel.textContent = isTranslatedState ? 'Reverting...' : 'Translating...';

    try {
      let resp: any = null;
      try {
        resp = await browser.tabs.sendMessage(activeTab.id, {
          type: 'TOGGLE_TRANSLATION',
          targetLang,
        });
      } catch {
        // Automatically inject content script into tab if not already present, then retry!
        await browser.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['content-scripts/content.js'],
        });
        await browser.scripting.insertCSS({
          target: { tabId: activeTab.id },
          files: ['content-scripts/content.css'],
        });
        await new Promise((resolve) => setTimeout(resolve, 150));
        resp = await browser.tabs.sendMessage(activeTab.id, {
          type: 'TOGGLE_TRANSLATION',
          targetLang,
        });
      }

      if (resp && typeof resp.isTranslated === 'boolean') {
        isTranslatedState = resp.isTranslated;
      } else {
        isTranslatedState = !isTranslatedState;
      }
    } catch (err: any) {
      console.error('[Hitar Popup] Toggle failed:', err);
    } finally {
      toggleBtn.disabled = false;
      updateTranslateButtonState();
    }
  });

  function updateTranslateButtonState() {
    if (isTranslatedState) {
      btnLabel.textContent = 'Show Original Text';
      toggleBtn.className =
        'w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer';
      if (btnIcon) {
        btnIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>`;
      }
    } else {
      btnLabel.textContent = 'Translate Entire Page';
      toggleBtn.className =
        'w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-[0.98] text-white font-semibold text-xs tracking-wide shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer';
      if (btnIcon) {
        btnIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 5 8 8 8-8"/>`;
      }
    }
  }

  openOptionsBtn.addEventListener('click', () => {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else {
      window.open(browser.runtime.getURL('options.html'));
    }
  });
});
