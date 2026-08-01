import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
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
