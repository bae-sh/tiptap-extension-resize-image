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
        default: 'width: 100%; height: auto; cursor: pointer;',
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
      const $container = document.createElement('div');
      const $img = document.createElement('img');

      $container.appendChild($img);
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

      let isResizing = false;
      let startX: number, startWidth: number, startHeight: number;

      $container.addEventListener('click', () => {
        //remove remaining dots
        if ($container.childElementCount > 2) {
          for (let i = 0; i < 4; i++) {
            $container.removeChild($container.lastChild as Node);
          }
        }

        $container.setAttribute(
          'style',
          `position: relative; border: 1px dashed #6C6C6C; ${style} cursor: pointer;`,
        );

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
            startWidth = $container.offsetWidth;
            startHeight = $container.offsetHeight;

            const onMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;

              const deltaX = e.clientX - startX;

              const aspectRatio = startWidth / startHeight;
              const newWidth = startWidth + deltaX;
              const newHeight = newWidth / aspectRatio;

              $container.style.width = newWidth + 'px';
              $container.style.height = newHeight + 'px';

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
          $container.appendChild($dot);
        });
      });

      document.addEventListener('click', (e: MouseEvent) => {
        if (!$container.contains(e.target as Node)) {
          $container.removeAttribute('style');
          if ($container.childElementCount > 2) {
            for (let i = 0; i < 4; i++) {
              $container.removeChild($container.lastChild);
            }
          }
        }
      });

      return {
        dom: $container,
      };
    };
  },
});
