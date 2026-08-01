export const IGNORED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'CODE',
  'PRE',
  'INPUT',
  'TEXTAREA',
  'OPTION',
  'SELECT',
  'SVG',
  'CANVAS',
  'AUDIO',
  'VIDEO',
  'IFRAME',
]);

export interface TranslatableNodeInfo {
  node: Text;
  originalText: string;
}

// In-memory weak map to preserve exact original text references across DOM operations
export const originalTextMap = new WeakMap<Text, string>();

/**
 * Checks whether an Element or its ancestors are marked as non-translatable.
 */
export function isElementIgnored(element: Element | null): boolean {
  let curr: Element | null = element;
  while (curr) {
    const tagName = (curr.tagName || '').toUpperCase();
    if (IGNORED_TAGS.has(tagName)) return true;
    if (curr.getAttribute && curr.getAttribute('translate') === 'no') return true;
    if (curr.classList && curr.classList.contains('notranslate')) return true;
    if (curr.hasAttribute && curr.hasAttribute('data-hitar-ignore')) return true;
    if (curr.isContentEditable) return true;
    curr = curr.parentElement;
  }
  return false;
}

/**
 * Validates if a text string contains meaningful translatable text (not pure numbers/symbols/spaces).
 */
export function isTranslatableText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return false;
  // Must contain at least one unicode letter character
  return /\p{L}/u.test(trimmed);
}

/**
 * Collects all translatable Text nodes inside a container using recursive DOM traversal.
 * Guarantees consistent behavior across all browsers and test environments (happy-dom/jsdom).
 */
export function collectTextNodes(container: Node = document.body): TranslatableNodeInfo[] {
  const result: TranslatableNodeInfo[] = [];

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const text = textNode.nodeValue || '';

      if (!isTranslatableText(text)) return;

      const parent = textNode.parentElement;
      if (!parent || isElementIgnored(parent)) return;

      if (
        parent.hasAttribute('data-hitar-translated') ||
        parent.classList.contains('hitar-translating')
      ) {
        return;
      }

      result.push({
        node: textNode,
        originalText: text,
      });
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (isElementIgnored(element)) return;

      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i]);
      }
    }
  }

  traverse(container);
  return result;
}

/**
 * Marks nodes as translating (loading state) and caches their original text.
 */
export function markNodesAsTranslating(nodeInfos: TranslatableNodeInfo[]) {
  nodeInfos.forEach(({ node, originalText }) => {
    if (!originalTextMap.has(node)) {
      originalTextMap.set(node, originalText);
    }
    const parent = node.parentElement;
    if (parent) {
      parent.classList.add('hitar-translating');
    }
  });
}

/**
 * Applies translations to text nodes and removes loading indicators.
 */
export function applyNodeTranslations(
  nodeInfos: TranslatableNodeInfo[],
  translations: (string | null)[],
) {
  nodeInfos.forEach(({ node, originalText }, index) => {
    if (!originalTextMap.has(node)) {
      originalTextMap.set(node, originalText);
    }
    const parent = node.parentElement;
    if (parent) {
      parent.classList.remove('hitar-translating');
    }

    const translatedText = translations[index];
    if (translatedText && translatedText !== originalText) {
      node.nodeValue = translatedText;
      if (parent) {
        parent.setAttribute('data-hitar-translated', 'true');
      }
    }
  });
}

/**
 * Reverts all translated text nodes in the container to their cached original text.
 */
export function revertTranslations(container: Node = document.body) {
  const elements = (container as Element).querySelectorAll('[data-hitar-translated]');
  elements.forEach((el) => {
    function traverse(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        if (originalTextMap.has(textNode)) {
          textNode.nodeValue = originalTextMap.get(textNode)!;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
        }
      }
    }
    traverse(el);
    el.removeAttribute('data-hitar-translated');
  });
}
