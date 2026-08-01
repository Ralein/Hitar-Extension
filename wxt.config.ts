import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifestVersion: 3,
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAseIt/4ula+/GQ5o2fgre5nqMzCyYGYudqNzDGxkHh8gN2QHgz/Zzu1f/TpxEOiG6MF6/n2EafQUT87hr08aLHyd4gVIa0nkzKq/ebuUaGlwoKlHspRpqDLsUr3nKqfq0E3Rpu0A27O+1xPDHkO11R16LqvcmFn6C16iUiUYwDrAH/+a+EIxGgikKzqxBk37LKsLHIKWCmPrRcy9kIIVu76kjGlfiHA08EayDodBJLseMtN6bMDIw0hdOI658A8xEvr9DNhz266I23lVBbDs0bumRI3ruyRQLqzpSa1DpIgTWWitqmwrRbXPE9A87wj96kaU5k5QtjXazGKhCDG6ARQIDAQAB',
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
    permissions: ['storage', 'contextMenus', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>'],
    commands: {
      'translate-page': {
        suggested_key: {
          default: 'Alt+Shift+T',
          mac: 'Command+Shift+T',
        },
        description: 'Translate current page',
      },
    },
    browser_specific_settings: {
      gecko: {
        id: 'hitar-translator@hitar.app',
        strict_min_version: '109.0',
      },
    },
  },
  modules: [],
});
