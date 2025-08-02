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

  private handleLeftClick(): void {
    if (!this.inline) {
      this.elements.container.setAttribute(
        'style',
        `${this.elements.container.style.cssText} margin: 0 auto 0 0;`
      );
    } else {
      const style = 'display: inline-block; float: left; padding-right: 8px;';
      this.elements.wrapper.setAttribute('style', style);
      this.elements.container.setAttribute('style', style);
    }
    this.dispatchNodeView();
  }

  private handleCenterClick(): void {
    this.elements.container.setAttribute(
      'style',
      `${this.elements.container.style.cssText} margin: 0 auto;`
    );
    this.dispatchNodeView();
  }

  private handleRightClick(): void {
    if (!this.inline) {
      this.elements.container.setAttribute(
        'style',
        `${this.elements.container.style.cssText} margin: 0 0 0 auto;`
      );
    } else {
      const style = 'display: inline-block; float: right; padding-left: 8px;';
      this.elements.wrapper.setAttribute('style', style);
      this.elements.container.setAttribute('style', style);
    }
    this.dispatchNodeView();
  }

  createPositionControls(): PositionController {
    const controller = document.createElement('div');
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
