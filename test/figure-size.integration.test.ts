import { afterEach, describe, expect, it } from 'vitest';
import { Editor, getSchema } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { ImageResize } from '../lib/image-resize';
import { Figure } from '../lib/figure';
import { Figcaption } from '../lib/figcaption';

const extensions = [Document, Paragraph, Text, ImageResize, Figure, Figcaption];
// Tiptap 2's Image node has no width/height attributes, so this only applies to Tiptap 3.
const hasSizeAttrs = 'height' in (getSchema(extensions).nodes.imageResize.spec.attrs ?? {});

let editor: Editor;

function firstNode() {
  const { type, attrs } = editor.getJSON().content![0];
  return { type, width: attrs!.width, height: attrs!.height };
}

describe.runIf(hasSizeAttrs)('Figure keeps the image width and height', () => {
  afterEach(() => {
    editor?.destroy();
  });

  it('keeps width and height through addCaption and removeCaption', () => {
    editor = new Editor({
      extensions,
      content: {
        type: 'doc',
        content: [
          {
            type: 'imageResize',
            attrs: {
              src: 'https://example.com/image.png',
              width: 200,
              height: 100,
              containerStyle: 'width: 200px;',
            },
          },
        ],
      },
    });

    editor.chain().setNodeSelection(0).addCaption('caption').run();
    expect(firstNode()).toEqual({ type: 'figure', width: 200, height: 100 });

    editor.chain().setNodeSelection(0).removeCaption().run();
    expect(firstNode()).toEqual({ type: 'imageResize', width: 200, height: 100 });
  });

  it('keeps width and height when a figure is saved and loaded as HTML', () => {
    editor = new Editor({
      extensions,
      content: {
        type: 'doc',
        content: [
          {
            type: 'figure',
            attrs: { src: 'https://example.com/image.png', width: 200, height: 100 },
            content: [{ type: 'figcaption', content: [{ type: 'text', text: 'caption' }] }],
          },
        ],
      },
    });

    editor.commands.setContent(editor.getHTML());

    expect(firstNode()).toEqual({ type: 'figure', width: 200, height: 100 });
  });
});
