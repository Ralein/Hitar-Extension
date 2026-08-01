# Changelog

All notable changes to the **Hitar** Live Page Translator project will be documented in this file.

The format is based on [Keep a Changelog](https.keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-02

### Added
- **Cross-Browser MV3 Architecture**: Single TypeScript codebase supporting Chrome, Firefox, and Edge via WXT framework and `webextension-polyfill`.
- **In-Place Webpage Translation**: Live DOM text extraction with exclusions (`<script>`, `<code>`, `<pre>`, `translate="no"`, `.notranslate`).
- **LibreTranslate Backend Integration**: Configurable endpoints, priority failover, exponential backoff retries (base 500ms, max 3 retries), and optional API key support.
- **Character-Budget Batching**: Grouping text nodes into ~2000 character HTTP POST batches to minimize network overhead and rate-limit triggers.
- **IndexedDB LRU Caching**: Keyed by `hash(sourceText + sourceLang + targetLang)` with automatic LRU eviction (~20,000 entry cap).
- **Dynamic Content Support**: `MutationObserver` watching SPAs and dynamic DOM feeds with debounced translation processing.
- **Selection Translation Popover**: Context menu & selection trigger popover card with original text display, translation, and one-click copy button.
- **Modern UI Surfaces**: Sleek glassmorphic Popup & Options pages with auto & manual Light/Dark theme switching.
- **Domain Preference Rules**: Per-site "Always Translate" and "Never Translate" domain control.
- **Store-Ready Assets & CI**: Playwright E2E tests, Vitest unit suite, GitHub Actions CI workflow, multi-resolution icons (16/32/48/128px), promo banner, Privacy Policy, and Docker self-hosting instructions.
