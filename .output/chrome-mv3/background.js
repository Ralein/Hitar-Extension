var background = (function() {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  var _a;
  function defineBackground(arg) {
    if (arg == null || typeof arg === "function") return { main: arg };
    return arg;
  }
  var MatchPattern = (_a = class {
    /**
    * Parse a match pattern string. If it is invalid, the constructor will throw an
    * `InvalidMatchPattern` error.
    *
    * @param matchPattern The match pattern to parse.
    */
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._a.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null) throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    /** Check if a URL is included in a pattern. */
    includes(url) {
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      if (this.isAllUrls) return !this.isUnknownProtocol(u);
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http") return this.isHttpMatch(u);
        if (protocol === "https") return this.isHttpsMatch(u);
        if (protocol === "file") return this.isFileMatch(u);
        if (protocol === "ftp") return this.isFtpMatch(u);
        if (protocol === "urn") return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch) return false;
      const hostnameMatchRegexs = [this.convertPatternToRegex(this.hostnameMatch), this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isUnknownProtocol(url) {
      return !this.protocolMatches.includes(url.protocol.slice(0, -1));
    }
    isPathMatch(url) {
      if (!this.pathnameMatch) return false;
      return this.convertPatternToRegex(this.pathnameMatch).test(url.pathname);
    }
    isFileMatch(url) {
      return url.protocol === "file:" && this.isPathMatch(url);
    }
    isFtpMatch(_url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(_url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const starsReplaced = this.escapeForRegex(pattern).replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }, _a.PROTOCOLS = [
    "http",
    "https",
    "file",
    "ftp",
    "urn",
    "ws",
    "wss"
  ], _a);
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*") throw new InvalidMatchPattern(matchPattern, `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`);
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":")) throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*.")) throw new InvalidMatchPattern(matchPattern, `If using a wildcard (*), it must go at the start of the hostname`);
  }
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var browserPolyfill$1 = { exports: {} };
  var browserPolyfill = browserPolyfill$1.exports;
  var hasRequiredBrowserPolyfill;
  function requireBrowserPolyfill() {
    if (hasRequiredBrowserPolyfill) return browserPolyfill$1.exports;
    hasRequiredBrowserPolyfill = 1;
    (function(module, exports) {
      (function(global, factory) {
        {
          factory(module);
        }
      })(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : browserPolyfill, function(module2) {
        if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id)) {
          throw new Error("This script should only be loaded in a browser extension.");
        }
        if (!(globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)) {
          const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
          const wrapAPIs = (extensionAPIs) => {
            const apiMetadata = {
              "alarms": {
                "clear": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "clearAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "get": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "bookmarks": {
                "create": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getChildren": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getRecent": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getSubTree": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getTree": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "move": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeTree": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "search": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              },
              "browserAction": {
                "disable": {
                  "minArgs": 0,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "enable": {
                  "minArgs": 0,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "getBadgeBackgroundColor": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getBadgeText": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getPopup": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getTitle": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "openPopup": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "setBadgeBackgroundColor": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setBadgeText": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setIcon": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "setPopup": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setTitle": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                }
              },
              "browsingData": {
                "remove": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "removeCache": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeCookies": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeDownloads": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeFormData": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeHistory": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeLocalStorage": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removePasswords": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removePluginData": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "settings": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "commands": {
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "contextMenus": {
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              },
              "cookies": {
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAllCookieStores": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "set": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "devtools": {
                "inspectedWindow": {
                  "eval": {
                    "minArgs": 1,
                    "maxArgs": 2,
                    "singleCallbackArg": false
                  }
                },
                "panels": {
                  "create": {
                    "minArgs": 3,
                    "maxArgs": 3,
                    "singleCallbackArg": true
                  },
                  "elements": {
                    "createSidebarPane": {
                      "minArgs": 1,
                      "maxArgs": 1
                    }
                  }
                }
              },
              "downloads": {
                "cancel": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "download": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "erase": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getFileIcon": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "open": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "pause": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeFile": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "resume": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "search": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "show": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                }
              },
              "extension": {
                "isAllowedFileSchemeAccess": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "isAllowedIncognitoAccess": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "history": {
                "addUrl": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "deleteAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "deleteRange": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "deleteUrl": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getVisits": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "search": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "i18n": {
                "detectLanguage": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAcceptLanguages": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "identity": {
                "launchWebAuthFlow": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "idle": {
                "queryState": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "management": {
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getSelf": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "setEnabled": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "uninstallSelf": {
                  "minArgs": 0,
                  "maxArgs": 1
                }
              },
              "notifications": {
                "clear": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "create": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getPermissionLevel": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              },
              "pageAction": {
                "getPopup": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getTitle": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "hide": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setIcon": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "setPopup": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "setTitle": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                },
                "show": {
                  "minArgs": 1,
                  "maxArgs": 1,
                  "fallbackToNoCallback": true
                }
              },
              "permissions": {
                "contains": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "request": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "runtime": {
                "getBackgroundPage": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getPlatformInfo": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "openOptionsPage": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "requestUpdateCheck": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "sendMessage": {
                  "minArgs": 1,
                  "maxArgs": 3
                },
                "sendNativeMessage": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "setUninstallURL": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "sessions": {
                "getDevices": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getRecentlyClosed": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "restore": {
                  "minArgs": 0,
                  "maxArgs": 1
                }
              },
              "storage": {
                "local": {
                  "clear": {
                    "minArgs": 0,
                    "maxArgs": 0
                  },
                  "get": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "getBytesInUse": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "remove": {
                    "minArgs": 1,
                    "maxArgs": 1
                  },
                  "set": {
                    "minArgs": 1,
                    "maxArgs": 1
                  }
                },
                "managed": {
                  "get": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "getBytesInUse": {
                    "minArgs": 0,
                    "maxArgs": 1
                  }
                },
                "sync": {
                  "clear": {
                    "minArgs": 0,
                    "maxArgs": 0
                  },
                  "get": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "getBytesInUse": {
                    "minArgs": 0,
                    "maxArgs": 1
                  },
                  "remove": {
                    "minArgs": 1,
                    "maxArgs": 1
                  },
                  "set": {
                    "minArgs": 1,
                    "maxArgs": 1
                  }
                }
              },
              "tabs": {
                "captureVisibleTab": {
                  "minArgs": 0,
                  "maxArgs": 2
                },
                "create": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "detectLanguage": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "discard": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "duplicate": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "executeScript": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "get": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getCurrent": {
                  "minArgs": 0,
                  "maxArgs": 0
                },
                "getZoom": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getZoomSettings": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "goBack": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "goForward": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "highlight": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "insertCSS": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "move": {
                  "minArgs": 2,
                  "maxArgs": 2
                },
                "query": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "reload": {
                  "minArgs": 0,
                  "maxArgs": 2
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "removeCSS": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "sendMessage": {
                  "minArgs": 2,
                  "maxArgs": 3
                },
                "setZoom": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "setZoomSettings": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "update": {
                  "minArgs": 1,
                  "maxArgs": 2
                }
              },
              "topSites": {
                "get": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "webNavigation": {
                "getAllFrames": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "getFrame": {
                  "minArgs": 1,
                  "maxArgs": 1
                }
              },
              "webRequest": {
                "handlerBehaviorChanged": {
                  "minArgs": 0,
                  "maxArgs": 0
                }
              },
              "windows": {
                "create": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "get": {
                  "minArgs": 1,
                  "maxArgs": 2
                },
                "getAll": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getCurrent": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "getLastFocused": {
                  "minArgs": 0,
                  "maxArgs": 1
                },
                "remove": {
                  "minArgs": 1,
                  "maxArgs": 1
                },
                "update": {
                  "minArgs": 2,
                  "maxArgs": 2
                }
              }
            };
            if (Object.keys(apiMetadata).length === 0) {
              throw new Error("api-metadata.json has not been included in browser-polyfill");
            }
            class DefaultWeakMap extends WeakMap {
              constructor(createItem, items = void 0) {
                super(items);
                this.createItem = createItem;
              }
              get(key) {
                if (!this.has(key)) {
                  this.set(key, this.createItem(key));
                }
                return super.get(key);
              }
            }
            const isThenable = (value) => {
              return value && typeof value === "object" && typeof value.then === "function";
            };
            const makeCallback = (promise, metadata) => {
              return (...callbackArgs) => {
                if (extensionAPIs.runtime.lastError) {
                  promise.reject(new Error(extensionAPIs.runtime.lastError.message));
                } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
                  promise.resolve(callbackArgs[0]);
                } else {
                  promise.resolve(callbackArgs);
                }
              };
            };
            const pluralizeArguments = (numArgs) => numArgs == 1 ? "argument" : "arguments";
            const wrapAsyncFunction = (name, metadata) => {
              return function asyncFunctionWrapper(target, ...args) {
                if (args.length < metadata.minArgs) {
                  throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
                }
                if (args.length > metadata.maxArgs) {
                  throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
                }
                return new Promise((resolve, reject) => {
                  if (metadata.fallbackToNoCallback) {
                    try {
                      target[name](...args, makeCallback({
                        resolve,
                        reject
                      }, metadata));
                    } catch (cbError) {
                      console.warn(`${name} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, cbError);
                      target[name](...args);
                      metadata.fallbackToNoCallback = false;
                      metadata.noCallback = true;
                      resolve();
                    }
                  } else if (metadata.noCallback) {
                    target[name](...args);
                    resolve();
                  } else {
                    target[name](...args, makeCallback({
                      resolve,
                      reject
                    }, metadata));
                  }
                });
              };
            };
            const wrapMethod = (target, method, wrapper) => {
              return new Proxy(method, {
                apply(targetMethod, thisObj, args) {
                  return wrapper.call(thisObj, target, ...args);
                }
              });
            };
            let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
            const wrapObject = (target, wrappers = {}, metadata = {}) => {
              let cache = /* @__PURE__ */ Object.create(null);
              let handlers = {
                has(proxyTarget2, prop) {
                  return prop in target || prop in cache;
                },
                get(proxyTarget2, prop, receiver) {
                  if (prop in cache) {
                    return cache[prop];
                  }
                  if (!(prop in target)) {
                    return void 0;
                  }
                  let value = target[prop];
                  if (typeof value === "function") {
                    if (typeof wrappers[prop] === "function") {
                      value = wrapMethod(target, target[prop], wrappers[prop]);
                    } else if (hasOwnProperty(metadata, prop)) {
                      let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                      value = wrapMethod(target, target[prop], wrapper);
                    } else {
                      value = value.bind(target);
                    }
                  } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
                    value = wrapObject(value, wrappers[prop], metadata[prop]);
                  } else if (hasOwnProperty(metadata, "*")) {
                    value = wrapObject(value, wrappers[prop], metadata["*"]);
                  } else {
                    Object.defineProperty(cache, prop, {
                      configurable: true,
                      enumerable: true,
                      get() {
                        return target[prop];
                      },
                      set(value2) {
                        target[prop] = value2;
                      }
                    });
                    return value;
                  }
                  cache[prop] = value;
                  return value;
                },
                set(proxyTarget2, prop, value, receiver) {
                  if (prop in cache) {
                    cache[prop] = value;
                  } else {
                    target[prop] = value;
                  }
                  return true;
                },
                defineProperty(proxyTarget2, prop, desc) {
                  return Reflect.defineProperty(cache, prop, desc);
                },
                deleteProperty(proxyTarget2, prop) {
                  return Reflect.deleteProperty(cache, prop);
                }
              };
              let proxyTarget = Object.create(target);
              return new Proxy(proxyTarget, handlers);
            };
            const wrapEvent = (wrapperMap) => ({
              addListener(target, listener, ...args) {
                target.addListener(wrapperMap.get(listener), ...args);
              },
              hasListener(target, listener) {
                return target.hasListener(wrapperMap.get(listener));
              },
              removeListener(target, listener) {
                target.removeListener(wrapperMap.get(listener));
              }
            });
            const onRequestFinishedWrappers = new DefaultWeakMap((listener) => {
              if (typeof listener !== "function") {
                return listener;
              }
              return function onRequestFinished(req) {
                const wrappedReq = wrapObject(req, {}, {
                  getContent: {
                    minArgs: 0,
                    maxArgs: 0
                  }
                });
                listener(wrappedReq);
              };
            });
            const onMessageWrappers = new DefaultWeakMap((listener) => {
              if (typeof listener !== "function") {
                return listener;
              }
              return function onMessage(message, sender, sendResponse) {
                let didCallSendResponse = false;
                let wrappedSendResponse;
                let sendResponsePromise = new Promise((resolve) => {
                  wrappedSendResponse = function(response) {
                    didCallSendResponse = true;
                    resolve(response);
                  };
                });
                let result2;
                try {
                  result2 = listener(message, sender, wrappedSendResponse);
                } catch (err) {
                  result2 = Promise.reject(err);
                }
                const isResultThenable = result2 !== true && isThenable(result2);
                if (result2 !== true && !isResultThenable && !didCallSendResponse) {
                  return false;
                }
                const sendPromisedResult = (promise) => {
                  promise.then((msg) => {
                    sendResponse(msg);
                  }, (error) => {
                    let message2;
                    if (error && (error instanceof Error || typeof error.message === "string")) {
                      message2 = error.message;
                    } else {
                      message2 = "An unexpected error occurred";
                    }
                    sendResponse({
                      __mozWebExtensionPolyfillReject__: true,
                      message: message2
                    });
                  }).catch((err) => {
                    console.error("Failed to send onMessage rejected reply", err);
                  });
                };
                if (isResultThenable) {
                  sendPromisedResult(result2);
                } else {
                  sendPromisedResult(sendResponsePromise);
                }
                return true;
              };
            });
            const wrappedSendMessageCallback = ({
              reject,
              resolve
            }, reply) => {
              if (extensionAPIs.runtime.lastError) {
                if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
                  resolve();
                } else {
                  reject(new Error(extensionAPIs.runtime.lastError.message));
                }
              } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
                reject(new Error(reply.message));
              } else {
                resolve(reply);
              }
            };
            const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
              if (args.length < metadata.minArgs) {
                throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
              }
              if (args.length > metadata.maxArgs) {
                throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
              }
              return new Promise((resolve, reject) => {
                const wrappedCb = wrappedSendMessageCallback.bind(null, {
                  resolve,
                  reject
                });
                args.push(wrappedCb);
                apiNamespaceObj.sendMessage(...args);
              });
            };
            const staticWrappers = {
              devtools: {
                network: {
                  onRequestFinished: wrapEvent(onRequestFinishedWrappers)
                }
              },
              runtime: {
                onMessage: wrapEvent(onMessageWrappers),
                onMessageExternal: wrapEvent(onMessageWrappers),
                sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                  minArgs: 1,
                  maxArgs: 3
                })
              },
              tabs: {
                sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
                  minArgs: 2,
                  maxArgs: 3
                })
              }
            };
            const settingMetadata = {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            };
            apiMetadata.privacy = {
              network: {
                "*": settingMetadata
              },
              services: {
                "*": settingMetadata
              },
              websites: {
                "*": settingMetadata
              }
            };
            return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
          };
          module2.exports = wrapAPIs(chrome);
        } else {
          module2.exports = globalThis.browser;
        }
      });
    })(browserPolyfill$1);
    return browserPolyfill$1.exports;
  }
  var browserPolyfillExports = requireBrowserPolyfill();
  const originalBrowser = /* @__PURE__ */ getDefaultExportFromCjs(browserPolyfillExports);
  function calculateJitterDelay(attempt, baseDelayMs) {
    const delay = baseDelayMs * Math.pow(2, attempt - 1);
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomVal = array[0] / 4294967295;
    return delay + randomVal * 100;
  }
  async function withExponentialBackoff(fn, options = {}) {
    const maxRetries = options.maxRetries ?? 3;
    const baseDelayMs = options.baseDelayMs ?? 500;
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          throw error;
        }
        if (options.shouldRetry && !options.shouldRetry(error)) {
          throw error;
        }
        if (options.onRetry) {
          options.onRetry(attempt, error);
        }
        const totalDelay = calculateJitterDelay(attempt, baseDelayMs);
        await new Promise((resolve) => setTimeout(resolve, totalDelay));
      }
    }
  }
  background;
  const DEFAULT_ENDPOINTS = [
    {
      url: "https://translate.googleapis.com",
      name: "Google Translate Fast Multi-Batch Engine",
      enabled: true
    },
    {
      url: "https://translate.argosopentech.com",
      name: "Argos Open Tech (Public LibreTranslate)",
      enabled: true
    },
    {
      url: "https://libretranslate.com",
      name: "LibreTranslate (Official Public)",
      enabled: true
    },
    {
      url: "http://localhost:5000",
      name: "Local Docker Instance (LibreTranslate)",
      enabled: false
    }
  ];
  class TranslatorClient {
    constructor(endpoints = DEFAULT_ENDPOINTS) {
      this.endpoints = endpoints;
    }
    updateEndpoints(endpoints) {
      this.endpoints = endpoints;
    }
    getActiveEndpoints() {
      const active = this.endpoints.filter((e) => e.enabled);
      return active.length > 0 ? active : DEFAULT_ENDPOINTS;
    }
    /**
     * Translates array of text strings using ultra-fast joined multi-text batching.
     * Blazing fast speed (~100-200ms total for entire web page).
     */
    async translateBatch(texts, source, target) {
      if (texts.length === 0) return [];
      if (source === target && source !== "auto") return texts;
      const resolvedSource = source === "auto" ? "auto" : source;
      try {
        return await this.translateWithGoogleGTXFast(texts, resolvedSource, target);
      } catch (err) {
        console.warn("Google GTX Fast Engine failed, falling back to endpoints...", err.message);
      }
      const endpoints = this.getActiveEndpoints();
      for (const endpoint of endpoints) {
        if (endpoint.url.includes("googleapis")) continue;
        try {
          return await withExponentialBackoff(
            () => this.requestLibreTranslate(endpoint, texts, resolvedSource, target),
            { maxRetries: 1, baseDelayMs: 250 }
          );
        } catch (err) {
          console.warn(`Endpoint ${endpoint.url} failed: ${err.message}. Trying next...`);
        }
      }
      try {
        return await this.translateWithLingva(texts, resolvedSource, target);
      } catch (err) {
        console.error("All translation engines failed:", err.message);
      }
      return texts;
    }
    /**
     * Ultra-Fast Joined Multi-Text Batch Translator.
     * Combines multiple text nodes into single HTTP requests using unique newline delimiters.
     */
    async translateWithGoogleGTXFast(texts, source, target) {
      const DELIMITER = "\n---\n";
      const MAX_CHUNK_CHARS = 1800;
      const chunks = [];
      let currentChunk = [];
      let currentIndices = [];
      let currentLength = 0;
      texts.forEach((text, index) => {
        const sanitized = text.replace(/\n---\n/g, " ");
        const len = sanitized.length + DELIMITER.length;
        if (currentLength + len > MAX_CHUNK_CHARS && currentChunk.length > 0) {
          chunks.push({
            joinedText: currentChunk.join(DELIMITER),
            count: currentChunk.length,
            originalIndices: currentIndices
          });
          currentChunk = [];
          currentIndices = [];
          currentLength = 0;
        }
        currentChunk.push(sanitized);
        currentIndices.push(index);
        currentLength += len;
      });
      if (currentChunk.length > 0) {
        chunks.push({
          joinedText: currentChunk.join(DELIMITER),
          count: currentChunk.length,
          originalIndices: currentIndices
        });
      }
      const finalResults = new Array(texts.length);
      const sl = source || "auto";
      const tl = target || "en";
      const chunkPromises = chunks.map(async (chunk) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
          sl
        )}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(chunk.joinedText)}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Google GTX HTTP ${response.status}`);
        }
        const data = await response.json();
        let fullTranslated = "";
        if (Array.isArray(data) && Array.isArray(data[0])) {
          fullTranslated = data[0].map((item) => item[0]).join("");
        } else {
          fullTranslated = chunk.joinedText;
        }
        const splitResults = fullTranslated.split(/\n---\n|\n--- \n|\n --- \n/);
        chunk.originalIndices.forEach((origIdx, i) => {
          finalResults[origIdx] = splitResults[i] ? splitResults[i].trim() : texts[origIdx];
        });
      });
      await Promise.all(chunkPromises);
      return finalResults;
    }
    /**
     * Lingva Translate API (Fallback).
     */
    async translateWithLingva(texts, source, target) {
      const results = [];
      const src = source === "auto" ? "auto" : source;
      for (const text of texts) {
        if (!text || text.trim().length === 0) {
          results.push(text);
          continue;
        }
        try {
          const url = `https://lingva.ml/api/v1/${encodeURIComponent(src)}/${encodeURIComponent(
            target
          )}/${encodeURIComponent(text)}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            results.push(data.translation || text);
          } else {
            results.push(text);
          }
        } catch {
          results.push(text);
        }
      }
      return results;
    }
    /**
     * LibreTranslate API implementation.
     */
    async requestLibreTranslate(endpoint, texts, source, target) {
      const baseUrl = endpoint.url.replace(/\/$/, "");
      const url = `${baseUrl}/translate`;
      let resolvedSource = source;
      if (!resolvedSource || resolvedSource === "auto") {
        const sampleText = texts.find((t) => t && t.trim().length > 3) || texts[0] || "";
        const detected = await this.detectLanguage(sampleText);
        resolvedSource = detected || "en";
      }
      const payload = {
        q: texts,
        source: resolvedSource,
        target,
        format: "text"
      };
      if (endpoint.apiKey) {
        payload.api_key = endpoint.apiKey;
      }
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        let errMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson == null ? void 0 : errJson.error) {
            errMessage = `HTTP Error ${response.status}: ${errJson.error}`;
          }
        } catch {
        }
        const errorObj = new Error(errMessage);
        errorObj.status = response.status;
        throw errorObj;
      }
      const data = await response.json();
      if (Array.isArray(data.translatedText)) {
        return data.translatedText;
      } else if (typeof data.translatedText === "string") {
        return [data.translatedText];
      }
      throw new Error("Unexpected translation response structure");
    }
    async testEndpoint(endpoint) {
      if (endpoint.url.includes("googleapis")) {
        return {
          success: true,
          message: "Connected successfully to Fast Google Engine.",
          supportedLanguages: 130
        };
      }
      try {
        const url = `${endpoint.url.replace(/\/$/, "")}/languages`;
        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" }
        });
        if (!response.ok) {
          return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
        }
        const languages = await response.json();
        if (Array.isArray(languages)) {
          return {
            success: true,
            message: `Connected successfully (${languages.length} languages supported).`,
            supportedLanguages: languages.length
          };
        }
        return { success: false, message: "Invalid response format from server." };
      } catch (err) {
        return { success: false, message: err.message || "Connection failed." };
      }
    }
    async detectLanguage(text) {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
          text
        )}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data && data[2]) {
            return data[2];
          }
        }
      } catch {
      }
      return null;
    }
  }
  const defaultTranslatorClient = new TranslatorClient();
  background;
  function fnv1aHash(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      const codePoint = str.codePointAt(i) || 0;
      hash ^= codePoint;
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }
  function getCacheKey(text, sourceLang, targetLang) {
    const normalizedText = text.trim();
    const rawKey = `${normalizedText}::${sourceLang}::${targetLang}`;
    return fnv1aHash(rawKey) + "_" + normalizedText.length;
  }
  background;
  const DB_NAME = "hitar_translation_cache";
  const DB_VERSION = 1;
  const STORE_NAME = "translations";
  const DEFAULT_MAX_ENTRIES = 2e4;
  class TranslationCache {
    constructor(maxEntries = DEFAULT_MAX_ENTRIES) {
      __publicField(this, "dbPromise", null);
      this.maxEntries = maxEntries;
    }
    getDB() {
      if (this.dbPromise !== null) return this.dbPromise;
      this.dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
          reject(new Error("IndexedDB is not supported in this environment."));
          return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
            store.createIndex("lastAccessed", "lastAccessed", { unique: false });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return this.dbPromise;
    }
    async get(sourceText, sourceLang, targetLang) {
      const key = getCacheKey(sourceText, sourceLang, targetLang);
      try {
        const db = await this.getDB();
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => {
            const entry = req.result;
            if (entry) {
              entry.lastAccessed = Date.now();
              store.put(entry);
              resolve(entry.translatedText);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        });
      } catch {
        return null;
      }
    }
    async getMany(texts, sourceLang, targetLang) {
      const resultMap = /* @__PURE__ */ new Map();
      if (texts.length === 0) return resultMap;
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const now = Date.now();
        await Promise.all(
          texts.map(
            (text) => new Promise((resolve) => {
              const key = getCacheKey(text, sourceLang, targetLang);
              const req = store.get(key);
              req.onsuccess = () => {
                const entry = req.result;
                if (entry) {
                  resultMap.set(text, entry.translatedText);
                  entry.lastAccessed = now;
                  store.put(entry);
                }
                resolve();
              };
              req.onerror = () => resolve();
            })
          )
        );
      } catch {
      }
      return resultMap;
    }
    async setMany(translations, sourceLang, targetLang) {
      if (translations.length === 0) return;
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const now = Date.now();
        for (const item of translations) {
          if (!item.sourceText || !item.translatedText) continue;
          const key = getCacheKey(item.sourceText, sourceLang, targetLang);
          const entry = {
            key,
            sourceText: item.sourceText,
            translatedText: item.translatedText,
            sourceLang,
            targetLang,
            timestamp: now,
            lastAccessed: now
          };
          store.put(entry);
        }
        tx.oncomplete = () => {
          this.evictIfNeeded();
        };
      } catch {
      }
    }
    async evictIfNeeded() {
      try {
        const db = await this.getDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const countReq = store.count();
        countReq.onsuccess = () => {
          const count = countReq.result;
          if (count <= this.maxEntries) return;
          const overage = count - this.maxEntries;
          const index = store.index("lastAccessed");
          const cursorReq = index.openCursor();
          let deleted = 0;
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor && deleted < overage) {
              cursor.delete();
              deleted++;
              cursor.continue();
            }
          };
        };
      } catch {
      }
    }
    async clear() {
      try {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch {
      }
    }
    async getStats() {
      try {
        const db = await this.getDB();
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.count();
          req.onsuccess = () => {
            resolve({ count: req.result, maxEntries: this.maxEntries });
          };
          req.onerror = () => {
            resolve({ count: 0, maxEntries: this.maxEntries });
          };
        });
      } catch {
        return { count: 0, maxEntries: this.maxEntries };
      }
    }
  }
  const translationCache = new TranslationCache();
  background;
  const DEFAULT_BATCH_CHAR_BUDGET = 2e3;
  function createBatches(texts, charBudget = DEFAULT_BATCH_CHAR_BUDGET) {
    const batches = [];
    if (texts.length === 0) return batches;
    let currentBatch = [];
    let currentIndices = [];
    let currentChars = 0;
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const textLength = text.length;
      if (textLength >= charBudget) {
        if (currentBatch.length > 0) {
          batches.push({
            texts: currentBatch,
            totalChars: currentChars,
            indices: currentIndices
          });
          currentBatch = [];
          currentIndices = [];
          currentChars = 0;
        }
        batches.push({
          texts: [text],
          totalChars: textLength,
          indices: [i]
        });
        continue;
      }
      if (currentChars + textLength > charBudget && currentBatch.length > 0) {
        batches.push({
          texts: currentBatch,
          totalChars: currentChars,
          indices: currentIndices
        });
        currentBatch = [];
        currentIndices = [];
        currentChars = 0;
      }
      currentBatch.push(text);
      currentIndices.push(i);
      currentChars += textLength;
    }
    if (currentBatch.length > 0) {
      batches.push({
        texts: currentBatch,
        totalChars: currentChars,
        indices: currentIndices
      });
    }
    return batches;
  }
  background;
  const DEFAULT_SETTINGS = {
    endpoints: DEFAULT_ENDPOINTS,
    defaultSourceLang: "auto",
    defaultTargetLang: "es",
    alwaysTranslateDomains: [],
    neverTranslateDomains: [],
    perSiteTargetLangs: {},
    batchCharBudget: 2e3,
    maxCacheEntries: 2e4,
    autoTranslateOnLoad: false,
    theme: "system"
  };
  const STORAGE_KEY = "hitar_settings";
  async function getSettings() {
    try {
      const res = await originalBrowser.storage.local.get(STORAGE_KEY);
      if (res == null ? void 0 : res[STORAGE_KEY]) {
        return { ...DEFAULT_SETTINGS, ...res[STORAGE_KEY] };
      }
    } catch (err) {
      console.warn("Failed to read settings from storage:", err);
    }
    return DEFAULT_SETTINGS;
  }
  async function saveSettings(newSettings) {
    const current = await getSettings();
    const updated = { ...current, ...newSettings };
    try {
      await originalBrowser.storage.local.set({ [STORAGE_KEY]: updated });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
    return updated;
  }
  background;
  const definition = defineBackground(() => {
    console.log("[Hitar Background] Service worker initialized.");
    originalBrowser.runtime.onInstalled.addListener(async () => {
      setupContextMenu();
      await autoInjectExistingTabs();
    });
    setupContextMenu();
    originalBrowser.commands.onCommand.addListener(async (command) => {
      var _a2;
      if (command === "translate-page") {
        const tabs = await originalBrowser.tabs.query({ active: true, currentWindow: true });
        if ((_a2 = tabs[0]) == null ? void 0 : _a2.id) {
          await sendMessageToTabOrInject(tabs[0].id, { type: "TOGGLE_TRANSLATION" });
        }
      }
    });
    originalBrowser.contextMenus.onClicked.addListener(async (info, tab) => {
      if (!(tab == null ? void 0 : tab.id)) return;
      if (info.menuItemId === "hitar_translate_page") {
        await sendMessageToTabOrInject(tab.id, { type: "TOGGLE_TRANSLATION" });
      } else if (info.menuItemId === "hitar_translate_selection" && info.selectionText) {
        await sendMessageToTabOrInject(tab.id, {
          type: "TRANSLATE_SELECTION_TRIGGER",
          selectionText: info.selectionText
        });
      }
    });
    originalBrowser.runtime.onMessage.addListener(
      (message, _sender) => {
        return handleMessage(message);
      }
    );
  });
  async function autoInjectExistingTabs() {
    try {
      const tabs = await originalBrowser.tabs.query({ url: ["http://*/*", "https://*/*"] });
      for (const tab of tabs) {
        if (tab.id) {
          try {
            await originalBrowser.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content-scripts/content.js"]
            });
            await originalBrowser.scripting.insertCSS({
              target: { tabId: tab.id },
              files: ["content-scripts/content.css"]
            });
          } catch {
          }
        }
      }
    } catch (err) {
      console.warn("[Hitar Background] Tab auto-injection error:", err);
    }
  }
  async function sendMessageToTabOrInject(tabId, message) {
    try {
      return await originalBrowser.tabs.sendMessage(tabId, message);
    } catch {
      try {
        await originalBrowser.scripting.executeScript({
          target: { tabId },
          files: ["content-scripts/content.js"]
        });
        await originalBrowser.scripting.insertCSS({
          target: { tabId },
          files: ["content-scripts/content.css"]
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        return await originalBrowser.tabs.sendMessage(tabId, message);
      } catch (err) {
        console.error("[Hitar Background] Dynamic injection failed for tab:", tabId, err);
        throw err;
      }
    }
  }
  function setupContextMenu() {
    originalBrowser.contextMenus.removeAll().then(() => {
      originalBrowser.contextMenus.create({
        id: "hitar_translate_page",
        title: "Translate this page with Hitar",
        contexts: ["page"]
      });
      originalBrowser.contextMenus.create({
        id: "hitar_translate_selection",
        title: 'Translate selection ("%s")',
        contexts: ["selection"]
      });
    });
  }
  async function handleMessage(message) {
    try {
      switch (message.type) {
        case "TRANSLATE_BATCH": {
          const { texts, source, target } = message;
          const settings = await getSettings();
          defaultTranslatorClient.updateEndpoints(settings.endpoints);
          const cacheHits = await translationCache.getMany(texts, source, target);
          const finalResults = new Array(texts.length);
          const uncachedTexts = [];
          const uncachedIndices = [];
          texts.forEach((text, i) => {
            if (cacheHits.has(text)) {
              finalResults[i] = cacheHits.get(text);
            } else {
              uncachedTexts.push(text);
              uncachedIndices.push(i);
            }
          });
          if (uncachedTexts.length > 0) {
            const batches = createBatches(uncachedTexts, settings.batchCharBudget);
            const newCacheEntries = [];
            for (const batch of batches) {
              const translatedBatch = await defaultTranslatorClient.translateBatch(
                batch.texts,
                source,
                target
              );
              batch.texts.forEach((original, idx) => {
                const translated = translatedBatch[idx] || original;
                const uncachedIndex = batch.indices[idx];
                const originalIndex = uncachedIndices[uncachedIndex];
                finalResults[originalIndex] = translated;
                newCacheEntries.push({ sourceText: original, translatedText: translated });
              });
            }
            await translationCache.setMany(newCacheEntries, source, target);
          }
          return { success: true, data: finalResults };
        }
        case "DETECT_LANG": {
          const settings = await getSettings();
          defaultTranslatorClient.updateEndpoints(settings.endpoints);
          const detected = await defaultTranslatorClient.detectLanguage(message.text);
          return { success: true, data: detected };
        }
        case "GET_SETTINGS": {
          const settings = await getSettings();
          return { success: true, data: settings };
        }
        case "SAVE_SETTINGS": {
          const updated = await saveSettings(message.settings);
          defaultTranslatorClient.updateEndpoints(updated.endpoints);
          return { success: true, data: updated };
        }
        case "TEST_ENDPOINT": {
          const result2 = await defaultTranslatorClient.testEndpoint(message.endpoint);
          return { success: true, data: result2 };
        }
        case "CLEAR_CACHE": {
          await translationCache.clear();
          return { success: true, data: "Cache cleared successfully" };
        }
        case "GET_CACHE_STATS": {
          const stats = await translationCache.getStats();
          return { success: true, data: stats };
        }
        default:
          return { success: false, error: "Unknown message type" };
      }
    } catch (err) {
      console.error("[Hitar Background] Error handling message:", err);
      return { success: false, error: err.message || "Internal error" };
    }
  }
  background;
  function initPlugins() {
  }
  const browser = originalBrowser;
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  let ws;
  function getDevServerWebSocket() {
    if (ws == null) {
      const serverUrl = `${"ws:"}//${"localhost"}:${3e3}`;
      logger.debug("Connecting to dev server @", serverUrl);
      ws = new WebSocket(serverUrl, "vite-hmr");
      ws.addWxtEventListener = ws.addEventListener.bind(ws);
      ws.sendCustom = (event, payload) => ws == null ? void 0 : ws.send(JSON.stringify({ type: "custom", event, payload }));
      ws.addEventListener("open", () => {
        logger.debug("Connected to dev server");
      });
      ws.addEventListener("close", () => {
        logger.debug("Disconnected from dev server");
      });
      ws.addEventListener("error", (event) => {
        logger.error("Failed to connect to dev server", event);
      });
      ws.addEventListener("message", (e) => {
        try {
          const message = JSON.parse(e.data);
          if (message.type === "custom") {
            ws == null ? void 0 : ws.dispatchEvent(
              new CustomEvent(message.event, { detail: message.data })
            );
          }
        } catch (err) {
          logger.error("Failed to handle message", err);
        }
      });
    }
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    const manifest = browser.runtime.getManifest();
    if (manifest.manifest_version == 2) {
      void reloadContentScriptMv2();
    } else {
      void reloadContentScriptMv3(payload);
    }
  }
  async function reloadContentScriptMv3({
    registration,
    contentScript
  }) {
    if (registration === "runtime") {
      await reloadRuntimeContentScriptMv3(contentScript);
    } else {
      await reloadManifestContentScriptMv3(contentScript);
    }
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser.scripting.updateContentScripts([{ ...contentScript, id }]);
    } else {
      logger.debug("Registering new content script...");
      await browser.scripting.registerContentScripts([{ ...contentScript, id }]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      var _a2, _b;
      const hasJs = (_a2 = contentScript.js) == null ? void 0 : _a2.find((js) => {
        var _a3;
        return (_a3 = cs.js) == null ? void 0 : _a3.includes(js);
      });
      const hasCss = (_b = contentScript.css) == null ? void 0 : _b.find((css) => {
        var _a3;
        return (_a3 = cs.css) == null ? void 0 : _a3.includes(css);
      });
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log(
        "Content script is not registered yet, nothing to reload",
        contentScript
      );
      return;
    }
    await browser.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser.tabs.query({});
    const matchPatterns = contentScript.matches.map(
      (match) => new MatchPattern(match)
    );
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url) return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(
      matchingTabs.map(async (tab) => {
        try {
          await browser.tabs.reload(tab.id);
        } catch (err) {
          logger.warn("Failed to reload tab:", err);
        }
      })
    );
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws2 = getDevServerWebSocket();
      ws2.addWxtEventListener("wxt:reload-extension", () => {
        browser.runtime.reload();
      });
      ws2.addWxtEventListener("wxt:reload-content-script", (event) => {
        reloadContentScript(event.detail);
      });
      if (true) {
        ws2.addEventListener(
          "open",
          () => ws2.sendCustom("wxt:background-initialized")
        );
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") {
        browser.runtime.reload();
      }
    });
  }
  let result;
  try {
    initPlugins();
    result = definition.main();
    if (result instanceof Promise) {
      console.warn(
        "The background's main() function return a promise, but it must be synchronous"
      );
    }
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  const result$1 = result;
  return result$1;
})();
background;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3NhbmRib3gvZGVmaW5lLWJhY2tncm91bmQubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3ZWJleHQtY29yZS9tYXRjaC1wYXR0ZXJucy9saWIvaW5kZXgubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9kaXN0L2Jyb3dzZXItcG9seWZpbGwuanMiLCIuLi8uLi9zcmMvbGliL3JldHJ5LnRzIiwiLi4vLi4vc3JjL2xpYi90cmFuc2xhdG9yLWNsaWVudC50cyIsIi4uLy4uL3NyYy9saWIvaGFzaC50cyIsIi4uLy4uL3NyYy9saWIvY2FjaGUudHMiLCIuLi8uLi9zcmMvbGliL2JhdGNoZXIudHMiLCIuLi8uLi9zcmMvbGliL3N0b3JhZ2UudHMiLCIuLi8uLi9zcmMvZW50cnlwb2ludHMvYmFja2dyb3VuZC50cyIsIi4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyL2luZGV4Lm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZGVmaW5lQmFja2dyb3VuZChhcmcpIHtcbiAgaWYgKGFyZyA9PSBudWxsIHx8IHR5cGVvZiBhcmcgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHsgbWFpbjogYXJnIH07XG4gIHJldHVybiBhcmc7XG59XG4iLCIvLyNyZWdpb24gc3JjL2luZGV4LnRzXG4vKipcbiogQ2xhc3MgZm9yIHBhcnNpbmcgYW5kIHBlcmZvcm1pbmcgb3BlcmF0aW9ucyBvbiBtYXRjaCBwYXR0ZXJucy5cbipcbiogQGV4YW1wbGVcbiogICBjb25zdCBwYXR0ZXJuID0gbmV3IE1hdGNoUGF0dGVybignKjovL2dvb2dsZS5jb20vKicpO1xuKlxuKiAgIHBhdHRlcm4uaW5jbHVkZXMoJ2h0dHBzOi8vZ29vZ2xlLmNvbScpOyAvLyB0cnVlXG4qICAgcGF0dGVybi5pbmNsdWRlcygnaHR0cDovL3lvdXR1YmUuY29tL3dhdGNoP3Y9MTIzJyk7IC8vIGZhbHNlXG4qL1xudmFyIE1hdGNoUGF0dGVybiA9IGNsYXNzIE1hdGNoUGF0dGVybiB7XG5cdHN0YXRpYyB7XG5cdFx0dGhpcy5QUk9UT0NPTFMgPSBbXG5cdFx0XHRcImh0dHBcIixcblx0XHRcdFwiaHR0cHNcIixcblx0XHRcdFwiZmlsZVwiLFxuXHRcdFx0XCJmdHBcIixcblx0XHRcdFwidXJuXCIsXG5cdFx0XHRcIndzXCIsXG5cdFx0XHRcIndzc1wiXG5cdFx0XTtcblx0fVxuXHQvKipcblx0KiBQYXJzZSBhIG1hdGNoIHBhdHRlcm4gc3RyaW5nLiBJZiBpdCBpcyBpbnZhbGlkLCB0aGUgY29uc3RydWN0b3Igd2lsbCB0aHJvdyBhblxuXHQqIGBJbnZhbGlkTWF0Y2hQYXR0ZXJuYCBlcnJvci5cblx0KlxuXHQqIEBwYXJhbSBtYXRjaFBhdHRlcm4gVGhlIG1hdGNoIHBhdHRlcm4gdG8gcGFyc2UuXG5cdCovXG5cdGNvbnN0cnVjdG9yKG1hdGNoUGF0dGVybikge1xuXHRcdGlmIChtYXRjaFBhdHRlcm4gPT09IFwiPGFsbF91cmxzPlwiKSB7XG5cdFx0XHR0aGlzLmlzQWxsVXJscyA9IHRydWU7XG5cdFx0XHR0aGlzLnByb3RvY29sTWF0Y2hlcyA9IFsuLi5NYXRjaFBhdHRlcm4uUFJPVE9DT0xTXTtcblx0XHRcdHRoaXMuaG9zdG5hbWVNYXRjaCA9IFwiKlwiO1xuXHRcdFx0dGhpcy5wYXRobmFtZU1hdGNoID0gXCIqXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGdyb3VwcyA9IC8oLiopOlxcL1xcLyguKj8pKFxcLy4qKS8uZXhlYyhtYXRjaFBhdHRlcm4pO1xuXHRcdFx0aWYgKGdyb3VwcyA9PSBudWxsKSB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihtYXRjaFBhdHRlcm4sIFwiSW5jb3JyZWN0IGZvcm1hdFwiKTtcblx0XHRcdGNvbnN0IFtfLCBwcm90b2NvbCwgaG9zdG5hbWUsIHBhdGhuYW1lXSA9IGdyb3Vwcztcblx0XHRcdHZhbGlkYXRlUHJvdG9jb2wobWF0Y2hQYXR0ZXJuLCBwcm90b2NvbCk7XG5cdFx0XHR2YWxpZGF0ZUhvc3RuYW1lKG1hdGNoUGF0dGVybiwgaG9zdG5hbWUpO1xuXHRcdFx0dGhpcy5wcm90b2NvbE1hdGNoZXMgPSBwcm90b2NvbCA9PT0gXCIqXCIgPyBbXCJodHRwXCIsIFwiaHR0cHNcIl0gOiBbcHJvdG9jb2xdO1xuXHRcdFx0dGhpcy5ob3N0bmFtZU1hdGNoID0gaG9zdG5hbWU7XG5cdFx0XHR0aGlzLnBhdGhuYW1lTWF0Y2ggPSBwYXRobmFtZTtcblx0XHR9XG5cdH1cblx0LyoqIENoZWNrIGlmIGEgVVJMIGlzIGluY2x1ZGVkIGluIGEgcGF0dGVybi4gKi9cblx0aW5jbHVkZXModXJsKSB7XG5cdFx0Y29uc3QgdSA9IHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIgPyBuZXcgVVJMKHVybCkgOiB1cmwgaW5zdGFuY2VvZiBMb2NhdGlvbiA/IG5ldyBVUkwodXJsLmhyZWYpIDogdXJsO1xuXHRcdGlmICh0aGlzLmlzQWxsVXJscykgcmV0dXJuICF0aGlzLmlzVW5rbm93blByb3RvY29sKHUpO1xuXHRcdHJldHVybiAhIXRoaXMucHJvdG9jb2xNYXRjaGVzLmZpbmQoKHByb3RvY29sKSA9PiB7XG5cdFx0XHRpZiAocHJvdG9jb2wgPT09IFwiaHR0cFwiKSByZXR1cm4gdGhpcy5pc0h0dHBNYXRjaCh1KTtcblx0XHRcdGlmIChwcm90b2NvbCA9PT0gXCJodHRwc1wiKSByZXR1cm4gdGhpcy5pc0h0dHBzTWF0Y2godSk7XG5cdFx0XHRpZiAocHJvdG9jb2wgPT09IFwiZmlsZVwiKSByZXR1cm4gdGhpcy5pc0ZpbGVNYXRjaCh1KTtcblx0XHRcdGlmIChwcm90b2NvbCA9PT0gXCJmdHBcIikgcmV0dXJuIHRoaXMuaXNGdHBNYXRjaCh1KTtcblx0XHRcdGlmIChwcm90b2NvbCA9PT0gXCJ1cm5cIikgcmV0dXJuIHRoaXMuaXNVcm5NYXRjaCh1KTtcblx0XHR9KTtcblx0fVxuXHRpc0h0dHBNYXRjaCh1cmwpIHtcblx0XHRyZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHA6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcblx0fVxuXHRpc0h0dHBzTWF0Y2godXJsKSB7XG5cdFx0cmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuXHR9XG5cdGlzSG9zdFBhdGhNYXRjaCh1cmwpIHtcblx0XHRpZiAoIXRoaXMuaG9zdG5hbWVNYXRjaCB8fCAhdGhpcy5wYXRobmFtZU1hdGNoKSByZXR1cm4gZmFsc2U7XG5cdFx0Y29uc3QgaG9zdG5hbWVNYXRjaFJlZ2V4cyA9IFt0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gpLCB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gucmVwbGFjZSgvXlxcKlxcLi8sIFwiXCIpKV07XG5cdFx0Y29uc3QgcGF0aG5hbWVNYXRjaFJlZ2V4ID0gdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5wYXRobmFtZU1hdGNoKTtcblx0XHRyZXR1cm4gISFob3N0bmFtZU1hdGNoUmVnZXhzLmZpbmQoKHJlZ2V4KSA9PiByZWdleC50ZXN0KHVybC5ob3N0bmFtZSkpICYmIHBhdGhuYW1lTWF0Y2hSZWdleC50ZXN0KHVybC5wYXRobmFtZSk7XG5cdH1cblx0aXNVbmtub3duUHJvdG9jb2wodXJsKSB7XG5cdFx0cmV0dXJuICF0aGlzLnByb3RvY29sTWF0Y2hlcy5pbmNsdWRlcyh1cmwucHJvdG9jb2wuc2xpY2UoMCwgLTEpKTtcblx0fVxuXHRpc1BhdGhNYXRjaCh1cmwpIHtcblx0XHRpZiAoIXRoaXMucGF0aG5hbWVNYXRjaCkgcmV0dXJuIGZhbHNlO1xuXHRcdHJldHVybiB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLnBhdGhuYW1lTWF0Y2gpLnRlc3QodXJsLnBhdGhuYW1lKTtcblx0fVxuXHRpc0ZpbGVNYXRjaCh1cmwpIHtcblx0XHRyZXR1cm4gdXJsLnByb3RvY29sID09PSBcImZpbGU6XCIgJiYgdGhpcy5pc1BhdGhNYXRjaCh1cmwpO1xuXHR9XG5cdGlzRnRwTWF0Y2goX3VybCkge1xuXHRcdHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmdHA6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuXHR9XG5cdGlzVXJuTWF0Y2goX3VybCkge1xuXHRcdHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiB1cm46Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuXHR9XG5cdGNvbnZlcnRQYXR0ZXJuVG9SZWdleChwYXR0ZXJuKSB7XG5cdFx0Y29uc3Qgc3RhcnNSZXBsYWNlZCA9IHRoaXMuZXNjYXBlRm9yUmVnZXgocGF0dGVybikucmVwbGFjZSgvXFxcXFxcKi9nLCBcIi4qXCIpO1xuXHRcdHJldHVybiBSZWdFeHAoYF4ke3N0YXJzUmVwbGFjZWR9JGApO1xuXHR9XG5cdGVzY2FwZUZvclJlZ2V4KHN0cmluZykge1xuXHRcdHJldHVybiBzdHJpbmcucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csIFwiXFxcXCQmXCIpO1xuXHR9XG59O1xudmFyIEludmFsaWRNYXRjaFBhdHRlcm4gPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3IobWF0Y2hQYXR0ZXJuLCByZWFzb24pIHtcblx0XHRzdXBlcihgSW52YWxpZCBtYXRjaCBwYXR0ZXJuIFwiJHttYXRjaFBhdHRlcm59XCI6ICR7cmVhc29ufWApO1xuXHR9XG59O1xuZnVuY3Rpb24gdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKSB7XG5cdGlmICghTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5pbmNsdWRlcyhwcm90b2NvbCkgJiYgcHJvdG9jb2wgIT09IFwiKlwiKSB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihtYXRjaFBhdHRlcm4sIGAke3Byb3RvY29sfSBub3QgYSB2YWxpZCBwcm90b2NvbCAoJHtNYXRjaFBhdHRlcm4uUFJPVE9DT0xTLmpvaW4oXCIsIFwiKX0pYCk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZUhvc3RuYW1lKG1hdGNoUGF0dGVybiwgaG9zdG5hbWUpIHtcblx0aWYgKGhvc3RuYW1lLmluY2x1ZGVzKFwiOlwiKSkgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBgSG9zdG5hbWUgY2Fubm90IGluY2x1ZGUgYSBwb3J0YCk7XG5cdGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIipcIikgJiYgaG9zdG5hbWUubGVuZ3RoID4gMSAmJiAhaG9zdG5hbWUuc3RhcnRzV2l0aChcIiouXCIpKSB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihtYXRjaFBhdHRlcm4sIGBJZiB1c2luZyBhIHdpbGRjYXJkICgqKSwgaXQgbXVzdCBnbyBhdCB0aGUgc3RhcnQgb2YgdGhlIGhvc3RuYW1lYCk7XG59XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IEludmFsaWRNYXRjaFBhdHRlcm4sIE1hdGNoUGF0dGVybiB9O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCIsIFtcIm1vZHVsZVwiXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBmYWN0b3J5KG1vZHVsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1vZCA9IHtcbiAgICAgIGV4cG9ydHM6IHt9XG4gICAgfTtcbiAgICBmYWN0b3J5KG1vZCk7XG4gICAgZ2xvYmFsLmJyb3dzZXIgPSBtb2QuZXhwb3J0cztcbiAgfVxufSkodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxUaGlzIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24gKG1vZHVsZSkge1xuICAvKiB3ZWJleHRlbnNpb24tcG9seWZpbGwgLSB2MC4xMi4wIC0gVHVlIE1heSAxNCAyMDI0IDE4OjAxOjI5ICovXG4gIC8qIC0qLSBNb2RlOiBpbmRlbnQtdGFicy1tb2RlOiBuaWw7IGpzLWluZGVudC1sZXZlbDogMiAtKi0gKi9cbiAgLyogdmltOiBzZXQgc3RzPTIgc3c9MiBldCB0dz04MDogKi9cbiAgLyogVGhpcyBTb3VyY2UgQ29kZSBGb3JtIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBNb3ppbGxhIFB1YmxpY1xuICAgKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gICAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwOi8vbW96aWxsYS5vcmcvTVBMLzIuMC8uICovXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGlmICghKGdsb2JhbFRoaXMuY2hyb21lICYmIGdsb2JhbFRoaXMuY2hyb21lLnJ1bnRpbWUgJiYgZ2xvYmFsVGhpcy5jaHJvbWUucnVudGltZS5pZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHNjcmlwdCBzaG91bGQgb25seSBiZSBsb2FkZWQgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cIik7XG4gIH1cbiAgaWYgKCEoZ2xvYmFsVGhpcy5icm93c2VyICYmIGdsb2JhbFRoaXMuYnJvd3Nlci5ydW50aW1lICYmIGdsb2JhbFRoaXMuYnJvd3Nlci5ydW50aW1lLmlkKSkge1xuICAgIGNvbnN0IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSA9IFwiVGhlIG1lc3NhZ2UgcG9ydCBjbG9zZWQgYmVmb3JlIGEgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkLlwiO1xuXG4gICAgLy8gV3JhcHBpbmcgdGhlIGJ1bGsgb2YgdGhpcyBwb2x5ZmlsbCBpbiBhIG9uZS10aW1lLXVzZSBmdW5jdGlvbiBpcyBhIG1pbm9yXG4gICAgLy8gb3B0aW1pemF0aW9uIGZvciBGaXJlZm94LiBTaW5jZSBTcGlkZXJtb25rZXkgZG9lcyBub3QgZnVsbHkgcGFyc2UgdGhlXG4gICAgLy8gY29udGVudHMgb2YgYSBmdW5jdGlvbiB1bnRpbCB0aGUgZmlyc3QgdGltZSBpdCdzIGNhbGxlZCwgYW5kIHNpbmNlIGl0IHdpbGxcbiAgICAvLyBuZXZlciBhY3R1YWxseSBuZWVkIHRvIGJlIGNhbGxlZCwgdGhpcyBhbGxvd3MgdGhlIHBvbHlmaWxsIHRvIGJlIGluY2x1ZGVkXG4gICAgLy8gaW4gRmlyZWZveCBuZWFybHkgZm9yIGZyZWUuXG4gICAgY29uc3Qgd3JhcEFQSXMgPSBleHRlbnNpb25BUElzID0+IHtcbiAgICAgIC8vIE5PVEU6IGFwaU1ldGFkYXRhIGlzIGFzc29jaWF0ZWQgdG8gdGhlIGNvbnRlbnQgb2YgdGhlIGFwaS1tZXRhZGF0YS5qc29uIGZpbGVcbiAgICAgIC8vIGF0IGJ1aWxkIHRpbWUgYnkgcmVwbGFjaW5nIHRoZSBmb2xsb3dpbmcgXCJpbmNsdWRlXCIgd2l0aCB0aGUgY29udGVudCBvZiB0aGVcbiAgICAgIC8vIEpTT04gZmlsZS5cbiAgICAgIGNvbnN0IGFwaU1ldGFkYXRhID0ge1xuICAgICAgICBcImFsYXJtc1wiOiB7XG4gICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImNsZWFyQWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYm9va21hcmtzXCI6IHtcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldENoaWxkcmVuXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UmVjZW50XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0U3ViVHJlZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFRyZWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlVHJlZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImJyb3dzZXJBY3Rpb25cIjoge1xuICAgICAgICAgIFwiZGlzYWJsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImVuYWJsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEJhZGdlQmFja2dyb3VuZENvbG9yXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm9wZW5Qb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEJhZGdlQmFja2dyb3VuZENvbG9yXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0QmFkZ2VUZXh0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0SWNvblwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFBvcHVwXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0VGl0bGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJicm93c2luZ0RhdGFcIjoge1xuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlQ2FjaGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVDb29raWVzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlRG93bmxvYWRzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlRm9ybURhdGFcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVIaXN0b3J5XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlTG9jYWxTdG9yYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlUGFzc3dvcmRzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlUGx1Z2luRGF0YVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiY29tbWFuZHNcIjoge1xuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiY29udGV4dE1lbnVzXCI6IHtcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImNvb2tpZXNcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsQ29va2llU3RvcmVzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZGV2dG9vbHNcIjoge1xuICAgICAgICAgIFwiaW5zcGVjdGVkV2luZG93XCI6IHtcbiAgICAgICAgICAgIFwiZXZhbFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMixcbiAgICAgICAgICAgICAgXCJzaW5nbGVDYWxsYmFja0FyZ1wiOiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJwYW5lbHNcIjoge1xuICAgICAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMyxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDMsXG4gICAgICAgICAgICAgIFwic2luZ2xlQ2FsbGJhY2tBcmdcIjogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZWxlbWVudHNcIjoge1xuICAgICAgICAgICAgICBcImNyZWF0ZVNpZGViYXJQYW5lXCI6IHtcbiAgICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImRvd25sb2Fkc1wiOiB7XG4gICAgICAgICAgXCJjYW5jZWxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkb3dubG9hZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImVyYXNlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0RmlsZUljb25cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJvcGVuXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicGF1c2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVGaWxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVzdW1lXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2hvd1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImV4dGVuc2lvblwiOiB7XG4gICAgICAgICAgXCJpc0FsbG93ZWRGaWxlU2NoZW1lQWNjZXNzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaXNBbGxvd2VkSW5jb2duaXRvQWNjZXNzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaGlzdG9yeVwiOiB7XG4gICAgICAgICAgXCJhZGRVcmxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkZWxldGVBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkZWxldGVSYW5nZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRlbGV0ZVVybFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFZpc2l0c1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImkxOG5cIjoge1xuICAgICAgICAgIFwiZGV0ZWN0TGFuZ3VhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBY2NlcHRMYW5ndWFnZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJpZGVudGl0eVwiOiB7XG4gICAgICAgICAgXCJsYXVuY2hXZWJBdXRoRmxvd1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImlkbGVcIjoge1xuICAgICAgICAgIFwicXVlcnlTdGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIm1hbmFnZW1lbnRcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0U2VsZlwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEVuYWJsZWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ1bmluc3RhbGxTZWxmXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwibm90aWZpY2F0aW9uc1wiOiB7XG4gICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFBlcm1pc3Npb25MZXZlbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInBhZ2VBY3Rpb25cIjoge1xuICAgICAgICAgIFwiZ2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImhpZGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRJY29uXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNob3dcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJwZXJtaXNzaW9uc1wiOiB7XG4gICAgICAgICAgXCJjb250YWluc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlcXVlc3RcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJydW50aW1lXCI6IHtcbiAgICAgICAgICBcImdldEJhY2tncm91bmRQYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UGxhdGZvcm1JbmZvXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwib3Blbk9wdGlvbnNQYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVxdWVzdFVwZGF0ZUNoZWNrXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VuZE1lc3NhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogM1xuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZW5kTmF0aXZlTWVzc2FnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFVuaW5zdGFsbFVSTFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInNlc3Npb25zXCI6IHtcbiAgICAgICAgICBcImdldERldmljZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRSZWNlbnRseUNsb3NlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlc3RvcmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJzdG9yYWdlXCI6IHtcbiAgICAgICAgICBcImxvY2FsXCI6IHtcbiAgICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibWFuYWdlZFwiOiB7XG4gICAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzeW5jXCI6IHtcbiAgICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0Qnl0ZXNJblVzZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwidGFic1wiOiB7XG4gICAgICAgICAgXCJjYXB0dXJlVmlzaWJsZVRhYlwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRldGVjdExhbmd1YWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGlzY2FyZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImR1cGxpY2F0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImV4ZWN1dGVTY3JpcHRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRDdXJyZW50XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Wm9vbVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFpvb21TZXR0aW5nc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdvQmFja1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdvRm9yd2FyZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImhpZ2hsaWdodFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImluc2VydENTU1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbG9hZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUNTU1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlbmRNZXNzYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDNcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0Wm9vbVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFpvb21TZXR0aW5nc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInRvcFNpdGVzXCI6IHtcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIndlYk5hdmlnYXRpb25cIjoge1xuICAgICAgICAgIFwiZ2V0QWxsRnJhbWVzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0RnJhbWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ3ZWJSZXF1ZXN0XCI6IHtcbiAgICAgICAgICBcImhhbmRsZXJCZWhhdmlvckNoYW5nZWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ3aW5kb3dzXCI6IHtcbiAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEN1cnJlbnRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRMYXN0Rm9jdXNlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKE9iamVjdC5rZXlzKGFwaU1ldGFkYXRhKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXBpLW1ldGFkYXRhLmpzb24gaGFzIG5vdCBiZWVuIGluY2x1ZGVkIGluIGJyb3dzZXItcG9seWZpbGxcIik7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQSBXZWFrTWFwIHN1YmNsYXNzIHdoaWNoIGNyZWF0ZXMgYW5kIHN0b3JlcyBhIHZhbHVlIGZvciBhbnkga2V5IHdoaWNoIGRvZXNcbiAgICAgICAqIG5vdCBleGlzdCB3aGVuIGFjY2Vzc2VkLCBidXQgYmVoYXZlcyBleGFjdGx5IGFzIGFuIG9yZGluYXJ5IFdlYWtNYXBcbiAgICAgICAqIG90aGVyd2lzZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjcmVhdGVJdGVtXG4gICAgICAgKiAgICAgICAgQSBmdW5jdGlvbiB3aGljaCB3aWxsIGJlIGNhbGxlZCBpbiBvcmRlciB0byBjcmVhdGUgdGhlIHZhbHVlIGZvciBhbnlcbiAgICAgICAqICAgICAgICBrZXkgd2hpY2ggZG9lcyBub3QgZXhpc3QsIHRoZSBmaXJzdCB0aW1lIGl0IGlzIGFjY2Vzc2VkLiBUaGVcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiByZWNlaXZlcywgYXMgaXRzIG9ubHkgYXJndW1lbnQsIHRoZSBrZXkgYmVpbmcgY3JlYXRlZC5cbiAgICAgICAqL1xuICAgICAgY2xhc3MgRGVmYXVsdFdlYWtNYXAgZXh0ZW5kcyBXZWFrTWFwIHtcbiAgICAgICAgY29uc3RydWN0b3IoY3JlYXRlSXRlbSwgaXRlbXMgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgICAgdGhpcy5jcmVhdGVJdGVtID0gY3JlYXRlSXRlbTtcbiAgICAgICAgfVxuICAgICAgICBnZXQoa2V5KSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLnNldChrZXksIHRoaXMuY3JlYXRlSXRlbShrZXkpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN1cGVyLmdldChrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gb2JqZWN0IHdpdGggYSBgdGhlbmAgbWV0aG9kLCBhbmQgY2FuXG4gICAgICAgKiB0aGVyZWZvcmUgYmUgYXNzdW1lZCB0byBiZWhhdmUgYXMgYSBQcm9taXNlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3QuXG4gICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdGhlbmFibGUuXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IGlzVGhlbmFibGUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoLCB3aGVuIGNhbGxlZCwgd2lsbCByZXNvbHZlIG9yIHJlamVjdFxuICAgICAgICogdGhlIGdpdmVuIHByb21pc2UgYmFzZWQgb24gaG93IGl0IGlzIGNhbGxlZDpcbiAgICAgICAqXG4gICAgICAgKiAtIElmLCB3aGVuIGNhbGxlZCwgYGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcmAgY29udGFpbnMgYSBub24tbnVsbCBvYmplY3QsXG4gICAgICAgKiAgIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdpdGggdGhhdCB2YWx1ZS5cbiAgICAgICAqIC0gSWYgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGV4YWN0bHkgb25lIGFyZ3VtZW50LCB0aGUgcHJvbWlzZSBpc1xuICAgICAgICogICByZXNvbHZlZCB0byB0aGF0IHZhbHVlLlxuICAgICAgICogLSBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZVxuICAgICAgICogICBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gcHJvbWlzZVxuICAgICAgICogICAgICAgIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIGFuZCByZWplY3Rpb24gZnVuY3Rpb25zIG9mIGFcbiAgICAgICAqICAgICAgICBwcm9taXNlLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZXNvbHZlXG4gICAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZXNvbHV0aW9uIGZ1bmN0aW9uLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZWplY3RcbiAgICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlamVjdGlvbiBmdW5jdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSB3cmFwcGVkIG1ldGhvZCB3aGljaCBoYXMgY3JlYXRlZCB0aGUgY2FsbGJhY2suXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gICAgICAgKiAgICAgICAgVGhlIGdlbmVyYXRlZCBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAqL1xuICAgICAgY29uc3QgbWFrZUNhbGxiYWNrID0gKHByb21pc2UsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiAoLi4uY2FsbGJhY2tBcmdzKSA9PiB7XG4gICAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnIHx8IGNhbGxiYWNrQXJncy5sZW5ndGggPD0gMSAmJiBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShjYWxsYmFja0FyZ3NbMF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgY29uc3QgcGx1cmFsaXplQXJndW1lbnRzID0gbnVtQXJncyA9PiBudW1BcmdzID09IDEgPyBcImFyZ3VtZW50XCIgOiBcImFyZ3VtZW50c1wiO1xuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZXMgYSB3cmFwcGVyIGZ1bmN0aW9uIGZvciBhIG1ldGhvZCB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBtZXRhZGF0YS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAgICogICAgICAgIFRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgd2hpY2ggaXMgYmVpbmcgd3JhcHBlZC5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC5cbiAgICAgICAqIEBwYXJhbSB7aW50ZWdlcn0gbWV0YWRhdGEubWluQXJnc1xuICAgICAgICogICAgICAgIFRoZSBtaW5pbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbXVzdCBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIGZld2VyIHRoYW4gdGhpcyBudW1iZXIgb2YgYXJndW1lbnRzLCB0aGVcbiAgICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5tYXhBcmdzXG4gICAgICAgKiAgICAgICAgVGhlIG1heGltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyB3aGljaCBtYXkgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBtb3JlIHRoYW4gdGhpcyBudW1iZXIgb2YgYXJndW1lbnRzLCB0aGVcbiAgICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAgICogICAgICAgIFdoZXRoZXIgb3Igbm90IHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggb25seSB0aGUgZmlyc3RcbiAgICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24gaXMgaW52b2tlZCB3aXRoIG9ubHkgYSBzaW5nbGUgYXJndW1lbnQsIHRoYXQgd2lsbCBiZVxuICAgICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge2Z1bmN0aW9uKG9iamVjdCwgLi4uKil9XG4gICAgICAgKiAgICAgICBUaGUgZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24uXG4gICAgICAgKi9cbiAgICAgIGNvbnN0IHdyYXBBc3luY0Z1bmN0aW9uID0gKG5hbWUsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBhc3luY0Z1bmN0aW9uV3JhcHBlcih0YXJnZXQsIC4uLmFyZ3MpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPCBtZXRhZGF0YS5taW5BcmdzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IG1vc3QgJHttZXRhZGF0YS5tYXhBcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5tYXhBcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAobWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBBUEkgbWV0aG9kIGhhcyBjdXJyZW50bHkgbm8gY2FsbGJhY2sgb24gQ2hyb21lLCBidXQgaXQgcmV0dXJuIGEgcHJvbWlzZSBvbiBGaXJlZm94LFxuICAgICAgICAgICAgICAvLyBhbmQgc28gdGhlIHBvbHlmaWxsIHdpbGwgdHJ5IHRvIGNhbGwgaXQgd2l0aCBhIGNhbGxiYWNrIGZpcnN0LCBhbmQgaXQgd2lsbCBmYWxsYmFja1xuICAgICAgICAgICAgICAvLyB0byBub3QgcGFzc2luZyB0aGUgY2FsbGJhY2sgaWYgdGhlIGZpcnN0IGNhbGwgZmFpbHMuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICAgICAgfSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoY2JFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtuYW1lfSBBUEkgbWV0aG9kIGRvZXNuJ3Qgc2VlbSB0byBzdXBwb3J0IHRoZSBjYWxsYmFjayBwYXJhbWV0ZXIsIGAgKyBcImZhbGxpbmcgYmFjayB0byBjYWxsIGl0IHdpdGhvdXQgYSBjYWxsYmFjazogXCIsIGNiRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgQVBJIG1ldGhvZCBtZXRhZGF0YSwgc28gdGhhdCB0aGUgbmV4dCBBUEkgY2FsbHMgd2lsbCBub3QgdHJ5IHRvXG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSB1bnN1cHBvcnRlZCBjYWxsYmFjayBhbnltb3JlLlxuICAgICAgICAgICAgICAgIG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbWV0YWRhdGEubm9DYWxsYmFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLm5vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncywgbWFrZUNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgICAgICB9LCBtZXRhZGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgLyoqXG4gICAgICAgKiBXcmFwcyBhbiBleGlzdGluZyBtZXRob2Qgb2YgdGhlIHRhcmdldCBvYmplY3QsIHNvIHRoYXQgY2FsbHMgdG8gaXQgYXJlXG4gICAgICAgKiBpbnRlcmNlcHRlZCBieSB0aGUgZ2l2ZW4gd3JhcHBlciBmdW5jdGlvbi4gVGhlIHdyYXBwZXIgZnVuY3Rpb24gcmVjZWl2ZXMsXG4gICAgICAgKiBhcyBpdHMgZmlyc3QgYXJndW1lbnQsIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YCBvYmplY3QsIGZvbGxvd2VkIGJ5IGVhY2ggb2ZcbiAgICAgICAqIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBvcmlnaW5hbCBtZXRob2QuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAgICogICAgICAgIFRoZSBvcmlnaW5hbCB0YXJnZXQgb2JqZWN0IHRoYXQgdGhlIHdyYXBwZWQgbWV0aG9kIGJlbG9uZ3MgdG8uXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtZXRob2RcbiAgICAgICAqICAgICAgICBUaGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuIFRoaXMgaXMgdXNlZCBhcyB0aGUgdGFyZ2V0IG9mIHRoZSBQcm94eVxuICAgICAgICogICAgICAgIG9iamVjdCB3aGljaCBpcyBjcmVhdGVkIHRvIHdyYXAgdGhlIG1ldGhvZC5cbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHdyYXBwZXJcbiAgICAgICAqICAgICAgICBUaGUgd3JhcHBlciBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgaW4gcGxhY2Ugb2YgYSBkaXJlY3QgaW52b2NhdGlvblxuICAgICAgICogICAgICAgIG9mIHRoZSB3cmFwcGVkIG1ldGhvZC5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7UHJveHk8ZnVuY3Rpb24+fVxuICAgICAgICogICAgICAgIEEgUHJveHkgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gbWV0aG9kLCB3aGljaCBpbnZva2VzIHRoZSBnaXZlbiB3cmFwcGVyXG4gICAgICAgKiAgICAgICAgbWV0aG9kIGluIGl0cyBwbGFjZS5cbiAgICAgICAqL1xuICAgICAgY29uc3Qgd3JhcE1ldGhvZCA9ICh0YXJnZXQsIG1ldGhvZCwgd3JhcHBlcikgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG1ldGhvZCwge1xuICAgICAgICAgIGFwcGx5KHRhcmdldE1ldGhvZCwgdGhpc09iaiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXIuY2FsbCh0aGlzT2JqLCB0YXJnZXQsIC4uLmFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgbGV0IGhhc093blByb3BlcnR5ID0gRnVuY3Rpb24uY2FsbC5iaW5kKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuXG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGFuIG9iamVjdCBpbiBhIFByb3h5IHdoaWNoIGludGVyY2VwdHMgYW5kIHdyYXBzIGNlcnRhaW4gbWV0aG9kc1xuICAgICAgICogYmFzZWQgb24gdGhlIGdpdmVuIGB3cmFwcGVyc2AgYW5kIGBtZXRhZGF0YWAgb2JqZWN0cy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICAgKiAgICAgICAgVGhlIHRhcmdldCBvYmplY3QgdG8gd3JhcC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gW3dyYXBwZXJzID0ge31dXG4gICAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyB3cmFwcGVyIGZ1bmN0aW9ucyBmb3Igc3BlY2lhbCBjYXNlcy4gQW55XG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24gcHJlc2VudCBpbiB0aGlzIG9iamVjdCB0cmVlIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGVcbiAgICAgICAqICAgICAgICBtZXRob2QgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlLiBUaGVzZVxuICAgICAgICogICAgICAgIHdyYXBwZXIgbWV0aG9kcyBhcmUgaW52b2tlZCBhcyBkZXNjcmliZWQgaW4ge0BzZWUgd3JhcE1ldGhvZH0uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IFttZXRhZGF0YSA9IHt9XVxuICAgICAgICogICAgICAgIEFuIG9iamVjdCB0cmVlIGNvbnRhaW5pbmcgbWV0YWRhdGEgdXNlZCB0byBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlXG4gICAgICAgKiAgICAgICAgUHJvbWlzZS1iYXNlZCB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYXN5bmNocm9ub3VzLiBBbnkgZnVuY3Rpb24gaW5cbiAgICAgICAqICAgICAgICB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUgd2hpY2ggaGFzIGEgY29ycmVzcG9uZGluZyBtZXRhZGF0YSBvYmplY3RcbiAgICAgICAqICAgICAgICBpbiB0aGUgc2FtZSBsb2NhdGlvbiBpbiB0aGUgYG1ldGFkYXRhYCB0cmVlIGlzIHJlcGxhY2VkIHdpdGggYW5cbiAgICAgICAqICAgICAgICBhdXRvbWF0aWNhbGx5LWdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLCBhcyBkZXNjcmliZWQgaW5cbiAgICAgICAqICAgICAgICB7QHNlZSB3cmFwQXN5bmNGdW5jdGlvbn1cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7UHJveHk8b2JqZWN0Pn1cbiAgICAgICAqL1xuICAgICAgY29uc3Qgd3JhcE9iamVjdCA9ICh0YXJnZXQsIHdyYXBwZXJzID0ge30sIG1ldGFkYXRhID0ge30pID0+IHtcbiAgICAgICAgbGV0IGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgbGV0IGhhbmRsZXJzID0ge1xuICAgICAgICAgIGhhcyhwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0IHx8IHByb3AgaW4gY2FjaGU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBnZXQocHJveHlUYXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIShwcm9wIGluIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRhcmdldFtwcm9wXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIG9uIHRoZSB1bmRlcmx5aW5nIG9iamVjdC4gQ2hlY2sgaWYgd2UgbmVlZCB0byBkb1xuICAgICAgICAgICAgICAvLyBhbnkgd3JhcHBpbmcuXG5cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3cmFwcGVyc1twcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHNwZWNpYWwtY2FzZSB3cmFwcGVyIGZvciB0aGlzIG1ldGhvZC5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBNZXRob2QodGFyZ2V0LCB0YXJnZXRbcHJvcF0sIHdyYXBwZXJzW3Byb3BdKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIGFzeW5jIG1ldGhvZCB0aGF0IHdlIGhhdmUgbWV0YWRhdGEgZm9yLiBDcmVhdGUgYVxuICAgICAgICAgICAgICAgIC8vIFByb21pc2Ugd3JhcHBlciBmb3IgaXQuXG4gICAgICAgICAgICAgICAgbGV0IHdyYXBwZXIgPSB3cmFwQXN5bmNGdW5jdGlvbihwcm9wLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIHRoYXQgd2UgZG9uJ3Qga25vdyBvciBjYXJlIGFib3V0LiBSZXR1cm4gdGhlXG4gICAgICAgICAgICAgICAgLy8gb3JpZ2luYWwgbWV0aG9kLCBib3VuZCB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5iaW5kKHRhcmdldCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIChoYXNPd25Qcm9wZXJ0eSh3cmFwcGVycywgcHJvcCkgfHwgaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSkge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIG9iamVjdCB0aGF0IHdlIG5lZWQgdG8gZG8gc29tZSB3cmFwcGluZyBmb3IgdGhlIGNoaWxkcmVuXG4gICAgICAgICAgICAgIC8vIG9mLiBDcmVhdGUgYSBzdWItb2JqZWN0IHdyYXBwZXIgZm9yIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGNoaWxkXG4gICAgICAgICAgICAgIC8vIG1ldGFkYXRhLlxuICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBcIipcIikpIHtcbiAgICAgICAgICAgICAgLy8gV3JhcCBhbGwgcHJvcGVydGllcyBpbiAqIG5hbWVzcGFjZS5cbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwT2JqZWN0KHZhbHVlLCB3cmFwcGVyc1twcm9wXSwgbWV0YWRhdGFbXCIqXCJdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55IHdyYXBwaW5nIGZvciB0aGlzIHByb3BlcnR5LFxuICAgICAgICAgICAgICAvLyBzbyBqdXN0IGZvcndhcmQgYWxsIGFjY2VzcyB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhY2hlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQocHJveHlUYXJnZXQsIHByb3AsIHZhbHVlLCByZWNlaXZlcikge1xuICAgICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCwgZGVzYykge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIGRlc2MpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZGVsZXRlUHJvcGVydHkocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGNhY2hlLCBwcm9wKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUGVyIGNvbnRyYWN0IG9mIHRoZSBQcm94eSBBUEksIHRoZSBcImdldFwiIHByb3h5IGhhbmRsZXIgbXVzdCByZXR1cm4gdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSB0YXJnZXQgaWYgdGhhdCB2YWx1ZSBpcyBkZWNsYXJlZCByZWFkLW9ubHkgYW5kXG4gICAgICAgIC8vIG5vbi1jb25maWd1cmFibGUuIEZvciB0aGlzIHJlYXNvbiwgd2UgY3JlYXRlIGFuIG9iamVjdCB3aXRoIHRoZVxuICAgICAgICAvLyBwcm90b3R5cGUgc2V0IHRvIGB0YXJnZXRgIGluc3RlYWQgb2YgdXNpbmcgYHRhcmdldGAgZGlyZWN0bHkuXG4gICAgICAgIC8vIE90aGVyd2lzZSB3ZSBjYW5ub3QgcmV0dXJuIGEgY3VzdG9tIG9iamVjdCBmb3IgQVBJcyB0aGF0XG4gICAgICAgIC8vIGFyZSBkZWNsYXJlZCByZWFkLW9ubHkgYW5kIG5vbi1jb25maWd1cmFibGUsIHN1Y2ggYXMgYGNocm9tZS5kZXZ0b29sc2AuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSBwcm94eSBoYW5kbGVycyB0aGVtc2VsdmVzIHdpbGwgc3RpbGwgdXNlIHRoZSBvcmlnaW5hbCBgdGFyZ2V0YFxuICAgICAgICAvLyBpbnN0ZWFkIG9mIHRoZSBgcHJveHlUYXJnZXRgLCBzbyB0aGF0IHRoZSBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzIGFyZVxuICAgICAgICAvLyBkZXJlZmVyZW5jZWQgdmlhIHRoZSBvcmlnaW5hbCB0YXJnZXRzLlxuICAgICAgICBsZXQgcHJveHlUYXJnZXQgPSBPYmplY3QuY3JlYXRlKHRhcmdldCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHkocHJveHlUYXJnZXQsIGhhbmRsZXJzKTtcbiAgICAgIH07XG5cbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhIHNldCBvZiB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYW4gZXZlbnQgb2JqZWN0LCB3aGljaCBoYW5kbGVzXG4gICAgICAgKiB3cmFwcGluZyBvZiBsaXN0ZW5lciBmdW5jdGlvbnMgdGhhdCB0aG9zZSBtZXNzYWdlcyBhcmUgcGFzc2VkLlxuICAgICAgICpcbiAgICAgICAqIEEgc2luZ2xlIHdyYXBwZXIgaXMgY3JlYXRlZCBmb3IgZWFjaCBsaXN0ZW5lciBmdW5jdGlvbiwgYW5kIHN0b3JlZCBpbiBhXG4gICAgICAgKiBtYXAuIFN1YnNlcXVlbnQgY2FsbHMgdG8gYGFkZExpc3RlbmVyYCwgYGhhc0xpc3RlbmVyYCwgb3IgYHJlbW92ZUxpc3RlbmVyYFxuICAgICAgICogcmV0cmlldmUgdGhlIG9yaWdpbmFsIHdyYXBwZXIsIHNvIHRoYXQgIGF0dGVtcHRzIHRvIHJlbW92ZSBhXG4gICAgICAgKiBwcmV2aW91c2x5LWFkZGVkIGxpc3RlbmVyIHdvcmsgYXMgZXhwZWN0ZWQuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtEZWZhdWx0V2Vha01hcDxmdW5jdGlvbiwgZnVuY3Rpb24+fSB3cmFwcGVyTWFwXG4gICAgICAgKiAgICAgICAgQSBEZWZhdWx0V2Vha01hcCBvYmplY3Qgd2hpY2ggd2lsbCBjcmVhdGUgdGhlIGFwcHJvcHJpYXRlIHdyYXBwZXJcbiAgICAgICAqICAgICAgICBmb3IgYSBnaXZlbiBsaXN0ZW5lciBmdW5jdGlvbiB3aGVuIG9uZSBkb2VzIG5vdCBleGlzdCwgYW5kIHJldHJpZXZlXG4gICAgICAgKiAgICAgICAgYW4gZXhpc3Rpbmcgb25lIHdoZW4gaXQgZG9lcy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAgICovXG4gICAgICBjb25zdCB3cmFwRXZlbnQgPSB3cmFwcGVyTWFwID0+ICh7XG4gICAgICAgIGFkZExpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIsIC4uLmFyZ3MpIHtcbiAgICAgICAgICB0YXJnZXQuYWRkTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpLCAuLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFzTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICAgIHJldHVybiB0YXJnZXQuaGFzTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICAgIHRhcmdldC5yZW1vdmVMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lcikpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG9uUmVxdWVzdEZpbmlzaGVkV3JhcHBlcnMgPSBuZXcgRGVmYXVsdFdlYWtNYXAobGlzdGVuZXIgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogV3JhcHMgYW4gb25SZXF1ZXN0RmluaXNoZWQgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCB3aWxsIHJldHVybiBhXG4gICAgICAgICAqIGBnZXRDb250ZW50KClgIHByb3BlcnR5IHdoaWNoIHJldHVybnMgYSBgUHJvbWlzZWAgcmF0aGVyIHRoYW4gdXNpbmcgYVxuICAgICAgICAgKiBjYWxsYmFjayBBUEkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAgICAgICAgICogICAgICAgIFRoZSBIQVIgZW50cnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbmV0d29yayByZXF1ZXN0LlxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG9uUmVxdWVzdEZpbmlzaGVkKHJlcSkge1xuICAgICAgICAgIGNvbnN0IHdyYXBwZWRSZXEgPSB3cmFwT2JqZWN0KHJlcSwge30gLyogd3JhcHBlcnMgKi8sIHtcbiAgICAgICAgICAgIGdldENvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxpc3RlbmVyKHdyYXBwZWRSZXEpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBjb25zdCBvbk1lc3NhZ2VXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcmFwcyBhIG1lc3NhZ2UgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCBtYXkgc2VuZCByZXNwb25zZXMgYmFzZWQgb25cbiAgICAgICAgICogaXRzIHJldHVybiB2YWx1ZSwgcmF0aGVyIHRoYW4gYnkgcmV0dXJuaW5nIGEgc2VudGluZWwgdmFsdWUgYW5kIGNhbGxpbmcgYVxuICAgICAgICAgKiBjYWxsYmFjay4gSWYgdGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHJldHVybnMgYSBQcm9taXNlLCB0aGUgcmVzcG9uc2UgaXNcbiAgICAgICAgICogc2VudCB3aGVuIHRoZSBwcm9taXNlIGVpdGhlciByZXNvbHZlcyBvciByZWplY3RzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0geyp9IG1lc3NhZ2VcbiAgICAgICAgICogICAgICAgIFRoZSBtZXNzYWdlIHNlbnQgYnkgdGhlIG90aGVyIGVuZCBvZiB0aGUgY2hhbm5lbC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHNlbmRlclxuICAgICAgICAgKiAgICAgICAgRGV0YWlscyBhYm91dCB0aGUgc2VuZGVyIG9mIHRoZSBtZXNzYWdlLlxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCopfSBzZW5kUmVzcG9uc2VcbiAgICAgICAgICogICAgICAgIEEgY2FsbGJhY2sgd2hpY2gsIHdoZW4gY2FsbGVkIHdpdGggYW4gYXJiaXRyYXJ5IGFyZ3VtZW50LCBzZW5kc1xuICAgICAgICAgKiAgICAgICAgdGhhdCB2YWx1ZSBhcyBhIHJlc3BvbnNlLlxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICogICAgICAgIFRydWUgaWYgdGhlIHdyYXBwZWQgbGlzdGVuZXIgcmV0dXJuZWQgYSBQcm9taXNlLCB3aGljaCB3aWxsIGxhdGVyXG4gICAgICAgICAqICAgICAgICB5aWVsZCBhIHJlc3BvbnNlLiBGYWxzZSBvdGhlcndpc2UuXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gb25NZXNzYWdlKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgbGV0IGRpZENhbGxTZW5kUmVzcG9uc2UgPSBmYWxzZTtcbiAgICAgICAgICBsZXQgd3JhcHBlZFNlbmRSZXNwb25zZTtcbiAgICAgICAgICBsZXQgc2VuZFJlc3BvbnNlUHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgd3JhcHBlZFNlbmRSZXNwb25zZSA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICBkaWRDYWxsU2VuZFJlc3BvbnNlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGxpc3RlbmVyKG1lc3NhZ2UsIHNlbmRlciwgd3JhcHBlZFNlbmRSZXNwb25zZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBpc1Jlc3VsdFRoZW5hYmxlID0gcmVzdWx0ICE9PSB0cnVlICYmIGlzVGhlbmFibGUocmVzdWx0KTtcblxuICAgICAgICAgIC8vIElmIHRoZSBsaXN0ZW5lciBkaWRuJ3QgcmV0dXJuZWQgdHJ1ZSBvciBhIFByb21pc2UsIG9yIGNhbGxlZFxuICAgICAgICAgIC8vIHdyYXBwZWRTZW5kUmVzcG9uc2Ugc3luY2hyb25vdXNseSwgd2UgY2FuIGV4aXQgZWFybGllclxuICAgICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgd2lsbCBiZSBubyByZXNwb25zZSBzZW50IGZyb20gdGhpcyBsaXN0ZW5lci5cbiAgICAgICAgICBpZiAocmVzdWx0ICE9PSB0cnVlICYmICFpc1Jlc3VsdFRoZW5hYmxlICYmICFkaWRDYWxsU2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQSBzbWFsbCBoZWxwZXIgdG8gc2VuZCB0aGUgbWVzc2FnZSBpZiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgICAgIC8vIGFuZCBhbiBlcnJvciBpZiB0aGUgcHJvbWlzZSByZWplY3RzIChhIHdyYXBwZWQgc2VuZE1lc3NhZ2UgaGFzXG4gICAgICAgICAgLy8gdG8gdHJhbnNsYXRlIHRoZSBtZXNzYWdlIGludG8gYSByZXNvbHZlZCBwcm9taXNlIG9yIGEgcmVqZWN0ZWRcbiAgICAgICAgICAvLyBwcm9taXNlKS5cbiAgICAgICAgICBjb25zdCBzZW5kUHJvbWlzZWRSZXN1bHQgPSBwcm9taXNlID0+IHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihtc2cgPT4ge1xuICAgICAgICAgICAgICAvLyBzZW5kIHRoZSBtZXNzYWdlIHZhbHVlLlxuICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UobXNnKTtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgLy8gU2VuZCBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGlmIHRoZSByZWplY3RlZCB2YWx1ZVxuICAgICAgICAgICAgICAvLyBpcyBhbiBpbnN0YW5jZSBvZiBlcnJvciwgb3IgdGhlIG9iamVjdCBpdHNlbGYgb3RoZXJ3aXNlLlxuICAgICAgICAgICAgICBsZXQgbWVzc2FnZTtcbiAgICAgICAgICAgICAgaWYgKGVycm9yICYmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yIHx8IHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWRcIjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICAgIF9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgLy8gUHJpbnQgYW4gZXJyb3Igb24gdGhlIGNvbnNvbGUgaWYgdW5hYmxlIHRvIHNlbmQgdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNlbmQgb25NZXNzYWdlIHJlamVjdGVkIHJlcGx5XCIsIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gSWYgdGhlIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgc2VuZCB0aGUgcmVzb2x2ZWQgdmFsdWUgYXMgYVxuICAgICAgICAgIC8vIHJlc3VsdCwgb3RoZXJ3aXNlIHdhaXQgdGhlIHByb21pc2UgcmVsYXRlZCB0byB0aGUgd3JhcHBlZFNlbmRSZXNwb25zZVxuICAgICAgICAgIC8vIGNhbGxiYWNrIHRvIHJlc29sdmUgYW5kIHNlbmQgaXQgYXMgYSByZXNwb25zZS5cbiAgICAgICAgICBpZiAoaXNSZXN1bHRUaGVuYWJsZSkge1xuICAgICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbmRQcm9taXNlZFJlc3VsdChzZW5kUmVzcG9uc2VQcm9taXNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBMZXQgQ2hyb21lIGtub3cgdGhhdCB0aGUgbGlzdGVuZXIgaXMgcmVwbHlpbmcuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrID0gKHtcbiAgICAgICAgcmVqZWN0LFxuICAgICAgICByZXNvbHZlXG4gICAgICB9LCByZXBseSkgPT4ge1xuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgIC8vIERldGVjdCB3aGVuIG5vbmUgb2YgdGhlIGxpc3RlbmVycyByZXBsaWVkIHRvIHRoZSBzZW5kTWVzc2FnZSBjYWxsIGFuZCByZXNvbHZlXG4gICAgICAgICAgLy8gdGhlIHByb21pc2UgdG8gdW5kZWZpbmVkIGFzIGluIEZpcmVmb3guXG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9pc3N1ZXMvMTMwXG4gICAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSA9PT0gQ0hST01FX1NFTkRfTUVTU0FHRV9DQUxMQkFDS19OT19SRVNQT05TRV9NRVNTQUdFKSB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlcGx5ICYmIHJlcGx5Ll9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXykge1xuICAgICAgICAgIC8vIENvbnZlcnQgYmFjayB0aGUgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXJyb3IgaW50b1xuICAgICAgICAgIC8vIGFuIEVycm9yIGluc3RhbmNlLlxuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IocmVwbHkubWVzc2FnZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUocmVwbHkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlID0gKG5hbWUsIG1ldGFkYXRhLCBhcGlOYW1lc3BhY2VPYmosIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHdyYXBwZWRDYiA9IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrLmJpbmQobnVsbCwge1xuICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGFyZ3MucHVzaCh3cmFwcGVkQ2IpO1xuICAgICAgICAgIGFwaU5hbWVzcGFjZU9iai5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgY29uc3Qgc3RhdGljV3JhcHBlcnMgPSB7XG4gICAgICAgIGRldnRvb2xzOiB7XG4gICAgICAgICAgbmV0d29yazoge1xuICAgICAgICAgICAgb25SZXF1ZXN0RmluaXNoZWQ6IHdyYXBFdmVudChvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcnVudGltZToge1xuICAgICAgICAgIG9uTWVzc2FnZTogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgICBvbk1lc3NhZ2VFeHRlcm5hbDogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7XG4gICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgbWF4QXJnczogM1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHRhYnM6IHtcbiAgICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7XG4gICAgICAgICAgICBtaW5BcmdzOiAyLFxuICAgICAgICAgICAgbWF4QXJnczogM1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjb25zdCBzZXR0aW5nTWV0YWRhdGEgPSB7XG4gICAgICAgIGNsZWFyOiB7XG4gICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICBtYXhBcmdzOiAxXG4gICAgICAgIH0sXG4gICAgICAgIGdldDoge1xuICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgbWF4QXJnczogMVxuICAgICAgICB9LFxuICAgICAgICBzZXQ6IHtcbiAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgIG1heEFyZ3M6IDFcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGFwaU1ldGFkYXRhLnByaXZhY3kgPSB7XG4gICAgICAgIG5ldHdvcms6IHtcbiAgICAgICAgICBcIipcIjogc2V0dGluZ01ldGFkYXRhXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgXCIqXCI6IHNldHRpbmdNZXRhZGF0YVxuICAgICAgICB9LFxuICAgICAgICB3ZWJzaXRlczoge1xuICAgICAgICAgIFwiKlwiOiBzZXR0aW5nTWV0YWRhdGFcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiB3cmFwT2JqZWN0KGV4dGVuc2lvbkFQSXMsIHN0YXRpY1dyYXBwZXJzLCBhcGlNZXRhZGF0YSk7XG4gICAgfTtcblxuICAgIC8vIFRoZSBidWlsZCBwcm9jZXNzIGFkZHMgYSBVTUQgd3JhcHBlciBhcm91bmQgdGhpcyBmaWxlLCB3aGljaCBtYWtlcyB0aGVcbiAgICAvLyBgbW9kdWxlYCB2YXJpYWJsZSBhdmFpbGFibGUuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3cmFwQVBJcyhjaHJvbWUpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5icm93c2VyO1xuICB9XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJyb3dzZXItcG9seWZpbGwuanMubWFwXG4iLCJleHBvcnQgaW50ZXJmYWNlIFJldHJ5T3B0aW9ucyB7XG4gIG1heFJldHJpZXM/OiBudW1iZXI7XG4gIGJhc2VEZWxheU1zPzogbnVtYmVyO1xuICBvblJldHJ5PzogKGF0dGVtcHQ6IG51bWJlciwgZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xuICBzaG91bGRSZXRyeT86IChlcnJvcjogYW55KSA9PiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVKaXR0ZXJEZWxheShhdHRlbXB0OiBudW1iZXIsIGJhc2VEZWxheU1zOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBkZWxheSA9IGJhc2VEZWxheU1zICogTWF0aC5wb3coMiwgYXR0ZW1wdCAtIDEpO1xuICBjb25zdCBhcnJheSA9IG5ldyBVaW50MzJBcnJheSgxKTtcbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XG4gIGNvbnN0IHJhbmRvbVZhbCA9IGFycmF5WzBdIC8gMHhmZmZmZmZmZjtcbiAgcmV0dXJuIGRlbGF5ICsgcmFuZG9tVmFsICogMTAwO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd2l0aEV4cG9uZW50aWFsQmFja29mZjxUPihcbiAgZm46ICgpID0+IFByb21pc2U8VD4sXG4gIG9wdGlvbnM6IFJldHJ5T3B0aW9ucyA9IHt9LFxuKTogUHJvbWlzZTxUPiB7XG4gIGNvbnN0IG1heFJldHJpZXMgPSBvcHRpb25zLm1heFJldHJpZXMgPz8gMztcbiAgY29uc3QgYmFzZURlbGF5TXMgPSBvcHRpb25zLmJhc2VEZWxheU1zID8/IDUwMDtcblxuICBsZXQgYXR0ZW1wdCA9IDA7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgYXR0ZW1wdCsrO1xuICAgICAgaWYgKGF0dGVtcHQgPiBtYXhSZXRyaWVzKSB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5zaG91bGRSZXRyeSAmJiAhb3B0aW9ucy5zaG91bGRSZXRyeShlcnJvcikpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLm9uUmV0cnkpIHtcbiAgICAgICAgb3B0aW9ucy5vblJldHJ5KGF0dGVtcHQsIGVycm9yKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdG90YWxEZWxheSA9IGNhbGN1bGF0ZUppdHRlckRlbGF5KGF0dGVtcHQsIGJhc2VEZWxheU1zKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHRvdGFsRGVsYXkpKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IFRyYW5zbGF0aW9uRW5kcG9pbnQsIFRyYW5zbGF0aW9uUmVxdWVzdCB9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgd2l0aEV4cG9uZW50aWFsQmFja29mZiB9IGZyb20gJy4vcmV0cnknO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9FTkRQT0lOVFM6IFRyYW5zbGF0aW9uRW5kcG9pbnRbXSA9IFtcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZWFwaXMuY29tJyxcbiAgICBuYW1lOiAnR29vZ2xlIFRyYW5zbGF0ZSBGYXN0IE11bHRpLUJhdGNoIEVuZ2luZScsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIHVybDogJ2h0dHBzOi8vdHJhbnNsYXRlLmFyZ29zb3BlbnRlY2guY29tJyxcbiAgICBuYW1lOiAnQXJnb3MgT3BlbiBUZWNoIChQdWJsaWMgTGlicmVUcmFuc2xhdGUpJyxcbiAgICBlbmFibGVkOiB0cnVlLFxuICB9LFxuICB7XG4gICAgdXJsOiAnaHR0cHM6Ly9saWJyZXRyYW5zbGF0ZS5jb20nLFxuICAgIG5hbWU6ICdMaWJyZVRyYW5zbGF0ZSAoT2ZmaWNpYWwgUHVibGljKScsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIHVybDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXG4gICAgbmFtZTogJ0xvY2FsIERvY2tlciBJbnN0YW5jZSAoTGlicmVUcmFuc2xhdGUpJyxcbiAgICBlbmFibGVkOiBmYWxzZSxcbiAgfSxcbl07XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2xhdG9yQ2xpZW50IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmRwb2ludHM6IFRyYW5zbGF0aW9uRW5kcG9pbnRbXSA9IERFRkFVTFRfRU5EUE9JTlRTKSB7fVxuXG4gIHB1YmxpYyB1cGRhdGVFbmRwb2ludHMoZW5kcG9pbnRzOiBUcmFuc2xhdGlvbkVuZHBvaW50W10pIHtcbiAgICB0aGlzLmVuZHBvaW50cyA9IGVuZHBvaW50cztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QWN0aXZlRW5kcG9pbnRzKCk6IFRyYW5zbGF0aW9uRW5kcG9pbnRbXSB7XG4gICAgY29uc3QgYWN0aXZlID0gdGhpcy5lbmRwb2ludHMuZmlsdGVyKChlKSA9PiBlLmVuYWJsZWQpO1xuICAgIHJldHVybiBhY3RpdmUubGVuZ3RoID4gMCA/IGFjdGl2ZSA6IERFRkFVTFRfRU5EUE9JTlRTO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZXMgYXJyYXkgb2YgdGV4dCBzdHJpbmdzIHVzaW5nIHVsdHJhLWZhc3Qgam9pbmVkIG11bHRpLXRleHQgYmF0Y2hpbmcuXG4gICAqIEJsYXppbmcgZmFzdCBzcGVlZCAofjEwMC0yMDBtcyB0b3RhbCBmb3IgZW50aXJlIHdlYiBwYWdlKS5cbiAgICovXG4gIGFzeW5jIHRyYW5zbGF0ZUJhdGNoKFxuICAgIHRleHRzOiBzdHJpbmdbXSxcbiAgICBzb3VyY2U6IHN0cmluZyxcbiAgICB0YXJnZXQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGlmICh0ZXh0cy5sZW5ndGggPT09IDApIHJldHVybiBbXTtcbiAgICBpZiAoc291cmNlID09PSB0YXJnZXQgJiYgc291cmNlICE9PSAnYXV0bycpIHJldHVybiB0ZXh0cztcblxuICAgIGNvbnN0IHJlc29sdmVkU291cmNlID0gc291cmNlID09PSAnYXV0bycgPyAnYXV0bycgOiBzb3VyY2U7XG5cbiAgICAvLyBGYXN0IFN0cmF0ZWd5IDE6IEdvb2dsZSBHVFggRmFzdCBKb2luZWQgQmF0Y2ggRW5naW5lICgxMHgtMjB4IGZhc3RlcilcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudHJhbnNsYXRlV2l0aEdvb2dsZUdUWEZhc3QodGV4dHMsIHJlc29sdmVkU291cmNlLCB0YXJnZXQpO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ0dvb2dsZSBHVFggRmFzdCBFbmdpbmUgZmFpbGVkLCBmYWxsaW5nIGJhY2sgdG8gZW5kcG9pbnRzLi4uJywgZXJyLm1lc3NhZ2UpO1xuICAgIH1cblxuICAgIC8vIFN0cmF0ZWd5IDI6IEFjdGl2ZSBjb25maWd1cmVkIGVuZHBvaW50c1xuICAgIGNvbnN0IGVuZHBvaW50cyA9IHRoaXMuZ2V0QWN0aXZlRW5kcG9pbnRzKCk7XG4gICAgZm9yIChjb25zdCBlbmRwb2ludCBvZiBlbmRwb2ludHMpIHtcbiAgICAgIGlmIChlbmRwb2ludC51cmwuaW5jbHVkZXMoJ2dvb2dsZWFwaXMnKSkgY29udGludWU7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgd2l0aEV4cG9uZW50aWFsQmFja29mZihcbiAgICAgICAgICAoKSA9PiB0aGlzLnJlcXVlc3RMaWJyZVRyYW5zbGF0ZShlbmRwb2ludCwgdGV4dHMsIHJlc29sdmVkU291cmNlLCB0YXJnZXQpLFxuICAgICAgICAgIHsgbWF4UmV0cmllczogMSwgYmFzZURlbGF5TXM6IDI1MCB9LFxuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBFbmRwb2ludCAke2VuZHBvaW50LnVybH0gZmFpbGVkOiAke2Vyci5tZXNzYWdlfS4gVHJ5aW5nIG5leHQuLi5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdHJhdGVneSAzOiBMaW5ndmEgZmFsbGJhY2tcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudHJhbnNsYXRlV2l0aExpbmd2YSh0ZXh0cywgcmVzb2x2ZWRTb3VyY2UsIHRhcmdldCk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FsbCB0cmFuc2xhdGlvbiBlbmdpbmVzIGZhaWxlZDonLCBlcnIubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRleHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVsdHJhLUZhc3QgSm9pbmVkIE11bHRpLVRleHQgQmF0Y2ggVHJhbnNsYXRvci5cbiAgICogQ29tYmluZXMgbXVsdGlwbGUgdGV4dCBub2RlcyBpbnRvIHNpbmdsZSBIVFRQIHJlcXVlc3RzIHVzaW5nIHVuaXF1ZSBuZXdsaW5lIGRlbGltaXRlcnMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHRyYW5zbGF0ZVdpdGhHb29nbGVHVFhGYXN0KFxuICAgIHRleHRzOiBzdHJpbmdbXSxcbiAgICBzb3VyY2U6IHN0cmluZyxcbiAgICB0YXJnZXQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IERFTElNSVRFUiA9ICdcXG4tLS1cXG4nO1xuICAgIGNvbnN0IE1BWF9DSFVOS19DSEFSUyA9IDE4MDA7XG5cbiAgICAvLyBQYWNrIHRleHRzIGludG8gY2h1bmtzIHJlc3BlY3RpbmcgTUFYX0NIVU5LX0NIQVJTXG4gICAgY29uc3QgY2h1bmtzOiBBcnJheTx7IGpvaW5lZFRleHQ6IHN0cmluZzsgY291bnQ6IG51bWJlcjsgb3JpZ2luYWxJbmRpY2VzOiBudW1iZXJbXSB9PiA9IFtdO1xuICAgIGxldCBjdXJyZW50Q2h1bms6IHN0cmluZ1tdID0gW107XG4gICAgbGV0IGN1cnJlbnRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBjdXJyZW50TGVuZ3RoID0gMDtcblxuICAgIHRleHRzLmZvckVhY2goKHRleHQsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzYW5pdGl6ZWQgPSB0ZXh0LnJlcGxhY2UoL1xcbi0tLVxcbi9nLCAnICcpO1xuICAgICAgY29uc3QgbGVuID0gc2FuaXRpemVkLmxlbmd0aCArIERFTElNSVRFUi5sZW5ndGg7XG5cbiAgICAgIGlmIChjdXJyZW50TGVuZ3RoICsgbGVuID4gTUFYX0NIVU5LX0NIQVJTICYmIGN1cnJlbnRDaHVuay5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNodW5rcy5wdXNoKHtcbiAgICAgICAgICBqb2luZWRUZXh0OiBjdXJyZW50Q2h1bmsuam9pbihERUxJTUlURVIpLFxuICAgICAgICAgIGNvdW50OiBjdXJyZW50Q2h1bmsubGVuZ3RoLFxuICAgICAgICAgIG9yaWdpbmFsSW5kaWNlczogY3VycmVudEluZGljZXMsXG4gICAgICAgIH0pO1xuICAgICAgICBjdXJyZW50Q2h1bmsgPSBbXTtcbiAgICAgICAgY3VycmVudEluZGljZXMgPSBbXTtcbiAgICAgICAgY3VycmVudExlbmd0aCA9IDA7XG4gICAgICB9XG5cbiAgICAgIGN1cnJlbnRDaHVuay5wdXNoKHNhbml0aXplZCk7XG4gICAgICBjdXJyZW50SW5kaWNlcy5wdXNoKGluZGV4KTtcbiAgICAgIGN1cnJlbnRMZW5ndGggKz0gbGVuO1xuICAgIH0pO1xuXG4gICAgaWYgKGN1cnJlbnRDaHVuay5sZW5ndGggPiAwKSB7XG4gICAgICBjaHVua3MucHVzaCh7XG4gICAgICAgIGpvaW5lZFRleHQ6IGN1cnJlbnRDaHVuay5qb2luKERFTElNSVRFUiksXG4gICAgICAgIGNvdW50OiBjdXJyZW50Q2h1bmsubGVuZ3RoLFxuICAgICAgICBvcmlnaW5hbEluZGljZXM6IGN1cnJlbnRJbmRpY2VzLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxSZXN1bHRzOiBzdHJpbmdbXSA9IG5ldyBBcnJheSh0ZXh0cy5sZW5ndGgpO1xuICAgIGNvbnN0IHNsID0gc291cmNlIHx8ICdhdXRvJztcbiAgICBjb25zdCB0bCA9IHRhcmdldCB8fCAnZW4nO1xuXG4gICAgLy8gUGFyYWxsZWwgZXhlY3V0aW9uIGFjcm9zcyBhbGwgY2h1bmtzIGNvbmN1cnJlbnRseVxuICAgIGNvbnN0IGNodW5rUHJvbWlzZXMgPSBjaHVua3MubWFwKGFzeW5jIChjaHVuaykgPT4ge1xuICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZWFwaXMuY29tL3RyYW5zbGF0ZV9hL3NpbmdsZT9jbGllbnQ9Z3R4JnNsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICBzbCxcbiAgICAgICl9JnRsPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRsKX0mZHQ9dCZxPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNodW5rLmpvaW5lZFRleHQpfWA7XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHb29nbGUgR1RYIEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9YCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICBsZXQgZnVsbFRyYW5zbGF0ZWQgPSAnJztcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgJiYgQXJyYXkuaXNBcnJheShkYXRhWzBdKSkge1xuICAgICAgICBmdWxsVHJhbnNsYXRlZCA9IGRhdGFbMF0ubWFwKChpdGVtOiBhbnkpID0+IGl0ZW1bMF0pLmpvaW4oJycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVsbFRyYW5zbGF0ZWQgPSBjaHVuay5qb2luZWRUZXh0O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzcGxpdFJlc3VsdHMgPSBmdWxsVHJhbnNsYXRlZC5zcGxpdCgvXFxuLS0tXFxufFxcbi0tLSBcXG58XFxuIC0tLSBcXG4vKTtcblxuICAgICAgY2h1bmsub3JpZ2luYWxJbmRpY2VzLmZvckVhY2goKG9yaWdJZHgsIGkpID0+IHtcbiAgICAgICAgZmluYWxSZXN1bHRzW29yaWdJZHhdID0gc3BsaXRSZXN1bHRzW2ldID8gc3BsaXRSZXN1bHRzW2ldLnRyaW0oKSA6IHRleHRzW29yaWdJZHhdO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChjaHVua1Byb21pc2VzKTtcbiAgICByZXR1cm4gZmluYWxSZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbmd2YSBUcmFuc2xhdGUgQVBJIChGYWxsYmFjaykuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHRyYW5zbGF0ZVdpdGhMaW5ndmEoXG4gICAgdGV4dHM6IHN0cmluZ1tdLFxuICAgIHNvdXJjZTogc3RyaW5nLFxuICAgIHRhcmdldDogc3RyaW5nLFxuICApOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzcmMgPSBzb3VyY2UgPT09ICdhdXRvJyA/ICdhdXRvJyA6IHNvdXJjZTtcblxuICAgIGZvciAoY29uc3QgdGV4dCBvZiB0ZXh0cykge1xuICAgICAgaWYgKCF0ZXh0IHx8IHRleHQudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXN1bHRzLnB1c2godGV4dCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vbGluZ3ZhLm1sL2FwaS92MS8ke2VuY29kZVVSSUNvbXBvbmVudChzcmMpfS8ke2VuY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICl9LyR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWA7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goZGF0YS50cmFuc2xhdGlvbiB8fCB0ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXN1bHRzLnB1c2godGV4dCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICAvKipcbiAgICogTGlicmVUcmFuc2xhdGUgQVBJIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyByZXF1ZXN0TGlicmVUcmFuc2xhdGUoXG4gICAgZW5kcG9pbnQ6IFRyYW5zbGF0aW9uRW5kcG9pbnQsXG4gICAgdGV4dHM6IHN0cmluZ1tdLFxuICAgIHNvdXJjZTogc3RyaW5nLFxuICAgIHRhcmdldDogc3RyaW5nLFxuICApOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgYmFzZVVybCA9IGVuZHBvaW50LnVybC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VVcmx9L3RyYW5zbGF0ZWA7XG5cbiAgICBsZXQgcmVzb2x2ZWRTb3VyY2UgPSBzb3VyY2U7XG4gICAgaWYgKCFyZXNvbHZlZFNvdXJjZSB8fCByZXNvbHZlZFNvdXJjZSA9PT0gJ2F1dG8nKSB7XG4gICAgICBjb25zdCBzYW1wbGVUZXh0ID0gdGV4dHMuZmluZCgodCkgPT4gdCAmJiB0LnRyaW0oKS5sZW5ndGggPiAzKSB8fCB0ZXh0c1swXSB8fCAnJztcbiAgICAgIGNvbnN0IGRldGVjdGVkID0gYXdhaXQgdGhpcy5kZXRlY3RMYW5ndWFnZShzYW1wbGVUZXh0KTtcbiAgICAgIHJlc29sdmVkU291cmNlID0gZGV0ZWN0ZWQgfHwgJ2VuJztcbiAgICB9XG5cbiAgICBjb25zdCBwYXlsb2FkOiBUcmFuc2xhdGlvblJlcXVlc3QgPSB7XG4gICAgICBxOiB0ZXh0cyxcbiAgICAgIHNvdXJjZTogcmVzb2x2ZWRTb3VyY2UsXG4gICAgICB0YXJnZXQsXG4gICAgICBmb3JtYXQ6ICd0ZXh0JyxcbiAgICB9O1xuXG4gICAgaWYgKGVuZHBvaW50LmFwaUtleSkge1xuICAgICAgcGF5bG9hZC5hcGlfa2V5ID0gZW5kcG9pbnQuYXBpS2V5O1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgfSk7XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICBsZXQgZXJyTWVzc2FnZSA9IGBIVFRQIEVycm9yICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWA7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlcnJKc29uID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICBpZiAoZXJySnNvbj8uZXJyb3IpIHtcbiAgICAgICAgICBlcnJNZXNzYWdlID0gYEhUVFAgRXJyb3IgJHtyZXNwb25zZS5zdGF0dXN9OiAke2Vyckpzb24uZXJyb3J9YDtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIElnbm9yZSBqc29uIGVycm9yXG4gICAgICB9XG4gICAgICBjb25zdCBlcnJvck9iajogYW55ID0gbmV3IEVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgZXJyb3JPYmouc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgICAgdGhyb3cgZXJyb3JPYmo7XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhLnRyYW5zbGF0ZWRUZXh0KSkge1xuICAgICAgcmV0dXJuIGRhdGEudHJhbnNsYXRlZFRleHQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YS50cmFuc2xhdGVkVGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBbZGF0YS50cmFuc2xhdGVkVGV4dF07XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIHRyYW5zbGF0aW9uIHJlc3BvbnNlIHN0cnVjdHVyZScpO1xuICB9XG5cbiAgYXN5bmMgdGVzdEVuZHBvaW50KFxuICAgIGVuZHBvaW50OiBUcmFuc2xhdGlvbkVuZHBvaW50LFxuICApOiBQcm9taXNlPHsgc3VjY2VzczogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW5nOyBzdXBwb3J0ZWRMYW5ndWFnZXM/OiBudW1iZXIgfT4ge1xuICAgIGlmIChlbmRwb2ludC51cmwuaW5jbHVkZXMoJ2dvb2dsZWFwaXMnKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZTogJ0Nvbm5lY3RlZCBzdWNjZXNzZnVsbHkgdG8gRmFzdCBHb29nbGUgRW5naW5lLicsXG4gICAgICAgIHN1cHBvcnRlZExhbmd1YWdlczogMTMwLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdXJsID0gYCR7ZW5kcG9pbnQudXJsLnJlcGxhY2UoL1xcLyQvLCAnJyl9L2xhbmd1YWdlc2A7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBoZWFkZXJzOiB7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9KTtcblxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogYEhUVFAgJHtyZXNwb25zZS5zdGF0dXN9OiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsYW5ndWFnZXMgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShsYW5ndWFnZXMpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBtZXNzYWdlOiBgQ29ubmVjdGVkIHN1Y2Nlc3NmdWxseSAoJHtsYW5ndWFnZXMubGVuZ3RofSBsYW5ndWFnZXMgc3VwcG9ydGVkKS5gLFxuICAgICAgICAgIHN1cHBvcnRlZExhbmd1YWdlczogbGFuZ3VhZ2VzLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnSW52YWxpZCByZXNwb25zZSBmb3JtYXQgZnJvbSBzZXJ2ZXIuJyB9O1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogZXJyLm1lc3NhZ2UgfHwgJ0Nvbm5lY3Rpb24gZmFpbGVkLicgfTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBkZXRlY3RMYW5ndWFnZSh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXJsID0gYGh0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZWFwaXMuY29tL3RyYW5zbGF0ZV9hL3NpbmdsZT9jbGllbnQ9Z3R4JnNsPWF1dG8mdGw9ZW4mZHQ9dCZxPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICB0ZXh0LFxuICAgICAgKX1gO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgIGlmIChkYXRhICYmIGRhdGFbMl0pIHtcbiAgICAgICAgICByZXR1cm4gZGF0YVsyXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlXG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0VHJhbnNsYXRvckNsaWVudCA9IG5ldyBUcmFuc2xhdG9yQ2xpZW50KCk7XG4iLCIvKipcbiAqIEdlbmVyYXRlcyBhIGZhc3QsIGRldGVybWluaXN0aWMgMzItYml0IEZOVi0xYSBoYXNoIGZvcm1hdHRlZCBhcyBoZXggc3RyaW5nLFxuICogc3VpdGFibGUgZm9yIHN0cmluZyBjYWNoZSBrZXlzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm52MWFIYXNoKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGhhc2ggPSAweDgxMWM5ZGM1O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNvZGVQb2ludCA9IHN0ci5jb2RlUG9pbnRBdChpKSB8fCAwO1xuICAgIGhhc2ggXj0gY29kZVBvaW50O1xuICAgIC8qIGhhc2ggKiAxNjc3NzYxOSAqL1xuICAgIGhhc2ggKz0gKGhhc2ggPDwgMSkgKyAoaGFzaCA8PCA0KSArIChoYXNoIDw8IDcpICsgKGhhc2ggPDwgOCkgKyAoaGFzaCA8PCAyNCk7XG4gIH1cbiAgcmV0dXJuIChoYXNoID4+PiAwKS50b1N0cmluZygxNikucGFkU3RhcnQoOCwgJzAnKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdW5pcXVlLCBkZXRlcm1pbmlzdGljIGNhY2hlIGtleSBmb3IgYSB0cmFuc2xhdGlvbiByZXF1ZXN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVLZXkodGV4dDogc3RyaW5nLCBzb3VyY2VMYW5nOiBzdHJpbmcsIHRhcmdldExhbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRUZXh0ID0gdGV4dC50cmltKCk7XG4gIGNvbnN0IHJhd0tleSA9IGAke25vcm1hbGl6ZWRUZXh0fTo6JHtzb3VyY2VMYW5nfTo6JHt0YXJnZXRMYW5nfWA7XG4gIHJldHVybiBmbnYxYUhhc2gocmF3S2V5KSArICdfJyArIG5vcm1hbGl6ZWRUZXh0Lmxlbmd0aDtcbn1cbiIsImltcG9ydCB7IENhY2hlRW50cnkgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IGdldENhY2hlS2V5IH0gZnJvbSAnLi9oYXNoJztcblxuY29uc3QgREJfTkFNRSA9ICdoaXRhcl90cmFuc2xhdGlvbl9jYWNoZSc7XG5jb25zdCBEQl9WRVJTSU9OID0gMTtcbmNvbnN0IFNUT1JFX05BTUUgPSAndHJhbnNsYXRpb25zJztcbmNvbnN0IERFRkFVTFRfTUFYX0VOVFJJRVMgPSAyMDAwMDtcblxuZXhwb3J0IGNsYXNzIFRyYW5zbGF0aW9uQ2FjaGUge1xuICBwcml2YXRlIGRiUHJvbWlzZTogUHJvbWlzZTxJREJEYXRhYmFzZT4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IG1heEVudHJpZXM6IG51bWJlciA9IERFRkFVTFRfTUFYX0VOVFJJRVMpIHt9XG5cbiAgcHJpdmF0ZSBnZXREQigpOiBQcm9taXNlPElEQkRhdGFiYXNlPiB7XG4gICAgaWYgKHRoaXMuZGJQcm9taXNlICE9PSBudWxsKSByZXR1cm4gdGhpcy5kYlByb21pc2U7XG5cbiAgICB0aGlzLmRiUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgaW5kZXhlZERCID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdJbmRleGVkREIgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGVudmlyb25tZW50LicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLm9wZW4oREJfTkFNRSwgREJfVkVSU0lPTik7XG5cbiAgICAgIHJlcXVlc3Qub251cGdyYWRlbmVlZGVkID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRiID0gKGV2ZW50LnRhcmdldCBhcyBJREJPcGVuREJSZXF1ZXN0KS5yZXN1bHQ7XG4gICAgICAgIGlmICghZGIub2JqZWN0U3RvcmVOYW1lcy5jb250YWlucyhTVE9SRV9OQU1FKSkge1xuICAgICAgICAgIGNvbnN0IHN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoU1RPUkVfTkFNRSwgeyBrZXlQYXRoOiAna2V5JyB9KTtcbiAgICAgICAgICBzdG9yZS5jcmVhdGVJbmRleCgnbGFzdEFjY2Vzc2VkJywgJ2xhc3RBY2Nlc3NlZCcsIHsgdW5pcXVlOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmVxdWVzdC5vbnN1Y2Nlc3MgPSAoKSA9PiByZXNvbHZlKHJlcXVlc3QucmVzdWx0KTtcbiAgICAgIHJlcXVlc3Qub25lcnJvciA9ICgpID0+IHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLmRiUHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIGdldChzb3VyY2VUZXh0OiBzdHJpbmcsIHNvdXJjZUxhbmc6IHN0cmluZywgdGFyZ2V0TGFuZzogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgY29uc3Qga2V5ID0gZ2V0Q2FjaGVLZXkoc291cmNlVGV4dCwgc291cmNlTGFuZywgdGFyZ2V0TGFuZyk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRiID0gYXdhaXQgdGhpcy5nZXREQigpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHR4ID0gZGIudHJhbnNhY3Rpb24oU1RPUkVfTkFNRSwgJ3JlYWR3cml0ZScpO1xuICAgICAgICBjb25zdCBzdG9yZSA9IHR4Lm9iamVjdFN0b3JlKFNUT1JFX05BTUUpO1xuICAgICAgICBjb25zdCByZXEgPSBzdG9yZS5nZXQoa2V5KTtcblxuICAgICAgICByZXEub25zdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVudHJ5OiBDYWNoZUVudHJ5IHwgdW5kZWZpbmVkID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgIGVudHJ5Lmxhc3RBY2Nlc3NlZCA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBzdG9yZS5wdXQoZW50cnkpO1xuICAgICAgICAgICAgcmVzb2x2ZShlbnRyeS50cmFuc2xhdGVkVGV4dCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlcS5vbmVycm9yID0gKCkgPT4gcmVzb2x2ZShudWxsKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0TWFueShcbiAgICB0ZXh0czogc3RyaW5nW10sXG4gICAgc291cmNlTGFuZzogc3RyaW5nLFxuICAgIHRhcmdldExhbmc6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBzdHJpbmc+PiB7XG4gICAgY29uc3QgcmVzdWx0TWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICBpZiAodGV4dHMubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzdWx0TWFwO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGRiID0gYXdhaXQgdGhpcy5nZXREQigpO1xuICAgICAgY29uc3QgdHggPSBkYi50cmFuc2FjdGlvbihTVE9SRV9OQU1FLCAncmVhZHdyaXRlJyk7XG4gICAgICBjb25zdCBzdG9yZSA9IHR4Lm9iamVjdFN0b3JlKFNUT1JFX05BTUUpO1xuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIHRleHRzLm1hcChcbiAgICAgICAgICAodGV4dCkgPT5cbiAgICAgICAgICAgIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGtleSA9IGdldENhY2hlS2V5KHRleHQsIHNvdXJjZUxhbmcsIHRhcmdldExhbmcpO1xuICAgICAgICAgICAgICBjb25zdCByZXEgPSBzdG9yZS5nZXQoa2V5KTtcblxuICAgICAgICAgICAgICByZXEub25zdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5OiBDYWNoZUVudHJ5IHwgdW5kZWZpbmVkID0gcmVxLnJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdE1hcC5zZXQodGV4dCwgZW50cnkudHJhbnNsYXRlZFRleHQpO1xuICAgICAgICAgICAgICAgICAgZW50cnkubGFzdEFjY2Vzc2VkID0gbm93O1xuICAgICAgICAgICAgICAgICAgc3RvcmUucHV0KGVudHJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIHJlcS5vbmVycm9yID0gKCkgPT4gcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gRmFsbGJhY2sgZ3JhY2VmdWxseSBvbiBJREIgZXJyb3JcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0TWFwO1xuICB9XG5cbiAgYXN5bmMgc2V0TWFueShcbiAgICB0cmFuc2xhdGlvbnM6IEFycmF5PHsgc291cmNlVGV4dDogc3RyaW5nOyB0cmFuc2xhdGVkVGV4dDogc3RyaW5nIH0+LFxuICAgIHNvdXJjZUxhbmc6IHN0cmluZyxcbiAgICB0YXJnZXRMYW5nOiBzdHJpbmcsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0cmFuc2xhdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZGIgPSBhd2FpdCB0aGlzLmdldERCKCk7XG4gICAgICBjb25zdCB0eCA9IGRiLnRyYW5zYWN0aW9uKFNUT1JFX05BTUUsICdyZWFkd3JpdGUnKTtcbiAgICAgIGNvbnN0IHN0b3JlID0gdHgub2JqZWN0U3RvcmUoU1RPUkVfTkFNRSk7XG4gICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuXG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgdHJhbnNsYXRpb25zKSB7XG4gICAgICAgIGlmICghaXRlbS5zb3VyY2VUZXh0IHx8ICFpdGVtLnRyYW5zbGF0ZWRUZXh0KSBjb250aW51ZTtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0Q2FjaGVLZXkoaXRlbS5zb3VyY2VUZXh0LCBzb3VyY2VMYW5nLCB0YXJnZXRMYW5nKTtcbiAgICAgICAgY29uc3QgZW50cnk6IENhY2hlRW50cnkgPSB7XG4gICAgICAgICAga2V5LFxuICAgICAgICAgIHNvdXJjZVRleHQ6IGl0ZW0uc291cmNlVGV4dCxcbiAgICAgICAgICB0cmFuc2xhdGVkVGV4dDogaXRlbS50cmFuc2xhdGVkVGV4dCxcbiAgICAgICAgICBzb3VyY2VMYW5nLFxuICAgICAgICAgIHRhcmdldExhbmcsXG4gICAgICAgICAgdGltZXN0YW1wOiBub3csXG4gICAgICAgICAgbGFzdEFjY2Vzc2VkOiBub3csXG4gICAgICAgIH07XG4gICAgICAgIHN0b3JlLnB1dChlbnRyeSk7XG4gICAgICB9XG5cbiAgICAgIHR4Lm9uY29tcGxldGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZXZpY3RJZk5lZWRlZCgpO1xuICAgICAgfTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIEZhbGxiYWNrIGdyYWNlZnVsbHkgb24gSURCIGVycm9yXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBldmljdElmTmVlZGVkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYiA9IGF3YWl0IHRoaXMuZ2V0REIoKTtcbiAgICAgIGNvbnN0IHR4ID0gZGIudHJhbnNhY3Rpb24oU1RPUkVfTkFNRSwgJ3JlYWR3cml0ZScpO1xuICAgICAgY29uc3Qgc3RvcmUgPSB0eC5vYmplY3RTdG9yZShTVE9SRV9OQU1FKTtcbiAgICAgIGNvbnN0IGNvdW50UmVxID0gc3RvcmUuY291bnQoKTtcblxuICAgICAgY291bnRSZXEub25zdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBjb3VudCA9IGNvdW50UmVxLnJlc3VsdDtcbiAgICAgICAgaWYgKGNvdW50IDw9IHRoaXMubWF4RW50cmllcykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG92ZXJhZ2UgPSBjb3VudCAtIHRoaXMubWF4RW50cmllcztcbiAgICAgICAgY29uc3QgaW5kZXggPSBzdG9yZS5pbmRleCgnbGFzdEFjY2Vzc2VkJyk7XG4gICAgICAgIGNvbnN0IGN1cnNvclJlcSA9IGluZGV4Lm9wZW5DdXJzb3IoKTtcbiAgICAgICAgbGV0IGRlbGV0ZWQgPSAwO1xuXG4gICAgICAgIGN1cnNvclJlcS5vbnN1Y2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgY3Vyc29yID0gY3Vyc29yUmVxLnJlc3VsdDtcbiAgICAgICAgICBpZiAoY3Vyc29yICYmIGRlbGV0ZWQgPCBvdmVyYWdlKSB7XG4gICAgICAgICAgICBjdXJzb3IuZGVsZXRlKCk7XG4gICAgICAgICAgICBkZWxldGVkKys7XG4gICAgICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gSWdub3JlIGV2aWN0aW9uIGVycm9yc1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNsZWFyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYiA9IGF3YWl0IHRoaXMuZ2V0REIoKTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHR4ID0gZGIudHJhbnNhY3Rpb24oU1RPUkVfTkFNRSwgJ3JlYWR3cml0ZScpO1xuICAgICAgICBjb25zdCBzdG9yZSA9IHR4Lm9iamVjdFN0b3JlKFNUT1JFX05BTUUpO1xuICAgICAgICBjb25zdCByZXEgPSBzdG9yZS5jbGVhcigpO1xuXG4gICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSAoKSA9PiByZXNvbHZlKCk7XG4gICAgICAgIHJlcS5vbmVycm9yID0gKCkgPT4gcmVqZWN0KHJlcS5lcnJvcik7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIElnbm9yZSBjbGVhciBlcnJvcnNcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRTdGF0cygpOiBQcm9taXNlPHsgY291bnQ6IG51bWJlcjsgbWF4RW50cmllczogbnVtYmVyIH0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZGIgPSBhd2FpdCB0aGlzLmdldERCKCk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgdHggPSBkYi50cmFuc2FjdGlvbihTVE9SRV9OQU1FLCAncmVhZG9ubHknKTtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSB0eC5vYmplY3RTdG9yZShTVE9SRV9OQU1FKTtcbiAgICAgICAgY29uc3QgcmVxID0gc3RvcmUuY291bnQoKTtcblxuICAgICAgICByZXEub25zdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgIHJlc29sdmUoeyBjb3VudDogcmVxLnJlc3VsdCwgbWF4RW50cmllczogdGhpcy5tYXhFbnRyaWVzIH0pO1xuICAgICAgICB9O1xuICAgICAgICByZXEub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKHsgY291bnQ6IDAsIG1heEVudHJpZXM6IHRoaXMubWF4RW50cmllcyB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHsgY291bnQ6IDAsIG1heEVudHJpZXM6IHRoaXMubWF4RW50cmllcyB9O1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRpb25DYWNoZSA9IG5ldyBUcmFuc2xhdGlvbkNhY2hlKCk7XG4iLCJpbXBvcnQgeyBUcmFuc2xhdGlvbkJhdGNoIH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0JBVENIX0NIQVJfQlVER0VUID0gMjAwMDtcblxuLyoqXG4gKiBQYWNrcyB0ZXh0IHN0cmluZ3MgaW50byBiYXRjaGVzIHJlc3BlY3RpbmcgYSBjaGFyYWN0ZXIgYnVkZ2V0IHBlciByZXF1ZXN0LlxuICogUHJlc2VydmVzIG9yaWdpbmFsIGFycmF5IGluZGljZXMgZm9yIG1hcC1iYWNrLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQmF0Y2hlcyhcbiAgdGV4dHM6IHN0cmluZ1tdLFxuICBjaGFyQnVkZ2V0OiBudW1iZXIgPSBERUZBVUxUX0JBVENIX0NIQVJfQlVER0VULFxuKTogVHJhbnNsYXRpb25CYXRjaFtdIHtcbiAgY29uc3QgYmF0Y2hlczogVHJhbnNsYXRpb25CYXRjaFtdID0gW107XG4gIGlmICh0ZXh0cy5sZW5ndGggPT09IDApIHJldHVybiBiYXRjaGVzO1xuXG4gIGxldCBjdXJyZW50QmF0Y2g6IHN0cmluZ1tdID0gW107XG4gIGxldCBjdXJyZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgbGV0IGN1cnJlbnRDaGFycyA9IDA7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHRleHQgPSB0ZXh0c1tpXTtcbiAgICBjb25zdCB0ZXh0TGVuZ3RoID0gdGV4dC5sZW5ndGg7XG5cbiAgICAvLyBJZiBzaW5nbGUgdGV4dCBleGNlZWRzIGJ1ZGdldCwgaXQgZ2V0cyBpdHMgb3duIGJhdGNoXG4gICAgaWYgKHRleHRMZW5ndGggPj0gY2hhckJ1ZGdldCkge1xuICAgICAgaWYgKGN1cnJlbnRCYXRjaC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGJhdGNoZXMucHVzaCh7XG4gICAgICAgICAgdGV4dHM6IGN1cnJlbnRCYXRjaCxcbiAgICAgICAgICB0b3RhbENoYXJzOiBjdXJyZW50Q2hhcnMsXG4gICAgICAgICAgaW5kaWNlczogY3VycmVudEluZGljZXMsXG4gICAgICAgIH0pO1xuICAgICAgICBjdXJyZW50QmF0Y2ggPSBbXTtcbiAgICAgICAgY3VycmVudEluZGljZXMgPSBbXTtcbiAgICAgICAgY3VycmVudENoYXJzID0gMDtcbiAgICAgIH1cblxuICAgICAgYmF0Y2hlcy5wdXNoKHtcbiAgICAgICAgdGV4dHM6IFt0ZXh0XSxcbiAgICAgICAgdG90YWxDaGFyczogdGV4dExlbmd0aCxcbiAgICAgICAgaW5kaWNlczogW2ldLFxuICAgICAgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhZGRpbmcgdGV4dCBleGNlZWRzIGJ1ZGdldFxuICAgIGlmIChjdXJyZW50Q2hhcnMgKyB0ZXh0TGVuZ3RoID4gY2hhckJ1ZGdldCAmJiBjdXJyZW50QmF0Y2gubGVuZ3RoID4gMCkge1xuICAgICAgYmF0Y2hlcy5wdXNoKHtcbiAgICAgICAgdGV4dHM6IGN1cnJlbnRCYXRjaCxcbiAgICAgICAgdG90YWxDaGFyczogY3VycmVudENoYXJzLFxuICAgICAgICBpbmRpY2VzOiBjdXJyZW50SW5kaWNlcyxcbiAgICAgIH0pO1xuICAgICAgY3VycmVudEJhdGNoID0gW107XG4gICAgICBjdXJyZW50SW5kaWNlcyA9IFtdO1xuICAgICAgY3VycmVudENoYXJzID0gMDtcbiAgICB9XG5cbiAgICBjdXJyZW50QmF0Y2gucHVzaCh0ZXh0KTtcbiAgICBjdXJyZW50SW5kaWNlcy5wdXNoKGkpO1xuICAgIGN1cnJlbnRDaGFycyArPSB0ZXh0TGVuZ3RoO1xuICB9XG5cbiAgaWYgKGN1cnJlbnRCYXRjaC5sZW5ndGggPiAwKSB7XG4gICAgYmF0Y2hlcy5wdXNoKHtcbiAgICAgIHRleHRzOiBjdXJyZW50QmF0Y2gsXG4gICAgICB0b3RhbENoYXJzOiBjdXJyZW50Q2hhcnMsXG4gICAgICBpbmRpY2VzOiBjdXJyZW50SW5kaWNlcyxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBiYXRjaGVzO1xufVxuIiwiaW1wb3J0IGJyb3dzZXIgZnJvbSAnd2ViZXh0ZW5zaW9uLXBvbHlmaWxsJztcbmltcG9ydCB7IEV4dGVuc2lvblNldHRpbmdzIH0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgeyBERUZBVUxUX0VORFBPSU5UUyB9IGZyb20gJy4vdHJhbnNsYXRvci1jbGllbnQnO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogRXh0ZW5zaW9uU2V0dGluZ3MgPSB7XG4gIGVuZHBvaW50czogREVGQVVMVF9FTkRQT0lOVFMsXG4gIGRlZmF1bHRTb3VyY2VMYW5nOiAnYXV0bycsXG4gIGRlZmF1bHRUYXJnZXRMYW5nOiAnZXMnLFxuICBhbHdheXNUcmFuc2xhdGVEb21haW5zOiBbXSxcbiAgbmV2ZXJUcmFuc2xhdGVEb21haW5zOiBbXSxcbiAgcGVyU2l0ZVRhcmdldExhbmdzOiB7fSxcbiAgYmF0Y2hDaGFyQnVkZ2V0OiAyMDAwLFxuICBtYXhDYWNoZUVudHJpZXM6IDIwMDAwLFxuICBhdXRvVHJhbnNsYXRlT25Mb2FkOiBmYWxzZSxcbiAgdGhlbWU6ICdzeXN0ZW0nLFxufTtcblxuY29uc3QgU1RPUkFHRV9LRVkgPSAnaGl0YXJfc2V0dGluZ3MnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2V0dGluZ3MoKTogUHJvbWlzZTxFeHRlbnNpb25TZXR0aW5ncz4ge1xuICB0cnkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoU1RPUkFHRV9LRVkpO1xuICAgIGlmIChyZXM/LltTVE9SQUdFX0tFWV0pIHtcbiAgICAgIHJldHVybiB7IC4uLkRFRkFVTFRfU0VUVElOR1MsIC4uLnJlc1tTVE9SQUdFX0tFWV0gfTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybignRmFpbGVkIHRvIHJlYWQgc2V0dGluZ3MgZnJvbSBzdG9yYWdlOicsIGVycik7XG4gIH1cbiAgcmV0dXJuIERFRkFVTFRfU0VUVElOR1M7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlU2V0dGluZ3MoXG4gIG5ld1NldHRpbmdzOiBQYXJ0aWFsPEV4dGVuc2lvblNldHRpbmdzPixcbik6IFByb21pc2U8RXh0ZW5zaW9uU2V0dGluZ3M+IHtcbiAgY29uc3QgY3VycmVudCA9IGF3YWl0IGdldFNldHRpbmdzKCk7XG4gIGNvbnN0IHVwZGF0ZWQ6IEV4dGVuc2lvblNldHRpbmdzID0geyAuLi5jdXJyZW50LCAuLi5uZXdTZXR0aW5ncyB9O1xuICB0cnkge1xuICAgIGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoeyBbU1RPUkFHRV9LRVldOiB1cGRhdGVkIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBzZXR0aW5nczonLCBlcnIpO1xuICB9XG4gIHJldHVybiB1cGRhdGVkO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2l0ZVJ1bGUoaG9zdG5hbWU6IHN0cmluZyk6IFByb21pc2U8J2Fsd2F5cycgfCAnbmV2ZXInIHwgJ2RlZmF1bHQnPiB7XG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0U2V0dGluZ3MoKTtcbiAgaWYgKHNldHRpbmdzLmFsd2F5c1RyYW5zbGF0ZURvbWFpbnMuaW5jbHVkZXMoaG9zdG5hbWUpKSByZXR1cm4gJ2Fsd2F5cyc7XG4gIGlmIChzZXR0aW5ncy5uZXZlclRyYW5zbGF0ZURvbWFpbnMuaW5jbHVkZXMoaG9zdG5hbWUpKSByZXR1cm4gJ25ldmVyJztcbiAgcmV0dXJuICdkZWZhdWx0Jztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFNpdGVSdWxlKFxuICBob3N0bmFtZTogc3RyaW5nLFxuICBydWxlOiAnYWx3YXlzJyB8ICduZXZlcicgfCAnZGVmYXVsdCcsXG4pOiBQcm9taXNlPEV4dGVuc2lvblNldHRpbmdzPiB7XG4gIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0U2V0dGluZ3MoKTtcbiAgbGV0IGFsd2F5cyA9IHNldHRpbmdzLmFsd2F5c1RyYW5zbGF0ZURvbWFpbnMuZmlsdGVyKChkKSA9PiBkICE9PSBob3N0bmFtZSk7XG4gIGxldCBuZXZlciA9IHNldHRpbmdzLm5ldmVyVHJhbnNsYXRlRG9tYWlucy5maWx0ZXIoKGQpID0+IGQgIT09IGhvc3RuYW1lKTtcblxuICBpZiAocnVsZSA9PT0gJ2Fsd2F5cycpIGFsd2F5cy5wdXNoKGhvc3RuYW1lKTtcbiAgaWYgKHJ1bGUgPT09ICduZXZlcicpIG5ldmVyLnB1c2goaG9zdG5hbWUpO1xuXG4gIHJldHVybiBzYXZlU2V0dGluZ3Moe1xuICAgIGFsd2F5c1RyYW5zbGF0ZURvbWFpbnM6IGFsd2F5cyxcbiAgICBuZXZlclRyYW5zbGF0ZURvbWFpbnM6IG5ldmVyLFxuICB9KTtcbn1cbiIsImltcG9ydCB7IGRlZmluZUJhY2tncm91bmQgfSBmcm9tICd3eHQvc2FuZGJveCc7XG5pbXBvcnQgYnJvd3NlciBmcm9tICd3ZWJleHRlbnNpb24tcG9seWZpbGwnO1xuaW1wb3J0IHsgZGVmYXVsdFRyYW5zbGF0b3JDbGllbnQgfSBmcm9tICdAL2xpYi90cmFuc2xhdG9yLWNsaWVudCc7XG5pbXBvcnQgeyB0cmFuc2xhdGlvbkNhY2hlIH0gZnJvbSAnQC9saWIvY2FjaGUnO1xuaW1wb3J0IHsgY3JlYXRlQmF0Y2hlcyB9IGZyb20gJ0AvbGliL2JhdGNoZXInO1xuaW1wb3J0IHsgZ2V0U2V0dGluZ3MsIHNhdmVTZXR0aW5ncyB9IGZyb20gJ0AvbGliL3N0b3JhZ2UnO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUsIE1lc3NhZ2VSZXNwb25zZSB9IGZyb20gJ0AvbGliL3R5cGVzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQmFja2dyb3VuZCgoKSA9PiB7XG4gIGNvbnNvbGUubG9nKCdbSGl0YXIgQmFja2dyb3VuZF0gU2VydmljZSB3b3JrZXIgaW5pdGlhbGl6ZWQuJyk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBjb250ZXh0IG1lbnUgJiBhdXRvLWluamVjdCBjb250ZW50IHNjcmlwdCBpbnRvIGV4aXN0aW5nIHRhYnMgb24gaW5zdGFsbC91cGRhdGVcbiAgYnJvd3Nlci5ydW50aW1lLm9uSW5zdGFsbGVkLmFkZExpc3RlbmVyKGFzeW5jICgpID0+IHtcbiAgICBzZXR1cENvbnRleHRNZW51KCk7XG4gICAgYXdhaXQgYXV0b0luamVjdEV4aXN0aW5nVGFicygpO1xuICB9KTtcblxuICBzZXR1cENvbnRleHRNZW51KCk7XG5cbiAgLy8gTGlzdGVuIGZvciBleHRlbnNpb24gc2hvcnRjdXQgY29tbWFuZHMgKEFsdCtTaGlmdCtUIC8gQ21kK1NoaWZ0K1QpXG4gIGJyb3dzZXIuY29tbWFuZHMub25Db21tYW5kLmFkZExpc3RlbmVyKGFzeW5jIChjb21tYW5kKSA9PiB7XG4gICAgaWYgKGNvbW1hbmQgPT09ICd0cmFuc2xhdGUtcGFnZScpIHtcbiAgICAgIGNvbnN0IHRhYnMgPSBhd2FpdCBicm93c2VyLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XG4gICAgICBpZiAodGFic1swXT8uaWQpIHtcbiAgICAgICAgYXdhaXQgc2VuZE1lc3NhZ2VUb1RhYk9ySW5qZWN0KHRhYnNbMF0uaWQsIHsgdHlwZTogJ1RPR0dMRV9UUkFOU0xBVElPTicgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAvLyBMaXN0ZW4gZm9yIGNvbnRleHQgbWVudSBjbGlja3NcbiAgYnJvd3Nlci5jb250ZXh0TWVudXMub25DbGlja2VkLmFkZExpc3RlbmVyKGFzeW5jIChpbmZvLCB0YWIpID0+IHtcbiAgICBpZiAoIXRhYj8uaWQpIHJldHVybjtcbiAgICBpZiAoaW5mby5tZW51SXRlbUlkID09PSAnaGl0YXJfdHJhbnNsYXRlX3BhZ2UnKSB7XG4gICAgICBhd2FpdCBzZW5kTWVzc2FnZVRvVGFiT3JJbmplY3QodGFiLmlkLCB7IHR5cGU6ICdUT0dHTEVfVFJBTlNMQVRJT04nIH0pO1xuICAgIH0gZWxzZSBpZiAoaW5mby5tZW51SXRlbUlkID09PSAnaGl0YXJfdHJhbnNsYXRlX3NlbGVjdGlvbicgJiYgaW5mby5zZWxlY3Rpb25UZXh0KSB7XG4gICAgICBhd2FpdCBzZW5kTWVzc2FnZVRvVGFiT3JJbmplY3QodGFiLmlkLCB7XG4gICAgICAgIHR5cGU6ICdUUkFOU0xBVEVfU0VMRUNUSU9OX1RSSUdHRVInLFxuICAgICAgICBzZWxlY3Rpb25UZXh0OiBpbmZvLnNlbGVjdGlvblRleHQsXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIENlbnRyYWwgUlBDIE1lc3NhZ2UgSGFuZGxlclxuICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKFxuICAgIChtZXNzYWdlOiB1bmtub3duLCBfc2VuZGVyOiBicm93c2VyLlJ1bnRpbWUuTWVzc2FnZVNlbmRlcik6IFByb21pc2U8TWVzc2FnZVJlc3BvbnNlPiA9PiB7XG4gICAgICByZXR1cm4gaGFuZGxlTWVzc2FnZShtZXNzYWdlIGFzIE1lc3NhZ2VUeXBlKTtcbiAgICB9LFxuICApO1xufSk7XG5cbi8qKlxuICogQXV0b21hdGljYWxseSBpbmplY3RzIGNvbnRlbnQgc2NyaXB0IGFuZCBzdHlsZXMgaW50byBhbGwgYWN0aXZlIHdlYiBwYWdlcyB1cG9uIGluc3RhbGwvdXBkYXRlXG4gKiBzbyB0aGUgZXh0ZW5zaW9uIHdvcmtzIGltbWVkaWF0ZWx5IHdpdGhvdXQgcmVxdWlyaW5nIHRoZSB1c2VyIHRvIHJlZnJlc2ggdGhlaXIgcGFnZXMhXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGF1dG9JbmplY3RFeGlzdGluZ1RhYnMoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdGFicyA9IGF3YWl0IGJyb3dzZXIudGFicy5xdWVyeSh7IHVybDogWydodHRwOi8vKi8qJywgJ2h0dHBzOi8vKi8qJ10gfSk7XG4gICAgZm9yIChjb25zdCB0YWIgb2YgdGFicykge1xuICAgICAgaWYgKHRhYi5pZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGJyb3dzZXIuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcbiAgICAgICAgICAgIGZpbGVzOiBbJ2NvbnRlbnQtc2NyaXB0cy9jb250ZW50LmpzJ10sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYXdhaXQgYnJvd3Nlci5zY3JpcHRpbmcuaW5zZXJ0Q1NTKHtcbiAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiLmlkIH0sXG4gICAgICAgICAgICBmaWxlczogWydjb250ZW50LXNjcmlwdHMvY29udGVudC5jc3MnXSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gSWdub3JlIHJlc3RyaWN0ZWQgdGFicyAoY2hyb21lOi8vLCBldGMuKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ1tIaXRhciBCYWNrZ3JvdW5kXSBUYWIgYXV0by1pbmplY3Rpb24gZXJyb3I6JywgZXJyKTtcbiAgfVxufVxuXG4vKipcbiAqIFNlbmRzIGEgbWVzc2FnZSB0byBhIHRhYiwgYXV0b21hdGljYWxseSBpbmplY3RpbmcgdGhlIGNvbnRlbnQgc2NyaXB0IGlmIG5vdCB5ZXQgcHJlc2VudC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VuZE1lc3NhZ2VUb1RhYk9ySW5qZWN0KHRhYklkOiBudW1iZXIsIG1lc3NhZ2U6IGFueSk6IFByb21pc2U8YW55PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGJyb3dzZXIudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgbWVzc2FnZSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIENvbnRlbnQgc2NyaXB0IG5vdCBsb2FkZWQgaW4gdGFiIHlldDsgaW5qZWN0IGR5bmFtaWNhbGx5IGFuZCByZXRyeVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBicm93c2VyLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgdGFyZ2V0OiB7IHRhYklkIH0sXG4gICAgICAgIGZpbGVzOiBbJ2NvbnRlbnQtc2NyaXB0cy9jb250ZW50LmpzJ10sXG4gICAgICB9KTtcbiAgICAgIGF3YWl0IGJyb3dzZXIuc2NyaXB0aW5nLmluc2VydENTUyh7XG4gICAgICAgIHRhcmdldDogeyB0YWJJZCB9LFxuICAgICAgICBmaWxlczogWydjb250ZW50LXNjcmlwdHMvY29udGVudC5jc3MnXSxcbiAgICAgIH0pO1xuICAgICAgLy8gU21hbGwgZGVsYXkgZm9yIHNjcmlwdCBpbml0aWFsaXphdGlvblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwKSk7XG4gICAgICByZXR1cm4gYXdhaXQgYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCBtZXNzYWdlKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tIaXRhciBCYWNrZ3JvdW5kXSBEeW5hbWljIGluamVjdGlvbiBmYWlsZWQgZm9yIHRhYjonLCB0YWJJZCwgZXJyKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0dXBDb250ZXh0TWVudSgpIHtcbiAgYnJvd3Nlci5jb250ZXh0TWVudXMucmVtb3ZlQWxsKCkudGhlbigoKSA9PiB7XG4gICAgYnJvd3Nlci5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgICAgIGlkOiAnaGl0YXJfdHJhbnNsYXRlX3BhZ2UnLFxuICAgICAgdGl0bGU6ICdUcmFuc2xhdGUgdGhpcyBwYWdlIHdpdGggSGl0YXInLFxuICAgICAgY29udGV4dHM6IFsncGFnZSddLFxuICAgIH0pO1xuXG4gICAgYnJvd3Nlci5jb250ZXh0TWVudXMuY3JlYXRlKHtcbiAgICAgIGlkOiAnaGl0YXJfdHJhbnNsYXRlX3NlbGVjdGlvbicsXG4gICAgICB0aXRsZTogJ1RyYW5zbGF0ZSBzZWxlY3Rpb24gKFwiJXNcIiknLFxuICAgICAgY29udGV4dHM6IFsnc2VsZWN0aW9uJ10sXG4gICAgfSk7XG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2VUeXBlKTogUHJvbWlzZTxNZXNzYWdlUmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UudHlwZSkge1xuICAgICAgY2FzZSAnVFJBTlNMQVRFX0JBVENIJzoge1xuICAgICAgICBjb25zdCB7IHRleHRzLCBzb3VyY2UsIHRhcmdldCB9ID0gbWVzc2FnZTtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBnZXRTZXR0aW5ncygpO1xuICAgICAgICBkZWZhdWx0VHJhbnNsYXRvckNsaWVudC51cGRhdGVFbmRwb2ludHMoc2V0dGluZ3MuZW5kcG9pbnRzKTtcblxuICAgICAgICAvLyAxLiBMb29rIHVwIGNhY2hlZCBpdGVtcyBmaXJzdFxuICAgICAgICBjb25zdCBjYWNoZUhpdHMgPSBhd2FpdCB0cmFuc2xhdGlvbkNhY2hlLmdldE1hbnkodGV4dHMsIHNvdXJjZSwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgZmluYWxSZXN1bHRzOiBzdHJpbmdbXSA9IG5ldyBBcnJheSh0ZXh0cy5sZW5ndGgpO1xuICAgICAgICBjb25zdCB1bmNhY2hlZFRleHRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBjb25zdCB1bmNhY2hlZEluZGljZXM6IG51bWJlcltdID0gW107XG5cbiAgICAgICAgdGV4dHMuZm9yRWFjaCgodGV4dCwgaSkgPT4ge1xuICAgICAgICAgIGlmIChjYWNoZUhpdHMuaGFzKHRleHQpKSB7XG4gICAgICAgICAgICBmaW5hbFJlc3VsdHNbaV0gPSBjYWNoZUhpdHMuZ2V0KHRleHQpITtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW5jYWNoZWRUZXh0cy5wdXNoKHRleHQpO1xuICAgICAgICAgICAgdW5jYWNoZWRJbmRpY2VzLnB1c2goaSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyAyLiBJZiB1bmNhY2hlZCBpdGVtcyBleGlzdCwgYmF0Y2ggYW5kIHRyYW5zbGF0ZSB0aGVtIHVzaW5nIGZyZWUgbXVsdGktZW5naW5lIGJhY2tlbmRzXG4gICAgICAgIGlmICh1bmNhY2hlZFRleHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBiYXRjaGVzID0gY3JlYXRlQmF0Y2hlcyh1bmNhY2hlZFRleHRzLCBzZXR0aW5ncy5iYXRjaENoYXJCdWRnZXQpO1xuICAgICAgICAgIGNvbnN0IG5ld0NhY2hlRW50cmllczogQXJyYXk8eyBzb3VyY2VUZXh0OiBzdHJpbmc7IHRyYW5zbGF0ZWRUZXh0OiBzdHJpbmcgfT4gPSBbXTtcblxuICAgICAgICAgIGZvciAoY29uc3QgYmF0Y2ggb2YgYmF0Y2hlcykge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlZEJhdGNoID0gYXdhaXQgZGVmYXVsdFRyYW5zbGF0b3JDbGllbnQudHJhbnNsYXRlQmF0Y2goXG4gICAgICAgICAgICAgIGJhdGNoLnRleHRzLFxuICAgICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGJhdGNoLnRleHRzLmZvckVhY2goKG9yaWdpbmFsLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlZCA9IHRyYW5zbGF0ZWRCYXRjaFtpZHhdIHx8IG9yaWdpbmFsO1xuICAgICAgICAgICAgICBjb25zdCB1bmNhY2hlZEluZGV4ID0gYmF0Y2guaW5kaWNlc1tpZHhdO1xuICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbEluZGV4ID0gdW5jYWNoZWRJbmRpY2VzW3VuY2FjaGVkSW5kZXhdO1xuICAgICAgICAgICAgICBmaW5hbFJlc3VsdHNbb3JpZ2luYWxJbmRleF0gPSB0cmFuc2xhdGVkO1xuICAgICAgICAgICAgICBuZXdDYWNoZUVudHJpZXMucHVzaCh7IHNvdXJjZVRleHQ6IG9yaWdpbmFsLCB0cmFuc2xhdGVkVGV4dDogdHJhbnNsYXRlZCB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIDMuIFNhdmUgbmV3IHRyYW5zbGF0aW9ucyB0byBJbmRleGVkREIgY2FjaGVcbiAgICAgICAgICBhd2FpdCB0cmFuc2xhdGlvbkNhY2hlLnNldE1hbnkobmV3Q2FjaGVFbnRyaWVzLCBzb3VyY2UsIHRhcmdldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBmaW5hbFJlc3VsdHMgfTtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnREVURUNUX0xBTkcnOiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gYXdhaXQgZ2V0U2V0dGluZ3MoKTtcbiAgICAgICAgZGVmYXVsdFRyYW5zbGF0b3JDbGllbnQudXBkYXRlRW5kcG9pbnRzKHNldHRpbmdzLmVuZHBvaW50cyk7XG4gICAgICAgIGNvbnN0IGRldGVjdGVkID0gYXdhaXQgZGVmYXVsdFRyYW5zbGF0b3JDbGllbnQuZGV0ZWN0TGFuZ3VhZ2UobWVzc2FnZS50ZXh0KTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogZGV0ZWN0ZWQgfTtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnR0VUX1NFVFRJTkdTJzoge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IGdldFNldHRpbmdzKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHNldHRpbmdzIH07XG4gICAgICB9XG5cbiAgICAgIGNhc2UgJ1NBVkVfU0VUVElOR1MnOiB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBhd2FpdCBzYXZlU2V0dGluZ3MobWVzc2FnZS5zZXR0aW5ncyk7XG4gICAgICAgIGRlZmF1bHRUcmFuc2xhdG9yQ2xpZW50LnVwZGF0ZUVuZHBvaW50cyh1cGRhdGVkLmVuZHBvaW50cyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHVwZGF0ZWQgfTtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnVEVTVF9FTkRQT0lOVCc6IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZGVmYXVsdFRyYW5zbGF0b3JDbGllbnQudGVzdEVuZHBvaW50KG1lc3NhZ2UuZW5kcG9pbnQpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQgfTtcbiAgICAgIH1cblxuICAgICAgY2FzZSAnQ0xFQVJfQ0FDSEUnOiB7XG4gICAgICAgIGF3YWl0IHRyYW5zbGF0aW9uQ2FjaGUuY2xlYXIoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogJ0NhY2hlIGNsZWFyZWQgc3VjY2Vzc2Z1bGx5JyB9O1xuICAgICAgfVxuXG4gICAgICBjYXNlICdHRVRfQ0FDSEVfU1RBVFMnOiB7XG4gICAgICAgIGNvbnN0IHN0YXRzID0gYXdhaXQgdHJhbnNsYXRpb25DYWNoZS5nZXRTdGF0cygpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBzdGF0cyB9O1xuICAgICAgfVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdVbmtub3duIG1lc3NhZ2UgdHlwZScgfTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgY29uc29sZS5lcnJvcignW0hpdGFyIEJhY2tncm91bmRdIEVycm9yIGhhbmRsaW5nIG1lc3NhZ2U6JywgZXJyKTtcbiAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVyci5tZXNzYWdlIHx8ICdJbnRlcm5hbCBlcnJvcicgfTtcbiAgfVxufVxuIiwiaW1wb3J0IG9yaWdpbmFsQnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IG9yaWdpbmFsQnJvd3NlcjtcbiJdLCJuYW1lcyI6WyJ0aGlzIiwibW9kdWxlIiwicHJveHlUYXJnZXQiLCJ2YWx1ZSIsInJlc3VsdCIsIm1lc3NhZ2UiLCJicm93c2VyIiwiX2EiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFPLFdBQVMsaUJBQWlCLEtB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ckMsaUJBQU8sRUFBRSxTQUFTLE1BQU0sTUFBTSxNQUFBO0FBQUEsUUFDaEM7QUFBQSxRQUVBO0FBQ0UsaUJBQU8sRUFBRSxTQUFTLE9BQU8sT0FBTyx1QkFBQTtBQUFBLE1BQXVCO0FBQUEsSUFFN0QsU0FBUyxLQUFVO0FBQ2pCLGNBQVEsTUFBTSw4Q0FBOEMsR0FBRztBQUMvRCxhQUFPLEVBQUUsU0FBUyxPQUFPLE9BQU8sSUFBSSxXQUFXLGlCQUFBO0FBQUEsSUFDakQ7QUFBQSxFQUNGOzs7O0FDbk5PLFFBQU0sVUFBVTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMCwxLDIsMTBdfQ==
