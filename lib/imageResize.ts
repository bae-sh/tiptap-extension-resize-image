import Image from '@tiptap/extension-image';

export const ImageResize = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      style: {
        default: 'width: 100%; height: 100%;',
      },
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const {
        view,
        options: { editable },
      } = editor;
      const { src, alt, style } = node.attrs;
      const $contatiner = document.createElement('div');
      const $img = document.createElement('img');

      $contatiner.appendChild($img);
      $img.setAttribute('src', src);
      $img.setAttribute('alt', alt);
      $img.setAttribute('style', style);
      $img.setAttribute('draggable', 'true');

      if (!editable) return { dom: $img };

      const dotsPosition = [
        'top: -4px; left: -4px; cursor: nwse-resize;',
        'top: -4px; right: -4px; cursor: nesw-resize;',
        'bottom: -4px; left: -4px; cursor: nesw-resize;',
        'bottom: -4px; right: -4px; cursor: nwse-resize;',
      ];
      $contatiner.setAttribute('style', `position: relative; border: 1px dashed #6C6C6C; ${style}`);

      let isResizing = false;
      let startX: number, startWidth: number, startHeight: number;

      Array.from({ length: 4 }, (_, index) => {
        const $dot = document.createElement('div');
        $dot.setAttribute(
          'style',
          `position: absolute; width: 9px; height: 9px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[index]}`,
        );

        $dot.addEventListener('mousedown', e => {
          e.preventDefault();
          isResizing = true;
          startX = e.clientX;
          startWidth = $contatiner.offsetWidth;
          startHeight = $contatiner.offsetHeight;

          const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startX;

            const aspectRatio = startWidth / startHeight;
            const newWidth = startWidth + deltaX;
            const newHeight = newWidth / aspectRatio;

            $contatiner.style.width = newWidth + 'px';
            $contatiner.style.height = newHeight + 'px';

            $img.style.width = newWidth + 'px';
            $img.style.height = newHeight + 'px';
          };

          const onMouseUp = () => {
            if (isResizing) {
              isResizing = false;
            }
            if (typeof getPos === 'function') {
              const newAttrs = {
                ...node.attrs,
                width: $img.width,
                height: $img.height,
                style: `${$img.style.cssText}`,
              };
              view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
            }

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
        $contatiner.appendChild($dot);
      });

      return {
        dom: $contatiner,
      };
    };
  },
});
