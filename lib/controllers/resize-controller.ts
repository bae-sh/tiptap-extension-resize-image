import { ImageElements, ResizeLimits, ResizeState } from '../types';
import { StyleManager } from '../utils/style-manager';

export class ResizeController {
  private elements: ImageElements;
  private dispatchNodeView: () => void;
  private resizeLimits: ResizeLimits;
  private state: ResizeState = {
    isResizing: false,
    startX: 0,
    startWidth: 0,
  };

  constructor(
    elements: ImageElements,
    dispatchNodeView: () => void,
    resizeLimits: ResizeLimits = {}
  ) {
    this.elements = elements;
    this.dispatchNodeView = dispatchNodeView;
    this.resizeLimits = resizeLimits;
  }

  private clampWidth(width: number): number {
    const { minWidth, maxWidth } = this.resizeLimits;

    // Always enforce minimum of 0 to prevent invalid negative CSS values
    const absoluteMin = minWidth !== undefined ? Math.max(0, minWidth) : 0;
    let clampedWidth = Math.max(absoluteMin, width);

    if (maxWidth !== undefined && clampedWidth > maxWidth) {
      clampedWidth = maxWidth;
    }

    return clampedWidth;
  }

  private handleMouseMove = (e: MouseEvent, index: number): void => {
    if (!this.state.isResizing) return;

    const deltaX =
      index % 2 === 0 ? -(e.clientX - this.state.startX) : e.clientX - this.state.startX;
    const newWidth = this.clampWidth(this.state.startWidth + deltaX);

    this.elements.container.style.width = newWidth + 'px';
    this.elements.img.style.width = newWidth + 'px';
  };

  private handleMouseUp = (): void => {
    if (this.state.isResizing) {
      this.state.isResizing = false;
    }
    this.dispatchNodeView();
  };

  private handleTouchMove = (e: TouchEvent, index: number): void => {
    if (!this.state.isResizing) return;

    const deltaX =
      index % 2 === 0
        ? -(e.touches[0].clientX - this.state.startX)
        : e.touches[0].clientX - this.state.startX;
    const newWidth = this.clampWidth(this.state.startWidth + deltaX);

    this.elements.container.style.width = newWidth + 'px';
    this.elements.img.style.width = newWidth + 'px';
  };

  private handleTouchEnd = (): void => {
    if (this.state.isResizing) {
      this.state.isResizing = false;
    }
    this.dispatchNodeView();
  };

  createResizeHandle(index: number): HTMLElement {
    const dot = document.createElement('div');
    dot.setAttribute('style', StyleManager.getDotStyle(index));

    dot.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.state.isResizing = true;
      this.state.startX = e.clientX;
      this.state.startWidth = this.elements.container.offsetWidth;

      const onMouseMove = (e: MouseEvent) => this.handleMouseMove(e, index);
      const onMouseUp = () => {
        this.handleMouseUp();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    dot.addEventListener(
      'touchstart',
      (e) => {
        e.cancelable && e.preventDefault();
        this.state.isResizing = true;
        this.state.startX = e.touches[0].clientX;
        this.state.startWidth = this.elements.container.offsetWidth;

        const onTouchMove = (e: TouchEvent) => this.handleTouchMove(e, index);
        const onTouchEnd = () => {
          this.handleTouchEnd();
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('touchend', onTouchEnd);
        };

        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
      },
      { passive: false }
    );

    return dot;
  }
}
