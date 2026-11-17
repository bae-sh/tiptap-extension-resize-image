import { afterEach, describe, expect, it } from 'vitest';
import { Editor, getSchema } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { ImageResize } from '../lib/image-resize';

function createEditor() {
  return new Editor({
    extensions: [Document, Paragraph, Text, ImageResize],
    element: document.createElement('div'),
    content: {
      type: 'doc',
      content: [
        {
          type: 'imageResize',
          attrs: {
            src: 'https://example.com/image.png',
            alt: 'example',
            width: 320,
            containerStyle: 'width: 320px; height: auto; cursor: pointer;',
            wrapperStyle: 'display: flex; margin: 0;',
          },
        },
      ],
    },
  });
}

describe('ImageResize NodeView lifecycle', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
    document.body.innerHTML = '';
  });

  it('reuses the same DOM nodes across attribute updates (no destroy/recreate)', () => {
    editor = createEditor();
    const dom = editor.view.dom as HTMLElement;
    document.body.appendChild(dom);

    const wrapperBefore = dom.querySelector('div > div') as HTMLElement;
    const imgBefore = dom.querySelector('img') as HTMLImageElement;
    expect(wrapperBefore).toBeTruthy();
    expect(imgBefore).toBeTruthy();

    const container = wrapperBefore.firstElementChild as HTMLElement;
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const controls = container.querySelector('[data-resize-image-ui="position-controller"]');
    (controls?.children[1] as HTMLElement).click();

    const wrapperAfter = dom.querySelector('div > div') as HTMLElement;
    const imgAfter = dom.querySelector('img') as HTMLImageElement;

    expect(wrapperAfter).toBe(wrapperBefore);
    expect(imgAfter).toBe(imgBefore);
  });

  it('keeps the resize UI mounted after a position change', () => {
    editor = createEditor();
    const dom = editor.view.dom as HTMLElement;
    document.body.appendChild(dom);

    const container = dom.querySelector('div > div > div') as HTMLElement;
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const handlesBefore = container.querySelectorAll('[data-resize-image-ui]').length;
    expect(handlesBefore).toBeGreaterThan(0);

    const controls = container.querySelector('[data-resize-image-ui="position-controller"]');
    (controls?.children[1] as HTMLElement).click();

    const handlesAfter = container.querySelectorAll('[data-resize-image-ui]').length;
    expect(handlesAfter).toBe(handlesBefore);
  });

  it('reflects new containerStyle on the existing container element after attr update', () => {
    editor = createEditor();
    const dom = editor.view.dom as HTMLElement;
    document.body.appendChild(dom);

    const container = dom.querySelector('div > div > div') as HTMLElement;
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const controls = container.querySelector('[data-resize-image-ui="position-controller"]');
    (controls?.children[1] as HTMLElement).click();

    expect(container.getAttribute('style')).toContain('margin: 0px auto');
  });
});

// Tiptap 2's Image node has no width/height attributes, so this only applies to Tiptap 3.
const hasSizeAttrs =
  'height' in
  (getSchema([Document, Paragraph, Text, ImageResize]).nodes.imageResize.spec.attrs ?? {});

describe.runIf(hasSizeAttrs)('ImageResize width and height attributes', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
  });

  it('stores the resized width as a number and scales height to keep the aspect ratio', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, ImageResize],
      element: document.createElement('div'),
      content: {
        type: 'doc',
        content: [
          {
            type: 'imageResize',
            attrs: { src: 'https://example.com/image.png', width: 1536, height: 2048 },
          },
        ],
      },
    });
    const dom = editor.view.dom as HTMLElement;
    document.body.appendChild(dom);

    const container = dom.querySelector('img')!.parentElement as HTMLElement;
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    Object.defineProperty(dom.querySelector('img')!, 'offsetWidth', {
      value: 400,
      configurable: true,
    });

    // Dispatch on the handle only, so ProseMirror's mousedown handler does not run in jsdom.
    const handle = container.querySelector('[data-resize-image-ui="resize-handle"]') as HTMLElement;
    handle.dispatchEvent(new MouseEvent('mousedown', { clientX: 100 }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50 }));
    document.dispatchEvent(new MouseEvent('mouseup'));

    const attrs = editor.getJSON().content![0].attrs!;
    expect(container.style.width).toBe('450px');
    expect(attrs.width).toBe(450);
    expect(attrs.height).toBe(600);
  });
});
