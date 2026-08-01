# Hitar — Live Page Translator 🌐✨

**Hitar** is a production-ready, cross-browser web extension (Chrome, Edge, Firefox) that translates the visible text of any webpage in place, live, using a free, self-hostable **LibreTranslate** backend.

![Hitar Banner](public/store-promo-440x280.png)

---

## ✨ Features

- ⚡ **In-Place Live Translation**: Translates visible DOM text while preserving layout, HTML tags, links, and inline formatting.
- 🚀 **Free & No API Key Needed**: Works out of the box with public LibreTranslate backends, or connect your own private Docker instance.
- 🔄 **Endpoint Failover & Exponential Backoff**: Automatic retries (base 500ms, max 3 retries) and priority failover to backup endpoints on HTTP 429 / 5xx errors.
- 📦 **Character-Budget Batching**: Groups DOM nodes into ~2,000 character HTTP batches to minimize requests and prevent rate-limiting.
- 💾 **IndexedDB LRU Cache**: Instant translation lookup for cached strings with a 20,000 entry LRU eviction policy.
- 🔍 **Dynamic SPA & Infinite Scroll Support**: Uses `MutationObserver` to translate dynamically added content without re-translating existing nodes.
- ⏪ **Instant "Show Original" Revert**: Toggle back to original webpage text instantly from in-memory cached references.
- 🎯 **Selection Translation Popover**: Highlight any text and right-click "Translate selection" to get a floating popover with instant copy controls.
- 🎨 **Modern Glassmorphic UI**: Sleek Popup and Options dashboard with automatic and manual Light/Dark theme switching.
- 🌐 **Per-Site Rules**: Configure "Always Translate" or "Never Translate" domain lists.
- 🛡️ **Privacy-First**: No tracking, no PII, no telemetry.

---

## 🚀 Quick Start — Local Self-Hosting (Recommended)

Public LibreTranslate instances are rate-limited and intended for light testing. For unlimited, private, key-less production translation:

```bash
docker run -p 5000:5000 libretranslate/libretranslate
```

Then open **Hitar Options** in your browser and set the primary endpoint to `http://localhost:5000`.

---

## 🛠️ Build & Load Unpacked Extension

### 1. Prerequisites
- Node.js >= 22.0
- npm >= 10.0

### 2. Build for All Browsers

```bash
# Install dependencies
npm install

# Type check & lint
npm run compile
npm run lint

# Run Unit Tests
npm run test

# Build all browser targets
npm run build:all
```

The compiled extension packages will be generated in:
- `.output/chrome-mv3` (Chrome / Brave / Opera)
- `.output/edge-mv3` (Microsoft Edge)
- `.output/firefox-mv3` (Mozilla Firefox)

---

## 🌐 Loading Unpacked Extension

### Google Chrome / Microsoft Edge
1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode** in the top-right toggle.
3. Click **Load unpacked**.
4. Select the `.output/chrome-mv3` (or `.output/edge-mv3`) directory.

### Mozilla Firefox
1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `.output/firefox-mv3/manifest.json`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| `Alt + Shift + T` (Windows/Linux) / `Cmd + Shift + T` (macOS) | Toggle page translation on/off |

---

## 🧪 Testing

```bash
# Vitest Unit Tests (Batcher, LRU Cache, Hash, Retry, DOM Walker)
npm run test

# Playwright E2E Tests
npm run test:e2e
```

---

## 📁 Directory Structure

```
.
├── .github/workflows/ci.yml # GitHub Actions CI pipeline
├── public/                 # Extension locale messages, icons, privacy.html
├── scripts/                # Asset generation scripts
├── src/
│   ├── assets/             # Tailwind & Content Script CSS styles
│   ├── entrypoints/        # Background SW, Content Script, Popup, Options
│   └── lib/                # Batcher, LRU Cache, Translator API, Retry, DOM Walker
├── tests/                  # Vitest unit tests & Playwright E2E tests
├── wxt.config.ts           # WXT cross-browser extension framework configuration
└── package.json
```

---

## 📄 License & Privacy

Hitar is open-source under the [MIT License](LICENSE). Read our [Privacy Policy](PRIVACY_POLICY.md).
