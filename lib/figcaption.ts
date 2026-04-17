import { mergeAttributes, Node, isNodeEmpty } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

interface FigcaptionOptions {
  placeholder: string;
}

export const Figcaption = Node.create<FigcaptionOptions>({
  name: 'figcaption',

  content: 'inline*',

  addOptions() {
    return {
      placeholder: 'Write a caption...',
    };
  },

  addAttributes() {
    return {
      placeholder: {
        default: this.options.placeholder,
        parseHTML: (element) => element.getAttribute('data-placeholder'),
        renderHTML: (attributes) => ({
          'data-placeholder': attributes.placeholder,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'figcaption' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figcaption', mergeAttributes(HTMLAttributes), 0];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('figcaption-placeholder'),
        props: {
          decorations: ({ doc }) => {
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.type.name !== 'figcaption') return;
              if (!isNodeEmpty(node)) return;

              // Add 'is-empty' class and 'data-placeholder' attribute to empty figcaption nodes.
              // This allows CSS ::before pseudo-element to display the placeholder text.
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: 'is-empty',
                  'data-placeholder': node.attrs.placeholder,
                })
              );
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
