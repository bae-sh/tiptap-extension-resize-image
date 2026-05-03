import { CONSTANTS } from '../constants';
import { ImageElements } from '../types';
import { StyleManager } from '../utils/style-manager';

export class PositionController {
  private elements: ImageElements;
  private inline: boolean;
  private dispatchNodeView: () => void;

  constructor(elements: ImageElements, inline: boolean, dispatchNodeView: () => void) {
    this.elements = elements;
    this.inline = inline;
    this.dispatchNodeView = dispatchNodeView;
  }

  private createControllerIcon(src: string): HTMLElement {
    const controller = document.createElement('img');
    controller.setAttribute('src', src);
    controller.setAttribute(
      'style',
      `width: ${CONSTANTS.ICON_SIZE}; height: ${CONSTANTS.ICON_SIZE}; cursor: pointer;`
    );

    controller.addEventListener('mouseover', (e) => {
      (e.target as HTMLElement).style.opacity = '0.6';
    });

    controller.addEventListener('mouseout', (e) => {
      (e.target as HTMLElement).style.opacity = '1';
    });

    return controller;
  }

  // Setting individual style properties via the CSSStyleDeclaration API lets
  // the browser validate each value, and avoids the unbounded cssText growth
  // (and CSS injection surface) that arose from concatenating style strings.
  private handleLeftClick(): void {
    if (!this.inline) {
      this.elements.container.style.margin = '0 auto 0 0';
    } else {
      this.applyInlineFloat('left');
    }
    this.dispatchNodeView();
  }

  private handleCenterClick(): void {
    this.elements.container.style.margin = '0 auto';
    this.dispatchNodeView();
  }

  private handleRightClick(): void {
    if (!this.inline) {
      this.elements.container.style.margin = '0 0 0 auto';
    } else {
      this.applyInlineFloat('right');
    }
    this.dispatchNodeView();
  }

  private applyInlineFloat(side: 'left' | 'right'): void {
    for (const el of [this.elements.wrapper, this.elements.container]) {
      el.style.display = 'inline-block';
      el.style.float = side;
      el.style.paddingLeft = side === 'right' ? '8px' : '';
      el.style.paddingRight = side === 'left' ? '8px' : '';
    }
  }

  createPositionControls(): PositionController {
    const controller = document.createElement('div');
    controller.dataset.resizeImageUi = 'position-controller';
    controller.setAttribute('style', StyleManager.getPositionControllerStyle(this.inline));

    const leftController = this.createControllerIcon(CONSTANTS.ICONS.LEFT);
    leftController.addEventListener('click', () => this.handleLeftClick());
    controller.appendChild(leftController);

    if (!this.inline) {
      const centerController = this.createControllerIcon(CONSTANTS.ICONS.CENTER);
      centerController.addEventListener('click', () => this.handleCenterClick());
      controller.appendChild(centerController);
    }

    const rightController = this.createControllerIcon(CONSTANTS.ICONS.RIGHT);
    rightController.addEventListener('click', () => this.handleRightClick());
    controller.appendChild(rightController);

    this.elements.container.appendChild(controller);
    return this;
  }
}
