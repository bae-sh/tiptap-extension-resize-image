import Image from '@tiptap/extension-image';
import { StyleManager } from './utils/style-manager';
import { ImageNodeView } from './controllers/image-node-view';

export const ImageResize = Image.extend({
  name: 'imageResize',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
    };
  },

  addAttributes() {
    const inline = this.options.inline;
    return {
      ...this.parent?.(),
      containerStyle: {
        default: StyleManager.getContainerStyle(inline),
        parseHTML: (element) => {
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
      const inline = this.options.inline;
      const context = {
        node,
        editor,
        view: editor.view,
        getPos: typeof getPos === 'function' ? getPos : undefined,
      };

      const nodeView = new ImageNodeView(context, inline);
      return nodeView.initialize();
    };
  },
});
