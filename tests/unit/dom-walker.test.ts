import { describe, it, expect, beforeEach } from 'vitest';
import {
  collectTextNodes,
  isTranslatableText,
  applyNodeTranslations,
  revertTranslations,
} from '../../src/lib/dom-walker';

describe('DOM Walker Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('validates translatable text correctly', () => {
    expect(isTranslatableText('Hello world')).toBe(true);
    expect(isTranslatableText('12345')).toBe(false);
    expect(isTranslatableText('   ')).toBe(false);
    expect(isTranslatableText('Bonjour tout le monde')).toBe(true);
  });

  it('ignores elements with translate="no" or class="notranslate" or script tags', () => {
    document.body.innerHTML = `
      <div>
        <p id="p1">Translatable text</p>
        <script>var x = "do not translate";</script>
        <code id="c1">const code = true;</code>
        <div translate="no" id="d1">Ignored div</div>
        <span class="notranslate" id="s1">Ignored span</span>
      </div>
    `;

    const nodes = collectTextNodes(document.body);
    const texts = nodes.map((n) => n.originalText.trim());

    expect(texts).toContain('Translatable text');
    expect(texts).not.toContain('var x = "do not translate";');
    expect(texts).not.toContain('const code = true;');
    expect(texts).not.toContain('Ignored div');
    expect(texts).not.toContain('Ignored span');
  });

  it('applies and reverts translations accurately', () => {
    document.body.innerHTML = `<p id="target">Hello World</p>`;
    const p = document.getElementById('target')!;
    const nodeInfos = collectTextNodes(p);

    expect(nodeInfos.length).toBe(1);

    applyNodeTranslations(nodeInfos, ['Hola Mundo']);
    expect(p.textContent).toBe('Hola Mundo');
    expect(p.getAttribute('data-hitar-translated')).toBe('true');

    revertTranslations(document.body);
    expect(p.textContent).toBe('Hello World');
    expect(p.hasAttribute('data-hitar-translated')).toBe(false);
  });
});
