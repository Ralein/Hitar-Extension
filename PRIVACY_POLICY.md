# Hitar Privacy Policy

**Effective Date**: August 2, 2026

## 1. Overview
Hitar ("Hitar — Live Page Translator") is committed to protecting your privacy. Hitar operates as a lightweight, open-source web extension designed to translate webpage text in real-time using LibreTranslate backends.

## 2. Information We Collect and Process
Hitar does **not** track, collect, store, or sell any personal identifiable information (PII), browsing history, search logs, IP addresses, or user metadata.

### Page Text Processing
- When you trigger page translation or selection translation, visible text nodes extracted from the current web page are transmitted over HTTPS/HTTP to your configured **LibreTranslate API endpoint(s)** solely for the purpose of returning translated text.
- Text strings are temporarily cached locally on your device in browser `IndexedDB` to speed up future requests and eliminate redundant network calls. You can clear this cache at any time in Options.

## 3. Storage
All user settings (such as target language preferences, domain rules, and endpoint lists) are stored exclusively in your browser's local storage (`browser.storage.local`). This data remains strictly on your device and is never transmitted to us.

## 4. Self-Hosting Option
For maximum privacy, Hitar supports self-hosted LibreTranslate instances (e.g., via Docker on `http://localhost:5000`). When using a self-hosted endpoint, **no webpage text ever leaves your local network or server infrastructure**.

## 5. Third-Party Services
Hitar communicates only with the LibreTranslate endpoints explicitly configured in your extension settings. By default, it uses public LibreTranslate instances (such as `https://translate.argosopentech.com` or `https://libretranslate.com`). Please refer to the respective privacy policies of those public endpoints if you choose to use them.

## 6. Contact & Open Source
Hitar is fully open-source. For questions, bug reports, or audit requests, please visit our GitHub repository: [https://github.com/Ralein/Hitar-Extension](https://github.com/Ralein/Hitar-Extension)
