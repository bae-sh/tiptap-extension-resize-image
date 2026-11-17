import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { ImageResize } from '../lib/image-resize';
import { Figure } from '../lib/figure';
import { Figcaption } from '../lib/figcaption';

let editor: Editor;

const image = {
  type: 'imageResize',
  attrs: { src: 'https://example.com/image.png', containerStyle: 'width: 200px;' },
};
const figure = {
  type: 'figure',
  attrs: { src: 'https://example.com/image.png', containerStyle: 'width: 200px;' },
  content: [{ type: 'figcaption', content: [{ type: 'text', text: 'caption' }] }],
};

function createEditor(content: object, editable: boolean) {
  editor = new Editor({
    extensions: [Document, Paragraph, Text, ImageResize, Figure, Figcaption],
    element: document.createElement('div'),
    editable,
    content: { type: 'doc', content: [content] },
  });
  document.body.appendChild(editor.view.dom);
}

function container() {
  return editor.view.dom.querySelector('img')!.parentElement as HTMLElement;
}

function clickImage() {
  container().dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function resizeUi() {
  return container().querySelectorAll(':scope > [data-resize-image-ui]');
}

function containerStyle() {
  return editor.getJSON().content![0].attrs!.containerStyle;
}

describe('editable changes after the editor is created', () => {
  afterEach(() => {
    editor?.destroy();
  });

  it.each([
    ['imageResize', image],
    ['figure', figure],
  ])('%s: shows no resize UI after setEditable(false)', (_, content) => {
    createEditor(content, true);
    editor.setEditable(false);

    clickImage();

    expect(resizeUi()).toHaveLength(0);
  });

  it.each([
    ['imageResize', image],
    ['figure', figure],
  ])('%s: hides open resize UI and ignores its controls after setEditable(false)', (_, content) => {
    createEditor(content, true);
    clickImage();
    const right = container().querySelector(
      '[data-resize-image-ui="position-button"][data-align="right"]'
    ) as HTMLElement;

    editor.setEditable(false);
    right.click();

    expect(resizeUi()).toHaveLength(0);
    expect(containerStyle()).toBe('width: 200px;');
  });

  it.each([
    ['imageResize', image],
    ['figure', figure],
  ])('%s: shows resize UI after setEditable(true)', (_, content) => {
    createEditor(content, false);
    editor.setEditable(true);

    clickImage();

    expect(resizeUi()).toHaveLength(5);
  });
});
