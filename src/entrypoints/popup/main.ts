import browser from 'webextension-polyfill';
import { ExtensionSettings } from '@/lib/types';
import { setSiteRule } from '@/lib/storage';

document.addEventListener('DOMContentLoaded', async () => {
  const currentHostEl = document.getElementById('current-host') as HTMLElement;
  const hostBadgeEl = document.getElementById('host-badge') as HTMLElement;
  const targetLangSelect = document.getElementById('target-lang') as HTMLSelectElement;
  const toggleBtn = document.getElementById('toggle-translate-btn') as HTMLButtonElement;
  const btnLabel = document.getElementById('btn-label') as HTMLElement;
  const alwaysChk = document.getElementById('always-translate-chk') as HTMLInputElement;
  const neverChk = document.getElementById('never-translate-chk') as HTMLInputElement;
  const openOptionsBtn = document.getElementById('open-options') as HTMLButtonElement;
  const themeToggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
  const sunIcon = document.getElementById('theme-icon-sun') as HTMLElement;
  const moonIcon = document.getElementById('theme-icon-moon') as HTMLElement;

  let activeTab: browser.Tabs.Tab | null = null;
  let currentHost = '';
  let isTranslatedState = false;

  // Fetch current active tab and settings
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

  // Get current extension settings
  const settingsResp = await browser.runtime.sendMessage({ type: 'GET_SETTINGS' });
  const settings: ExtensionSettings = settingsResp?.data || {};

  // Theme setup
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
    let dark = false;
    if (theme === 'dark') dark = true;
    else if (theme === 'light') dark = false;
    else dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

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

  // Target language setup
  const siteTarget = currentHost ? settings.perSiteTargetLangs?.[currentHost] : null;
  targetLangSelect.value = siteTarget || settings.defaultTargetLang || 'es';

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

  // Host rule setup
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

  // Toggle Translate button
  toggleBtn.addEventListener('click', async () => {
    if (!activeTab?.id) return;
    const targetLang = targetLangSelect.value;
    try {
      const resp = await browser.tabs.sendMessage(activeTab.id, {
        type: 'TOGGLE_TRANSLATION',
        targetLang,
      });

      if (resp && typeof resp.isTranslated === 'boolean') {
        isTranslatedState = resp.isTranslated;
        updateTranslateButtonState();
      }
    } catch {
      btnLabel.textContent = 'Refresh page to use Hitar';
    }
  });

  function updateTranslateButtonState() {
    if (isTranslatedState) {
      btnLabel.textContent = 'Show Original';
      toggleBtn.className =
        'w-full py-2.5 px-4 rounded-lg bg-slate-700 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2';
    } else {
      btnLabel.textContent = 'Translate Page';
      toggleBtn.className =
        'w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-semibold text-xs tracking-wide shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2';
    }
  }

  // Options Page button
  openOptionsBtn.addEventListener('click', () => {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else {
      window.open(browser.runtime.getURL('options.html'));
    }
  });
});
