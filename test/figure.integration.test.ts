import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Figure } from '../lib/figure';
import { Figcaption } from '../lib/figcaption';
import { ImageResize } from '../lib/image-resize';
import { NodeSelection } from '@tiptap/pm/state';

function createEditor(type: 'figure' | 'imageResize' = 'figure', placeholder?: string) {
  return new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      ImageResize,
      Figure,
      placeholder ? Figcaption.configure({ placeholder }) : Figcaption,
    ],
    element: document.createElement('div'),
    content: {
      type: 'doc',
      content: [
        {
          type,
          attrs: {
            src: 'https://example.com/image.png',
            alt: 'example',
            width: 320,
            containerStyle: 'width: 320px; height: auto; cursor: pointer;',
            wrapperStyle: 'display: flex; margin: 0;',
          },
          ...(type === 'figure' ? { content: [{ type: 'figcaption' }] } : {}),
        },
      ],
    },
  });
}

function createInlineImageEditor() {
  return new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      ImageResize.configure({ inline: true }),
      Figure,
      Figcaption,
    ],
    element: document.createElement('div'),
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'before ' },
            {
              type: 'imageResize',
              attrs: {
                src: 'https://example.com/image.png',
                alt: 'inline',
                width: 200,
              },
            },
            { type: 'text', text: ' after' },
          ],
        },
      ],
    },
  });
}

function findImagePos(ed: Editor): number {
  let pos = -1;
  ed.state.doc.descendants((node, p) => {
    if (node.type.name === 'imageResize' && pos === -1) pos = p;
  });
  return pos;
}

describe('Figure', () => {
  let editor: Editor;

  afterEach(() => {
    editor?.destroy();
    document.body.innerHTML = '';
  });

  it('selects the figure node when the image is clicked', () => {
    editor = createEditor();

    const dom = editor.view.dom as HTMLElement;
    document.body.appendChild(dom);
    const img = dom.querySelector('img') as HTMLImageElement;

    img.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(editor.state.selection).toBeInstanceOf(NodeSelection);
    expect((editor.state.selection as NodeSelection).node.type.name).toBe('figure');
  });

  it('preserves selection after repositioning', () => {
    editor = createEditor();

    const dom = editor.view.dom as HTMLElement;
    document.body.appendChild(dom);

    const img = dom.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(editor.state.selection).toBeInstanceOf(NodeSelection);
    const selectionBefore = editor.state.selection as NodeSelection;

    const container = dom.querySelector('figure > div') as HTMLElement;
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const controls = container.querySelector('[data-resize-image-ui="position-controller"]');
    (controls?.children[1] as HTMLElement).click();

    expect(editor.state.selection).toBeInstanceOf(NodeSelection);
    expect((editor.state.selection as NodeSelection).from).toBe(selectionBefore.from);
  });

  describe('Commands', () => {
    describe('addCaption', () => {
      it('converts imageResize node to figure node with figcaption', () => {
        editor = createEditor('imageResize');

        editor.chain().focus().addCaption().run();

        const doc = editor.state.doc;
        const figureNode = doc.content.firstChild;

        expect(figureNode?.type.name).toBe('figure');
        expect(figureNode?.firstChild?.type.name).toBe('figcaption');
      });

      it('moves cursor inside figcaption after adding caption', () => {
        editor = createEditor('imageResize');

        editor.chain().focus().addCaption().run();

        const { selection, doc } = editor.state;

        expect(doc.resolve(selection.from).parent.type.name).toBe('figcaption');
      });

      describe('inline ImageResize', () => {
        it('returns false when the source image is inline', () => {
          editor = createInlineImageEditor();
          editor.commands.setNodeSelection(findImagePos(editor));

          const result = editor.chain().focus().addCaption().run();

          expect(result).toBe(false);
        });

        it('does not modify the document when the source image is inline', () => {
          editor = createInlineImageEditor();
          editor.commands.setNodeSelection(findImagePos(editor));

          const docBefore = editor.state.doc.toJSON();
          editor.chain().focus().addCaption('caption').run();
          const docAfter = editor.state.doc.toJSON();

          expect(docAfter).toEqual(docBefore);
        });

        it('reports addCaption as not executable via editor.can()', () => {
          editor = createInlineImageEditor();
          editor.commands.setNodeSelection(findImagePos(editor));

          expect(editor.can().addCaption()).toBe(false);
        });
      });
    });

    describe('removeCaption', () => {
      it('converts figure node back to imageResize node', () => {
        editor = createEditor();

        editor.chain().focus().removeCaption().run();

        const doc = editor.state.doc;
        const node = doc.content.firstChild;

        expect(node?.type.name).toBe('imageResize');
      });

      it('preserves attrs when converting figure to imageResize', () => {
        editor = createEditor();

        editor.chain().focus().removeCaption().run();

        const doc = editor.state.doc;
        const node = doc.content.firstChild;

        expect(node?.attrs.src).toBe('https://example.com/image.png');
        expect(node?.attrs.alt).toBe('example');
        expect(node?.attrs.containerStyle).toBe('width: 320px; height: auto; cursor: pointer;');
        expect(node?.attrs.wrapperStyle).toBe('display: flex; margin: 0;');
      });

      it('works when the figure itself is the active NodeSelection', () => {
        editor = createEditor();

        let figurePos = -1;
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'figure' && figurePos === -1) figurePos = pos;
        });
        editor.commands.setNodeSelection(figurePos);

        editor.chain().focus().removeCaption().run();

        expect(editor.state.doc.firstChild?.type.name).toBe('imageResize');
      });
    });

    describe('toggleCaption', () => {
      it('toggles between imageResize and figure node', () => {
        editor = createEditor('imageResize');

        editor.chain().focus().toggleCaption().run();
        expect(editor.state.doc.firstChild?.type.name).toBe('figure');

        editor.chain().focus().toggleCaption().run();
        expect(editor.state.doc.firstChild?.type.name).toBe('imageResize');
      });

      describe('inline ImageResize', () => {
        it('returns false when the source image is inline', () => {
          editor = createInlineImageEditor();
          editor.commands.setNodeSelection(findImagePos(editor));

          const result = editor.chain().focus().toggleCaption().run();

          expect(result).toBe(false);
        });

        it('does not modify the document when toggling on an inline image', () => {
          editor = createInlineImageEditor();
          editor.commands.setNodeSelection(findImagePos(editor));

          const docBefore = editor.state.doc.toJSON();
          editor.chain().focus().toggleCaption().run();
          const docAfter = editor.state.doc.toJSON();

          expect(docAfter).toEqual(docBefore);
        });
      });
    });
  });

  describe('Figcaption', () => {
    it('adds is-empty class when figcaption is empty', () => {
      editor = createEditor('figure');

      const dom = editor.view.dom as HTMLElement;
      const figcaption = dom.querySelector('figcaption') as HTMLElement;

      expect(figcaption.classList.contains('is-empty')).toBe(true);
    });

    it('removes is-empty class when figcaption has text', () => {
      editor = createEditor();

      editor.chain().focus().setTextSelection(2).insertContent('caption text').run();

      const dom = editor.view.dom as HTMLElement;
      const figcaption = dom.querySelector('figcaption') as HTMLElement;

      expect(figcaption.classList.contains('is-empty')).toBe(false);
    });

    it('reflects placeholder option in data-placeholder attribute', () => {
      editor = createEditor('figure', 'Custom placeholder');

      const dom = editor.view.dom as HTMLElement;
      const figcaption = dom.querySelector('figcaption') as HTMLElement;

      expect(figcaption.getAttribute('data-placeholder')).toBe('Custom placeholder');
    });
  });
});
