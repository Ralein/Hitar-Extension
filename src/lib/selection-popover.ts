export function showSelectionPopover(
  selectedText: string,
  rect: DOMRect,
  onTranslate: (text: string) => Promise<{ translatedText: string; sourceLang?: string }>,
) {
  removeSelectionPopover();

  const container = document.createElement('div');
  container.id = 'hitar-selection-popover';
  container.className = 'hitar-popover-root';

  const top = Math.max(10, rect.bottom + window.scrollY + 8);
  const left = Math.min(
    window.innerWidth - 340,
    Math.max(10, rect.left + window.scrollX - 20),
  );

  container.style.cssText = `
    position: absolute;
    top: ${top}px;
    left: ${left}px;
    z-index: 2147483647;
  `;

  container.innerHTML = `
    <div class="hitar-card">
      <div class="hitar-card-header">
        <div class="hitar-title">
          <svg class="hitar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 7h11a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H4" />
            <path d="m7 4-3 3 3 3" />
            <path d="M20 17H9a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3h11" />
            <path d="m17 20 3-3-3-3" />
          </svg>
          <span>Hitar Translation</span>
        </div>
        <button id="hitar-popover-close" class="hitar-close-btn" aria-label="Close">&times;</button>
      </div>

      <div class="hitar-card-body">
        <div class="hitar-source-text">${escapeHtml(selectedText)}</div>
        <div id="hitar-result-area" class="hitar-result-area">
          <div class="hitar-spinner"></div>
          <span>Translating...</span>
        </div>
      </div>

      <div class="hitar-card-footer" id="hitar-card-footer" style="display: none;">
        <button id="hitar-copy-btn" class="hitar-copy-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <span>Copy</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const closeBtn = container.querySelector('#hitar-popover-close');
  closeBtn?.addEventListener('click', removeSelectionPopover);

  const onClickOutside = (e: MouseEvent) => {
    if (!container.contains(e.target as Node)) {
      removeSelectionPopover();
      document.removeEventListener('mousedown', onClickOutside);
    }
  };
  setTimeout(() => document.addEventListener('mousedown', onClickOutside), 10);

  onTranslate(selectedText)
    .then(({ translatedText, sourceLang }) => {
      const resultArea = container.querySelector('#hitar-result-area');
      const footer = container.querySelector('#hitar-card-footer') as HTMLElement | null;

      if (resultArea) {
        resultArea.innerHTML = `<div class="hitar-translated-text">${escapeHtml(translatedText)}</div>`;
        if (sourceLang) {
          const headerTitle = container.querySelector('.hitar-title span');
          if (headerTitle) headerTitle.textContent = `Translation (${sourceLang.toUpperCase()})`;
        }
      }

      if (footer) {
        footer.style.display = 'flex';
        const copyBtn = container.querySelector('#hitar-copy-btn');
        copyBtn?.addEventListener('click', () => {
          navigator.clipboard.writeText(translatedText);
          const btnSpan = copyBtn.querySelector('span');
          if (btnSpan) btnSpan.textContent = 'Copied!';
          setTimeout(() => {
            if (btnSpan) btnSpan.textContent = 'Copy';
          }, 2000);
        });
      }
    })
    .catch((err) => {
      const resultArea = container.querySelector('#hitar-result-area');
      if (resultArea) {
        resultArea.innerHTML = `<div class="hitar-error-text">Translation failed: ${escapeHtml(err.message || 'Error')}</div>`;
      }
    });
}

export function removeSelectionPopover() {
  const existing = document.getElementById('hitar-selection-popover');
  if (existing) {
    existing.remove();
  }
}

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
