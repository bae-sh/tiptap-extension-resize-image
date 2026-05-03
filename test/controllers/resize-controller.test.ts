import { describe, expect, it, vi } from 'vitest';
import { ResizeController } from '../../lib/controllers/resize-controller';

function createElements() {
  return {
    wrapper: document.createElement('div'),
    container: document.createElement('div'),
    img: document.createElement('img'),
  };
}

function createTouchLikeEvent(type: string, clientX: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', {
    value: [{ clientX }],
    configurable: true,
  });
  return event;
}

describe('ResizeController', () => {
  it('adds a resize handle marker and updates width on mouse drag', () => {
    const elements = createElements();
    const dispatch = vi.fn();
    const controller = new ResizeController(elements, dispatch, { minWidth: 100, maxWidth: 260 });
    const handle = controller.createResizeHandle(1);

    Object.defineProperty(elements.container, 'offsetWidth', {
      value: 200,
      configurable: true,
    });

    elements.container.appendChild(handle);

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 500 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(handle.dataset.resizeImageUi).toBe('resize-handle');
    expect(elements.container.style.width).toBe('260px');
    expect(elements.img.style.width).toBe('260px');
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('cleans up through touchcancel and dispatches once', () => {
    const elements = createElements();
    const dispatch = vi.fn();
    const controller = new ResizeController(elements, dispatch, { minWidth: 100, maxWidth: 260 });
    const handle = controller.createResizeHandle(1);

    Object.defineProperty(elements.container, 'offsetWidth', {
      value: 180,
      configurable: true,
    });

    handle.dispatchEvent(createTouchLikeEvent('touchstart', 100));
    document.dispatchEvent(createTouchLikeEvent('touchmove', 220));
    document.dispatchEvent(new Event('touchcancel', { bubbles: true }));

    expect(elements.container.style.width).toBe('260px');
    expect(elements.img.style.width).toBe('260px');
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('coalesces many mousemove updates into a single rAF callback per frame', () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });

    const elements = createElements();
    const dispatch = vi.fn();
    const controller = new ResizeController(elements, dispatch, { minWidth: 50, maxWidth: 1000 });
    const handle = controller.createResizeHandle(1);

    Object.defineProperty(elements.container, 'offsetWidth', {
      value: 200,
      configurable: true,
    });

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));

    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 110 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 130 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 160 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 200 }));

    expect(rafSpy).toHaveBeenCalledTimes(1);
    // Width is not applied synchronously; only the pending value is queued.
    expect(elements.container.style.width).toBe('');
    expect(elements.img.style.width).toBe('');

    // Flush the single queued frame.
    rafCallbacks[0](performance.now());

    // The frame applies only the most recent move (200 - 100 = 100 → 300).
    expect(elements.container.style.width).toBe('300px');
    expect(elements.img.style.width).toBe('300px');

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });

  it('flushes the latest pending width on mouseup even if no frame has ticked', () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(
      (cb: FrameRequestCallback) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      }
    );
    const cancelSpy = vi
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => {});

    const elements = createElements();
    const dispatch = vi.fn();
    const controller = new ResizeController(elements, dispatch, { minWidth: 50, maxWidth: 1000 });
    const handle = controller.createResizeHandle(1);

    Object.defineProperty(elements.container, 'offsetWidth', {
      value: 200,
      configurable: true,
    });

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 250 }));

    // No frame ran; width should still be empty.
    expect(elements.container.style.width).toBe('');

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    expect(elements.container.style.width).toBe('350px');
    expect(elements.img.style.width).toBe('350px');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalled();
  });
});
