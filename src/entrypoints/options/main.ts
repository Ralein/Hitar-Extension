import browser from 'webextension-polyfill';
import { ExtensionSettings, TranslationEndpoint, MessageResponse } from '@/lib/types';
import { DEFAULT_ENDPOINTS } from '@/lib/translator-client';

document.addEventListener('DOMContentLoaded', async () => {
  const saveBadge = document.getElementById('save-status-badge') as HTMLElement;
  const addEndpointBtn = document.getElementById('add-endpoint-btn') as HTMLButtonElement;
  const endpointsList = document.getElementById('endpoints-list') as HTMLElement;

  const addAlwaysInput = document.getElementById('add-always-domain-input') as HTMLInputElement;
  const addAlwaysBtn = document.getElementById('add-always-domain-btn') as HTMLButtonElement;
  const alwaysList = document.getElementById('always-domains-list') as HTMLElement;

  const addNeverInput = document.getElementById('add-never-domain-input') as HTMLInputElement;
  const addNeverBtn = document.getElementById('add-never-domain-btn') as HTMLButtonElement;
  const neverList = document.getElementById('never-domains-list') as HTMLElement;

  const cacheCountEl = document.getElementById('cache-count') as HTMLElement;
  const clearCacheBtn = document.getElementById('clear-cache-btn') as HTMLButtonElement;

  const budgetSlider = document.getElementById('budget-slider') as HTMLInputElement;
  const budgetValueEl = document.getElementById('budget-value') as HTMLElement;
  const autoTranslateChk = document.getElementById('auto-translate-load-chk') as HTMLInputElement;

  let currentSettings: ExtensionSettings;

  async function loadSettings() {
    const resp: MessageResponse<ExtensionSettings> = await browser.runtime.sendMessage({ type: 'GET_SETTINGS' });
    currentSettings = resp?.data || {
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

    renderEndpoints();
    renderSiteRules();
    renderCacheStats();

    budgetSlider.value = String(currentSettings.batchCharBudget || 2000);
    budgetValueEl.textContent = `${budgetSlider.value} chars`;
    autoTranslateChk.checked = !!currentSettings.autoTranslateOnLoad;
  }

  function showSavedToast() {
    saveBadge.style.opacity = '1';
    setTimeout(() => {
      saveBadge.style.opacity = '0';
    }, 1500);
  }

  async function persist(newPartial: Partial<ExtensionSettings>) {
    const resp: MessageResponse<ExtensionSettings> = await browser.runtime.sendMessage({
      type: 'SAVE_SETTINGS',
      settings: newPartial,
    });
    if (resp?.data) {
      currentSettings = resp.data;
      showSavedToast();
    }
  }

  function renderEndpoints() {
    endpointsList.innerHTML = '';
    const endpoints = currentSettings.endpoints || DEFAULT_ENDPOINTS;

    endpoints.forEach((ep, index) => {
      const item = document.createElement('div');
      item.className =
        'flex flex-col md:flex-row gap-3 items-start md:items-center justify-between p-3 rounded-lg bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800';

      item.innerHTML = `
        <div class="flex items-center gap-3 w-full md:w-auto flex-1">
          <input type="checkbox" ${ep.enabled ? 'checked' : ''} class="ep-enable-chk w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer" />
          <div class="flex flex-col gap-1 w-full">
            <input type="text" value="${escapeHtml(ep.name || 'Endpoint')}" class="ep-name-input bg-transparent font-semibold text-xs text-slate-800 dark:text-slate-200 border-b border-transparent focus:border-brand-500 focus:outline-none" placeholder="Name" />
            <input type="text" value="${escapeHtml(ep.url)}" class="ep-url-input bg-slate-200/50 dark:bg-slate-800/50 rounded px-2 py-1 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="https://..." />
            <input type="password" value="${escapeHtml(ep.apiKey || '')}" class="ep-key-input bg-slate-200/50 dark:bg-slate-800/50 rounded px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Optional API Key (if --api-keys enabled)" />
          </div>
        </div>

        <div class="flex items-center gap-2 self-end md:self-center">
          <button class="ep-test-btn px-2.5 py-1 text-[11px] font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 transition-colors">Test</button>
          <button class="ep-delete-btn p-1 text-rose-500 hover:text-rose-700 transition-colors" title="Delete Endpoint">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `;

      const enableChk = item.querySelector('.ep-enable-chk') as HTMLInputElement;
      const nameInput = item.querySelector('.ep-name-input') as HTMLInputElement;
      const urlInput = item.querySelector('.ep-url-input') as HTMLInputElement;
      const keyInput = item.querySelector('.ep-key-input') as HTMLInputElement;
      const testBtn = item.querySelector('.ep-test-btn') as HTMLButtonElement;
      const deleteBtn = item.querySelector('.ep-delete-btn') as HTMLButtonElement;

      const updateCurrent = () => {
        endpoints[index] = {
          enabled: enableChk.checked,
          name: nameInput.value,
          url: urlInput.value.trim(),
          apiKey: keyInput.value.trim() || undefined,
        };
        persist({ endpoints });
      };

      enableChk.addEventListener('change', updateCurrent);
      nameInput.addEventListener('change', updateCurrent);
      urlInput.addEventListener('change', updateCurrent);
      keyInput.addEventListener('change', updateCurrent);

      deleteBtn.addEventListener('click', () => {
        endpoints.splice(index, 1);
        persist({ endpoints });
        renderEndpoints();
      });

      testBtn.addEventListener('click', async () => {
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;
        const testEp: TranslationEndpoint = {
          url: urlInput.value.trim(),
          apiKey: keyInput.value.trim() || undefined,
          enabled: true,
        };

        const res: MessageResponse = await browser.runtime.sendMessage({
          type: 'TEST_ENDPOINT',
          endpoint: testEp,
        });

        testBtn.disabled = false;
        if (res?.data?.success) {
          testBtn.textContent = 'Connected ✓';
          testBtn.className =
            'ep-test-btn px-2.5 py-1 text-[11px] font-medium bg-emerald-600 text-white rounded';
        } else {
          testBtn.textContent = 'Failed ✗';
          testBtn.className =
            'ep-test-btn px-2.5 py-1 text-[11px] font-medium bg-rose-600 text-white rounded';
          alert(`Connection failed: ${res?.data?.message || 'Unknown error'}`);
        }
      });

      endpointsList.appendChild(item);
    });
  }

  addEndpointBtn.addEventListener('click', () => {
    const endpoints = currentSettings.endpoints || [];
    endpoints.push({
      url: 'http://localhost:5000',
      name: 'Custom Endpoint',
      enabled: true,
    });
    persist({ endpoints });
    renderEndpoints();
  });

  function renderSiteRules() {
    alwaysList.innerHTML = '';
    (currentSettings.alwaysTranslateDomains || []).forEach((domain) => {
      const li = document.createElement('li');
      li.className =
        'flex items-center justify-between p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800';
      li.innerHTML = `
        <span class="font-mono text-slate-700 dark:text-slate-300">${escapeHtml(domain)}</span>
        <button class="remove-btn text-rose-500 hover:text-rose-700 font-bold px-1">&times;</button>
      `;
      li.querySelector('.remove-btn')?.addEventListener('click', () => {
        const updated = currentSettings.alwaysTranslateDomains.filter((d) => d !== domain);
        persist({ alwaysTranslateDomains: updated });
        renderSiteRules();
      });
      alwaysList.appendChild(li);
    });

    neverList.innerHTML = '';
    (currentSettings.neverTranslateDomains || []).forEach((domain) => {
      const li = document.createElement('li');
      li.className =
        'flex items-center justify-between p-1.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800';
      li.innerHTML = `
        <span class="font-mono text-slate-700 dark:text-slate-300">${escapeHtml(domain)}</span>
        <button class="remove-btn text-rose-500 hover:text-rose-700 font-bold px-1">&times;</button>
      `;
      li.querySelector('.remove-btn')?.addEventListener('click', () => {
        const updated = currentSettings.neverTranslateDomains.filter((d) => d !== domain);
        persist({ neverTranslateDomains: updated });
        renderSiteRules();
      });
      neverList.appendChild(li);
    });
  }

  addAlwaysBtn.addEventListener('click', () => {
    const val = addAlwaysInput.value.trim().toLowerCase();
    if (val && !currentSettings.alwaysTranslateDomains.includes(val)) {
      const updated = [...currentSettings.alwaysTranslateDomains, val];
      addAlwaysInput.value = '';
      persist({ alwaysTranslateDomains: updated });
      renderSiteRules();
    }
  });

  addNeverBtn.addEventListener('click', () => {
    const val = addNeverInput.value.trim().toLowerCase();
    if (val && !currentSettings.neverTranslateDomains.includes(val)) {
      const updated = [...currentSettings.neverTranslateDomains, val];
      addNeverInput.value = '';
      persist({ neverTranslateDomains: updated });
      renderSiteRules();
    }
  });

  async function renderCacheStats() {
    const resp: MessageResponse = await browser.runtime.sendMessage({ type: 'GET_CACHE_STATS' });
    if (resp?.data) {
      cacheCountEl.textContent = `${resp.data.count.toLocaleString()} / ${(resp.data.maxEntries || 20000).toLocaleString()} entries`;
    }
  }

  clearCacheBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear the entire translation cache?')) {
      await browser.runtime.sendMessage({ type: 'CLEAR_CACHE' });
      renderCacheStats();
      showSavedToast();
    }
  });

  budgetSlider.addEventListener('input', () => {
    budgetValueEl.textContent = `${budgetSlider.value} chars`;
  });

  budgetSlider.addEventListener('change', () => {
    persist({ batchCharBudget: Number(budgetSlider.value) });
  });

  autoTranslateChk.addEventListener('change', () => {
    persist({ autoTranslateOnLoad: autoTranslateChk.checked });
  });

  function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  await loadSettings();
});
