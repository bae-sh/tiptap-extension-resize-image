import Image from '@tiptap/extension-image';

export const ImageResize = Image.extend({
  name: "imageResize",
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
    }
  },
  addAttributes() {
    const inline = this.options.inline;
    return {
      ...this.parent?.(),
      style: {
        default: 'width: 100%; height: auto; cursor: pointer;',
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width
            ? `width: ${width}px; height: auto; cursor: pointer;`
            : `${element.style.cssText}`;
        },
      },
      wrapperStyle: {
        default: `display: ${inline ? "inline-block" : "flex"};`, // Default style for the wrapper
      },
      containerStyle: {
        default: `display: inline-block;`, // Default style for the container
      },
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const {
        view,
        options: { editable },
      } = editor;
      const { wrapperStyle, containerStyle } = node.attrs;
      const inline = this.options.inline;
      const display = inline ? 'inline-block' : 'block';
      const $wrapper = document.createElement('div');
      const $container = document.createElement('div');
      const $img = document.createElement('img');
      const iconStyle = 'width: 24px; height: 24px; cursor: pointer;';

      const clearContainerBorder = () => {
        const containerStyle = $container.getAttribute('style');
        const newStyle = containerStyle
          ?.replace('border: 1px dashed #6C6C6C;', '')
          .replace('border: 1px dashed rgb(108, 108, 108)', '');
        $container.setAttribute('style', newStyle as string);
      };

      const dispatchNodeView = () => {
        if (typeof getPos === 'function') {
          clearContainerBorder();
          const newAttrs = {
            ...node.attrs,
            style: `${$img.style.cssText}`,
            wrapperStyle: `${$wrapper.style.cssText}`, // Preserve wrapper style
            containerStyle: `${$container.style.cssText}`, // Preserve container style
          };
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
        }
      };
      const paintPositionContoller = () => {
        const $postionController = document.createElement('div');

        const $leftController = document.createElement('img');
        const $centerController = document.createElement('img');
        const $rightController = document.createElement('img');

        const controllerMouseOver = (e) => {
          e.target.style.opacity = 0.6;
        };

        const controllerMouseOut = (e) => {
          e.target.style.opacity = 1;
        };

        $postionController.setAttribute(
          'style',
          `position: absolute; top: 0%; left: 50%; 
            width: ${inline ? '66px' : '100px'}; height: 25px; 
            z-index: 999; 
            background-color: rgba(255, 255, 255, 1); 
            border-radius: 3px; 
            border: 1px solid #6C6C6C; 
            cursor: pointer; 
            transform: translate(-50%, -50%); 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 0 6px;`
        );

        $leftController.setAttribute(
          'src',
          'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_left/default/20px.svg'
        );
        $leftController.setAttribute('style', iconStyle);
        $leftController.addEventListener('mouseover', controllerMouseOver);
        $leftController.addEventListener('mouseout', controllerMouseOut);
        $leftController.addEventListener('click', () => {
          if (!inline) {
            $container.setAttribute('style', `display: inline-block; margin: 0 auto 0 0;`);
          } else {
            $wrapper.setAttribute(
              'style',
              `display: ${display}; float: left; padding-right: 8px;`
            );
          }
          dispatchNodeView();
        });
        $postionController.appendChild($leftController);

        if (!inline) {
          $centerController.setAttribute(
            'src',
            'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_center/default/20px.svg'
          );
          $centerController.setAttribute('style', iconStyle);
          $centerController.addEventListener('mouseover', controllerMouseOver);
          $centerController.addEventListener('mouseout', controllerMouseOut);
          $centerController.addEventListener('click', () => {
            $container.setAttribute('style', `display: inline-block; margin: 0 auto;`);
            dispatchNodeView();
          });
          $postionController.appendChild($centerController);
        }

        $rightController.setAttribute(
          'src',
          'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_right/default/20px.svg'
        );
        $rightController.setAttribute('style', iconStyle);
        $rightController.addEventListener('mouseover', controllerMouseOver);
        $rightController.addEventListener('mouseout', controllerMouseOut);
        $rightController.addEventListener('click', () => {
          if (!inline) {
            $container.setAttribute('style', `display: ${display}; margin: 0 0 0 auto;`);
          } else {
            $wrapper.setAttribute(
              'style',
              `display: ${display}; float: right; padding-left: 8px;`
            );
          }
          dispatchNodeView();
        });
        $postionController.appendChild($rightController);
        $container.appendChild($postionController);
      };

      $wrapper.setAttribute('style', wrapperStyle);
      $wrapper.appendChild($container);

      $container.setAttribute('style', `${containerStyle}`);
      $container.appendChild($img);

      Object.entries(node.attrs).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          key === 'wrapperStyle' ||
          key === 'containerStyle'
        )
          return;
        $img.setAttribute(key, value);
      });

      if (!editable) return { dom: $container };
      const isMobile = document.documentElement.clientWidth < 768;
      const dotPosition = isMobile ? '-8px' : '-4px';
      const dotsPosition = [
        `top: ${dotPosition}; left: ${dotPosition}; cursor: nwse-resize;`,
        `top: ${dotPosition}; right: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; left: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; right: ${dotPosition}; cursor: nwse-resize;`,
      ];

      let isResizing = false;
      let startX: number, startWidth: number;

      $container.addEventListener('click', (e) => {
        //remove remaining dots and position controller
        const isMobile = document.documentElement.clientWidth < 768;
        isMobile && (document.querySelector('.ProseMirror-focused') as HTMLElement)?.blur();

        if ($container.childElementCount > 3) {
          for (let i = 0; i < 5; i++) {
            $container.removeChild($container.lastChild as Node);
          }
        }

        paintPositionContoller();

        $container.setAttribute(
          'style',
          `position: relative; border: 1px dashed #6C6C6C; ${containerStyle} cursor: pointer;`
        );

        Array.from({ length: 4 }, (_, index) => {
          const $dot = document.createElement('div');
          $dot.setAttribute(
            'style',
            `position: absolute; width: ${isMobile ? 16 : 9}px; height: ${isMobile ? 16 : 9}px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[index]}`
          );

          $dot.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = $container.offsetWidth;

            const onMouseMove = (e: MouseEvent) => {
              if (!isResizing) return;
              const deltaX = index % 2 === 0 ? -(e.clientX - startX) : e.clientX - startX;

              const newWidth = startWidth + deltaX;

              $container.style.width = newWidth + 'px';

              $img.style.width = newWidth + 'px';
            };

            const onMouseUp = () => {
              if (isResizing) {
                isResizing = false;
              }
              dispatchNodeView();

              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          });

          $dot.addEventListener(
            'touchstart',
            (e) => {
              e.cancelable && e.preventDefault();
              isResizing = true;
              startX = e.touches[0].clientX;
              startWidth = $container.offsetWidth;

              const onTouchMove = (e: TouchEvent) => {
                if (!isResizing) return;
                const deltaX =
                  index % 2 === 0
                    ? -(e.touches[0].clientX - startX)
                    : e.touches[0].clientX - startX;

                const newWidth = startWidth + deltaX;

                $container.style.width = newWidth + 'px';

                $img.style.width = newWidth + 'px';
              };

              const onTouchEnd = () => {
                if (isResizing) {
                  isResizing = false;
                }
                dispatchNodeView();

                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
              };

              document.addEventListener('touchmove', onTouchMove);
              document.addEventListener('touchend', onTouchEnd);
            },
            { passive: false }
          );
          $container.appendChild($dot);
        });
      });

      document.addEventListener('click', (e: MouseEvent) => {
        const $target = e.target as HTMLElement;
        const isClickInside = $container.contains($target) || $target.style.cssText === iconStyle;

        if (!isClickInside) {
          clearContainerBorder();

          if ($container.childElementCount > 3) {
            for (let i = 0; i < 5; i++) {
              $container.removeChild($container.lastChild as Node);
            }
          }
        }
      });

      return {
        dom: $wrapper,
      };
    };
  },

});
