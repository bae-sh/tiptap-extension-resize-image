import Image, { ImageOptions } from '@tiptap/extension-image';
import { StyleManager } from './utils/style-manager';
import { ImageNodeView } from './controllers/image-node-view';
import { ResizeLimits } from './types';

export interface ImageResizeOptions extends ImageOptions {
  inline: boolean;
  minWidth?: number;
  maxWidth?: number;
}

export const ImageResize = Image.extend<ImageResizeOptions>({
  name: 'imageResize',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      minWidth: undefined,
      maxWidth: undefined,
    };
  },

  addAttributes() {
    const inline = this.options.inline;
    return {
      ...this.parent?.(),
      containerStyle: {
        default: null,
        parseHTML: (element) => {
          const containerStyle = element.getAttribute('containerstyle');
          if (containerStyle) {
            return containerStyle;
          }

          const width = element.getAttribute('width');
          return width
            ? StyleManager.getContainerStyle(inline, `${width}px`)
            : `${element.style.cssText}`;
        },
      },
      wrapperStyle: {
        default: StyleManager.getWrapperStyle(inline),
      },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const { inline, minWidth, maxWidth } = this.options;
      const context = {
        node,
        editor,
        view: editor.view,
        getPos: typeof getPos === 'function' ? getPos : undefined,
      };

      const resizeLimits: ResizeLimits = { minWidth, maxWidth };
      const nodeView = new ImageNodeView(context, inline, resizeLimits);
      return nodeView.initialize();
    };
  },
});
