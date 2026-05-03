import { mergeAttributes } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState, NodeSelection } from '@tiptap/pm/state';
import { ImageResizeOptions, ImageResize } from './image-resize';
import { StyleManager } from './utils/style-manager';
import { sanitizeStyle } from './utils/style-sanitizer';
import { ResizeLimits } from './types';
import { FigureNodeView } from './controllers/figure-node-view';

/**
 * Locates the figure node enclosing the current selection in O(depth) by
 * walking up the resolved selection's parent chain. Also handles the case
 * where the figure itself is the active NodeSelection. Replaces the prior
 * full-document `nodesBetween` scan, which was O(N) and ran on every
 * removeCaption / toggleCaption call.
 */
function findEnclosingFigure(
  state: EditorState
): { node: ProseMirrorNode; pos: number } | null {
  const { selection } = state;

  if (selection instanceof NodeSelection && selection.node.type.name === 'figure') {
    return { node: selection.node, pos: selection.from };
  }

  const $pos = selection.$from;
  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);
    if (node.type.name === 'figure') {
      return { node, pos: $pos.before(depth) };
    }
  }

  return null;
}

// Figure with caption is a block-level element, so inline option is intentionally omitted
export interface FigureOptions extends Omit<ImageResizeOptions, 'inline'> {}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figure: {
      addCaption: (caption?: string) => ReturnType;
      removeCaption: () => ReturnType;
      toggleCaption: (caption?: string) => ReturnType;
    };
  }
}

export const Figure = ImageResize.extend<FigureOptions>({
  name: 'figure',
  group: 'block',
  content: 'figcaption',
  draggable: true,
  isolating: true,

  addOptions() {
    return {
      allowBase64: false,
      HTMLAttributes: {},
      minWidth: undefined,
      maxWidth: undefined,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.querySelector('img')?.getAttribute('src'),
      },
      alt: {
        default: null,
        parseHTML: (element) => element.querySelector('img')?.getAttribute('alt'),
      },
      title: {
        default: null,
        parseHTML: (element) => element.querySelector('img')?.getAttribute('title'),
      },
      containerStyle: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector('img');
          const containerStyle = img?.getAttribute('containerstyle');
          if (containerStyle) return sanitizeStyle(containerStyle);

          const width = img?.getAttribute('width');
          return width
            ? StyleManager.getContainerStyle(false, `${width}px`)
            : sanitizeStyle(img?.style.cssText);
        },
      },
      wrapperStyle: {
        default: StyleManager.getWrapperStyle(false),
        parseHTML: (element) => {
          const wrapperStyle = element.getAttribute('wrapperstyle');
          return wrapperStyle ? sanitizeStyle(wrapperStyle) : StyleManager.getWrapperStyle(false);
        },
      },
    };
  },

  parseHTML() {
    // Only recognize figure elements that contain both img and figcaption
    // to prevent conflict with ImageResize node parsing
    return [{ tag: 'figure:has(img):has(figcaption)' }];
  },

  renderHTML({ HTMLAttributes }) {
    // Wrap hole(0) in a div because hole must be the only child of its parent node
    return [
      'figure',
      {},
      ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
      ['div', { 'data-figcaption': 'true' }, 0],
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const { minWidth, maxWidth } = this.options;
      const resizeLimits: ResizeLimits = { minWidth, maxWidth };
      const context = {
        node,
        editor,
        view: editor.view,
        getPos: typeof getPos === 'function' ? getPos : undefined,
      };

      const nodeView = new FigureNodeView(context, false, resizeLimits);
      return nodeView.initializeFigure();
    };
  },

  addCommands() {
    return {
      /**
       * Converts an imageResize node to a figure node with a figcaption.
       * Moves the cursor inside the figcaption after insertion.
       */
      addCaption:
        (caption: string = '') =>
        ({ chain, state }) => {
          const { selection, schema } = state;
          const { from } = selection;
          const node = state.doc.nodeAt(from);

          if (!node || node.type.name !== 'imageResize') return false;
          // Figure is a block-level node and cannot wrap an inline image without
          // breaking its parent (e.g. paragraph). Reject the caption insertion
          // when the source image is inline.
          if (node.isInline) return false;

          const figcaptionNode = schema.nodes.figcaption.create(
            {},
            caption ? schema.text(caption) : null
          );

          const figureNode = schema.nodes.figure.create(node.attrs, [figcaptionNode]);

          return chain()
            .insertContentAt({ from, to: from + node.nodeSize }, figureNode.toJSON(), {
              updateSelection: false,
            })
            .command(({ commands }) => {
              // from + 1: figcaption start, from + 2: inside figcaption (cursor position)
              return commands.setTextSelection(from + 2);
            })
            .focus()
            .run();
        },

      /**
       * Converts a figure node back to an imageResize node.
       * Preserves the original attrs (src, width, containerStyle, etc.)
       */
      removeCaption:
        () =>
        ({ state, dispatch }) => {
          const found = findEnclosingFigure(state);
          if (!found) return false;

          if (dispatch) {
            const imageNode = state.schema.nodes.imageResize.create(found.node.attrs);
            dispatch(state.tr.replaceWith(found.pos, found.pos + found.node.nodeSize, imageNode));
          }

          return true;
        },

      /**
       * Toggles between imageResize and figure node.
       * Adds caption if current node is imageResize, removes if figure.
       */
      toggleCaption:
        (caption: string = '') =>
        ({ state, commands }) => {
          const { from } = state.selection;
          const node = state.doc.nodeAt(from);

          if (node?.type.name === 'imageResize') {
            return commands.addCaption(caption);
          }

          return findEnclosingFigure(state) ? commands.removeCaption() : false;
        },
    };
  },
});
