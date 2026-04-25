import { describe, expect, it, vi } from 'vitest';
import { PositionController } from '../../lib/controllers/position-controller';

function createElements() {
  return {
    wrapper: document.createElement('div'),
    container: document.createElement('div'),
    img: document.createElement('img'),
  };
}

describe('PositionController', () => {
  it('renders three alignment controls in block mode and updates container style', () => {
    const elements = createElements();
    const dispatch = vi.fn();
    const controller = new PositionController(elements, false, dispatch);

    controller.createPositionControls();

    const controls = elements.container.querySelector('[data-resize-image-ui="position-controller"]');
    expect(controls?.children).toHaveLength(3);

    (controls?.children[1] as HTMLElement).click();

    expect(elements.container.style.margin).toBe('0px auto');
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('renders two alignment controls in inline mode and updates wrapper/container styles', () => {
    const elements = createElements();
    const dispatch = vi.fn();
    const controller = new PositionController(elements, true, dispatch);

    controller.createPositionControls();

    const controls = elements.container.querySelector('[data-resize-image-ui="position-controller"]');
    expect(controls?.children).toHaveLength(2);

    (controls?.children[1] as HTMLElement).click();

    expect(elements.wrapper.style.float).toBe('right');
    expect(elements.container.style.float).toBe('right');
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
