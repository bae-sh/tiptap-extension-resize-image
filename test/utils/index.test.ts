import { describe, expect, it } from 'vitest';
import { utils } from '../../lib/utils';

describe('utils.removeResizeElements', () => {
  it('removes only resize UI elements', () => {
    const container = document.createElement('div');
    const content = document.createElement('img');
    const controller = document.createElement('div');
    const handle = document.createElement('div');

    controller.dataset.resizeImageUi = 'position-controller';
    handle.dataset.resizeImageUi = 'resize-handle';

    container.append(content, controller, handle);

    utils.removeResizeElements(container);

    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(content);
  });
});

describe('utils.clearContainerBorder', () => {
  it('removes the dashed border from inline style text', () => {
    const container = document.createElement('div');
    container.setAttribute('style', 'width: 320px; border: 1px dashed #6C6C6C; cursor: pointer;');

    utils.clearContainerBorder(container);

    expect(container.getAttribute('style')).toContain('width: 320px;');
    expect(container.getAttribute('style')).not.toContain('1px dashed');
  });
});
