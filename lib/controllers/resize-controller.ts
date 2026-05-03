import { ImageElements, ResizeLimits, ResizeState } from '../types';
import { clampWidth } from '../utils/clamp-width';
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
  // High-frequency pointer events (especially 1000Hz mice) can fire many
  // times per frame. Coalesce updates through requestAnimationFrame so the
  // browser only paints once per frame and we avoid forcing layout in the
  // input handler.
  private pendingWidth: number | null = null;
  private rafId: number | null = null;

  constructor(
    elements: ImageElements,
    dispatchNodeView: () => void,
    resizeLimits: ResizeLimits = {}
  ) {
    this.elements = elements;
    this.dispatchNodeView = dispatchNodeView;
    this.resizeLimits = resizeLimits;
  }

  private scheduleWidthUpdate(width: number): void {
    this.pendingWidth = width;
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.flushWidth();
    });
  }

  private flushWidth(): void {
    if (this.pendingWidth === null) return;
    const width = this.pendingWidth;
    this.pendingWidth = null;
    this.elements.container.style.width = `${width}px`;
    this.elements.img.style.width = `${width}px`;
  }

  private cancelScheduledWidth(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private handleMouseMove = (e: MouseEvent, index: number): void => {
    if (!this.state.isResizing) return;

    const deltaX =
      index % 2 === 0 ? -(e.clientX - this.state.startX) : e.clientX - this.state.startX;
    const newWidth = clampWidth(this.state.startWidth + deltaX, this.resizeLimits);

    this.scheduleWidthUpdate(newWidth);
  };

  private handleMouseUp = (): void => {
    if (this.state.isResizing) {
      this.state.isResizing = false;
    }
    // Make sure the final pending width is applied even if no frame ticked
    // between the last move and release; otherwise the persisted value would
    // miss the user's last drag delta.
    this.cancelScheduledWidth();
    this.flushWidth();
    this.dispatchNodeView();
  };

  private handleTouchMove = (e: TouchEvent, index: number): void => {
    if (!this.state.isResizing) return;

    const deltaX =
      index % 2 === 0
        ? -(e.touches[0].clientX - this.state.startX)
        : e.touches[0].clientX - this.state.startX;
    const newWidth = clampWidth(this.state.startWidth + deltaX, this.resizeLimits);

    this.scheduleWidthUpdate(newWidth);
  };

  private handleTouchEnd = (): void => {
    if (this.state.isResizing) {
      this.state.isResizing = false;
    }
    this.cancelScheduledWidth();
    this.flushWidth();
    this.dispatchNodeView();
  };

  createResizeHandle(index: number): HTMLElement {
    const dot = document.createElement('div');
    dot.dataset.resizeImageUi = 'resize-handle';
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
          document.removeEventListener('touchcancel', onTouchEnd);
        };

        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
        document.addEventListener('touchcancel', onTouchEnd);
      },
      { passive: false }
    );

    return dot;
  }
}
