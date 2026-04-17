import { ImageResizeOptions, ImageResize } from './image-resize';
import { StyleManager } from './utils/style-manager';
import { mergeAttributes } from '@tiptap/core';
import { ResizeLimits } from './types';
import { FigureNodeView } from './controllers/figure-node-view';

// Figure with caption is a block-level element, so inline option is intentionally omitted
export interface FigureOptions extends Omit<ImageResizeOptions, 'inline'> {}

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
          if (containerStyle) return containerStyle;

          const width = img?.getAttribute('width');
          return width
            ? StyleManager.getContainerStyle(false, `${width}px`)
            : `${img?.style.cssText}`;
        },
      },
      wrapperStyle: {
        default: StyleManager.getWrapperStyle(false),
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
});
