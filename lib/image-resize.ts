import { Image, ImageOptions } from '@tiptap/extension-image';
import { NodeConfig } from '@tiptap/core';
import { StyleManager } from './utils/style-manager';
import { sanitizeStyle } from './utils/style-sanitizer';
import { ImageNodeView } from './controllers/image-node-view';
import { AlignIcons, ResizeLimits } from './types';

export interface ImageResizeOptions extends ImageOptions {
  inline: boolean;
  minWidth?: number;
  maxWidth?: number;
  alignIcons?: AlignIcons;
  unstyledControls?: boolean;
}

export const imageResizeConfig: Partial<NodeConfig<ImageResizeOptions>> = {
  name: 'imageResize',

  addOptions() {
    return {
      ...(this.parent?.() as ImageOptions),
      inline: false,
      minWidth: undefined,
      maxWidth: undefined,
      alignIcons: undefined,
      unstyledControls: false,
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
            return sanitizeStyle(containerStyle);
          }

          const width = element.getAttribute('width');
          return width
            ? StyleManager.getContainerStyle(inline, `${width}px`)
            : sanitizeStyle(element.style.cssText);
        },
      },
      wrapperStyle: {
        default: StyleManager.getWrapperStyle(inline),
        parseHTML: (element) => {
          const wrapperStyle = element.getAttribute('wrapperstyle');
          return wrapperStyle ? sanitizeStyle(wrapperStyle) : StyleManager.getWrapperStyle(inline);
        },
      },
    };
  },

  parseHTML() {
    // Exclude img inside figure to prevent conflict with Figure node parsing
    return [{ tag: 'img[src]:not(figure img)' }];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const { inline, minWidth, maxWidth, alignIcons, unstyledControls } = this.options;
      const context = {
        node,
        editor,
        view: editor.view,
        getPos: typeof getPos === 'function' ? getPos : undefined,
      };

      const resizeLimits: ResizeLimits = { minWidth, maxWidth };
      const nodeView = new ImageNodeView(context, inline, resizeLimits, {
        icons: alignIcons,
        unstyled: unstyledControls,
      });
      return nodeView.initialize();
    };
  },
};

export const ImageResize = Image.extend<ImageResizeOptions>(imageResizeConfig);
