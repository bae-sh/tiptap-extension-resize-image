import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Figure } from '../../lib/figure';
import { Figcaption } from '../../lib/figcaption';
import { ImageResize } from '../../lib/image-resize';

const FORBIDDEN_TOKENS = [
  'position: fixed',
  'position:fixed',
  'z-index',
  'background',
  'top:',
  'left:',
  'pointer-events',
  'transform:',
  'expression(',
  'url(',
];

function expectNoMaliciousCss(value: string | null | undefined) {
  expect(value, 'expected sanitized style attribute to be defined').toBeDefined();
  for (const token of FORBIDDEN_TOKENS) {
    expect(value ?? '').not.toContain(token);
  }
}

function findFirstNodeOfType(editor: Editor, name: string) {
  let result: any = null;
  editor.state.doc.descendants((node) => {
    if (result) return false;
    if (node.type.name === name) {
      result = node;
      return false;
    }
    return true;
  });
  return result;
}

describe('style attribute injection', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
    document.body.innerHTML = '';
  });

  it('strips malicious containerStyle / wrapperStyle from HTML input', () => {
    const malicious = `
      <img
        src="https://example.com/image.png"
        containerstyle="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999999; background: url('https://attacker.example/?c=1');"
        wrapperstyle="position: fixed; top: 0; left: 0; pointer-events: none;"
      />
    `;

    editor = new Editor({
      extensions: [Document, Paragraph, Text, ImageResize],
      element: document.createElement('div'),
      content: malicious,
    });

    const node = findFirstNodeOfType(editor, 'imageResize');
    expectNoMaliciousCss(node?.attrs.containerStyle);
    expectNoMaliciousCss(node?.attrs.wrapperStyle);
  });

  it('strips malicious inline style from <img> when no explicit container style is provided', () => {
    const malicious = `
      <img
        src="https://example.com/image.png"
        style="position: fixed; top: 0; background: url('https://attacker.example')"
      />
    `;

    editor = new Editor({
      extensions: [Document, Paragraph, Text, ImageResize],
      element: document.createElement('div'),
      content: malicious,
    });

    const node = findFirstNodeOfType(editor, 'imageResize');
    expectNoMaliciousCss(node?.attrs.containerStyle);
  });

  it('does not render malicious styles in the DOM tree', () => {
    const malicious = `
      <img
        src="https://example.com/image.png"
        containerstyle="position: fixed; top: 0; background: red;"
      />
    `;

    editor = new Editor({
      extensions: [Document, Paragraph, Text, ImageResize],
      element: document.createElement('div'),
      content: malicious,
    });

    const dom = editor.view.dom as HTMLElement;
    document.body.appendChild(dom);

    dom.querySelectorAll('*').forEach((el) => {
      expectNoMaliciousCss(el.getAttribute('style'));
    });
  });

  it('strips malicious styles from figure containerStyle / wrapperStyle on parse', () => {
    const malicious = `
      <figure>
        <img
          src="https://example.com/image.png"
          containerstyle="position: fixed; top: 0; z-index: 99999;"
          wrapperstyle="background: url('https://attacker.example')"
        />
        <figcaption>caption</figcaption>
      </figure>
    `;

    editor = new Editor({
      extensions: [Document, Paragraph, Text, ImageResize, Figure, Figcaption],
      element: document.createElement('div'),
      content: malicious,
    });

    const figure = findFirstNodeOfType(editor, 'figure');
    expectNoMaliciousCss(figure?.attrs.containerStyle);
    expectNoMaliciousCss(figure?.attrs.wrapperStyle);
  });

  it('preserves legitimate sizing/alignment styles after sanitization', () => {
    const safeContent = {
      type: 'doc',
      content: [
        {
          type: 'imageResize',
          attrs: {
            src: 'https://example.com/image.png',
            containerStyle: 'width: 320px; height: auto; cursor: pointer; margin: 0 auto;',
            wrapperStyle: 'display: flex; margin: 0;',
          },
        },
      ],
    };

    editor = new Editor({
      extensions: [Document, Paragraph, Text, ImageResize],
      element: document.createElement('div'),
      content: safeContent,
    });

    const node = findFirstNodeOfType(editor, 'imageResize');
    expect(node?.attrs.containerStyle).toContain('width: 320px');
    expect(node?.attrs.containerStyle).toContain('margin: 0 auto');
    expect(node?.attrs.wrapperStyle).toContain('display: flex');
  });
});
