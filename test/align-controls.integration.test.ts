import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { ImageResize } from '../lib/image-resize';
import { Figure } from '../lib/figure';
import { Figcaption } from '../lib/figcaption';
import { CONSTANTS } from '../lib/constants';

let editor: Editor;

function openControls(extensions: Editor['options']['extensions'], content: object) {
  editor = new Editor({
    extensions: [Document, Paragraph, Text, ...extensions],
    element: document.createElement('div'),
    content: { type: 'doc', content: [content] },
  });
  const dom = editor.view.dom as HTMLElement;
  document.body.appendChild(dom);
  const img = dom.querySelector('img') as HTMLImageElement;
  img.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const controller = dom.querySelector(
    '[data-resize-image-ui="position-controller"]'
  ) as HTMLElement;
  const buttons = Array.from(
    controller.querySelectorAll<HTMLImageElement>('[data-resize-image-ui="position-button"]')
  );
  return { controller, buttons };
}

const image = { type: 'imageResize', attrs: { src: 'https://example.com/image.png' } };

describe('alignment controls customization', () => {
  afterEach(() => {
    editor?.destroy();
  });

  it('marks each button with its alignment and keeps the default look', () => {
    const { controller, buttons } = openControls([ImageResize], image);

    expect(buttons.map((b) => b.dataset.align)).toEqual(['left', 'center', 'right']);
    expect(buttons.map((b) => b.getAttribute('src'))).toEqual([
      CONSTANTS.ICONS.LEFT,
      CONSTANTS.ICONS.CENTER,
      CONSTANTS.ICONS.RIGHT,
    ]);
    expect(controller.getAttribute('style')).toContain('position: absolute');
    expect(buttons[0].getAttribute('style')).toContain('width: 24px');
  });

  it('uses the icons from alignIcons and falls back to the defaults for missing ones', () => {
    const { buttons } = openControls(
      [
        ImageResize.configure({
          alignIcons: { left: '/icons/left.svg', right: '/icons/right.svg' },
        }),
      ],
      image
    );

    expect(buttons.map((b) => b.getAttribute('src'))).toEqual([
      '/icons/left.svg',
      CONSTANTS.ICONS.CENTER,
      '/icons/right.svg',
    ]);
  });

  it('renders the controls without inline styles when unstyledControls is true', () => {
    const { controller, buttons } = openControls(
      [ImageResize.configure({ unstyledControls: true })],
      image
    );

    expect(controller.hasAttribute('style')).toBe(false);
    for (const button of buttons) {
      expect(button.hasAttribute('style')).toBe(false);
      button.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      expect(button.hasAttribute('style')).toBe(false);
    }
  });

  it('still aligns the image when unstyledControls is true', () => {
    const { buttons } = openControls([ImageResize.configure({ unstyledControls: true })], image);

    buttons.find((b) => b.dataset.align === 'right')!.click();

    expect(editor.getJSON().content![0].attrs!.containerStyle).toContain(
      'margin: 0px 0px 0px auto'
    );
  });

  it('applies the same options to Figure', () => {
    const { controller, buttons } = openControls(
      [
        ImageResize,
        Figure.configure({ alignIcons: { center: '/icons/center.svg' }, unstyledControls: true }),
        Figcaption,
      ],
      {
        type: 'figure',
        attrs: { src: 'https://example.com/image.png' },
        content: [{ type: 'figcaption', content: [{ type: 'text', text: 'caption' }] }],
      }
    );

    expect(controller.hasAttribute('style')).toBe(false);
    expect(buttons[1].getAttribute('src')).toBe('/icons/center.svg');
  });
});
