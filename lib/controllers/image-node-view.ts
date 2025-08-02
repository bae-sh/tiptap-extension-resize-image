import { CONSTANTS } from '../constants';
import { utils } from '../utils';
import { AttributeParser } from '../utils/attribute-parser';
import { ImageElements } from '../types';
import { PositionController } from './position-controller';
import { ResizeController } from './resize-controller';

interface NodeViewContext {
  node: any;
  editor: any;
  view: any;
  getPos: (() => number) | undefined;
}

export class ImageNodeView {
  private context: NodeViewContext;
  private elements: ImageElements;
  private inline: boolean;

  constructor(context: NodeViewContext, inline: boolean) {
    this.context = context;
    this.inline = inline;
    this.elements = this.createElements();
  }

  private createElements(): ImageElements {
    return {
      wrapper: document.createElement('div'),
      container: document.createElement('div'),
      img: document.createElement('img'),
    };
  }

  private clearContainerBorder = (): void => {
    utils.clearContainerBorder(this.elements.container);
  };

  private dispatchNodeView = (): void => {
    const { view, getPos } = this.context;
    if (typeof getPos === 'function') {
      this.clearContainerBorder();
      const newAttrs = {
        ...this.context.node.attrs,
        containerStyle: `${this.elements.container.style.cssText}`,
        wrapperStyle: `${this.elements.wrapper.style.cssText}`,
      };
      view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
    }
  };

  private removeResizeElements = (): void => {
    utils.removeResizeElements(this.elements.container);
  };

  private setupImageAttributes(): void {
    AttributeParser.parseImageAttributes(this.context.node.attrs, this.elements.img);
  }

  private setupDOMStructure(): void {
    const { wrapperStyle, containerStyle } = this.context.node.attrs;

    this.elements.wrapper.setAttribute('style', wrapperStyle);
    this.elements.wrapper.appendChild(this.elements.container);

    this.elements.container.setAttribute('style', containerStyle);
    this.elements.container.appendChild(this.elements.img);
  }

  private createPositionController(): void {
    const positionController = new PositionController(
      this.elements,
      this.inline,
      this.dispatchNodeView
    );
    positionController.createPositionControls();
  }

  private createResizeHandler(): void {
    const resizeHandler = new ResizeController(this.elements, this.dispatchNodeView);

    Array.from({ length: 4 }, (_, index) => {
      const dot = resizeHandler.createResizeHandle(index);
      this.elements.container.appendChild(dot);
    });
  }

  private setupContainerClick(): void {
    this.elements.container.addEventListener('click', () => {
      const isMobile = utils.isMobile();
      isMobile && (document.querySelector('.ProseMirror-focused') as HTMLElement)?.blur();

      this.removeResizeElements();
      this.createPositionController();

      this.elements.container.setAttribute(
        'style',
        `position: relative; border: 1px dashed ${CONSTANTS.COLORS.BORDER}; ${this.context.node.attrs.containerStyle}`
      );

      this.createResizeHandler();
    });
  }

  private setupContentClick(): void {
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickInside =
        this.elements.container.contains(target) ||
        target.style.cssText ===
          `width: ${CONSTANTS.ICON_SIZE}; height: ${CONSTANTS.ICON_SIZE}; cursor: pointer;`;

      if (!isClickInside) {
        this.clearContainerBorder();
        this.removeResizeElements();
      }
    });
  }

  initialize(): { dom: HTMLElement } {
    this.setupDOMStructure();
    this.setupImageAttributes();

    const { editable } = this.context.editor.options;
    if (!editable) return { dom: this.elements.container };

    this.setupContainerClick();
    this.setupContentClick();

    return {
      dom: this.elements.wrapper,
    };
  }
}
