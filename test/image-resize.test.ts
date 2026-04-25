import { beforeEach, describe, expect, it, vi } from 'vitest';

const { imageNodeViewConstructor, initializeResult } = vi.hoisted(() => {
  return {
    imageNodeViewConstructor: vi.fn(),
    initializeResult: { dom: document.createElement('div') },
  };
});

vi.mock('../lib/controllers/image-node-view', () => ({
  ImageNodeView: class MockImageNodeView {
    constructor(...args: unknown[]) {
      imageNodeViewConstructor(...args);
    }

    initialize() {
      return initializeResult;
    }
  },
}));

import { ImageResize } from '../lib/image-resize';

describe('ImageResize', () => {
  beforeEach(() => {
    imageNodeViewConstructor.mockClear();
  });

  it('passes configured options to ImageNodeView through addNodeView', () => {
    const extension = ImageResize.configure({
      inline: true,
      minWidth: 120,
      maxWidth: 480,
    });
    const createNodeView = extension.config.addNodeView?.call(extension);
    const node = { attrs: { src: 'https://example.com/image.png' } };
    const editor = {
      view: { id: 'editor-view' },
      options: { editable: true },
    };
    const getPos = () => 7;

    expect(createNodeView).toBeTypeOf('function');

    const result = createNodeView({
      node,
      editor,
      getPos,
    } as never);

    expect(imageNodeViewConstructor).toHaveBeenCalledWith(
      {
        node,
        editor,
        view: editor.view,
        getPos,
      },
      true,
      { minWidth: 120, maxWidth: 480 }
    );
    expect(result).toBe(initializeResult);
  });

  it('omits getPos when it is not a function', () => {
    const extension = ImageResize.configure({});
    const createNodeView = extension.config.addNodeView?.call(extension);
    const node = { attrs: {} };
    const editor = {
      view: { id: 'editor-view' },
      options: { editable: true },
    };

    expect(createNodeView).toBeTypeOf('function');

    createNodeView({
      node,
      editor,
      getPos: 3,
    } as never);

    expect(imageNodeViewConstructor).toHaveBeenLastCalledWith(
      {
        node,
        editor,
        view: editor.view,
        getPos: undefined,
      },
      false,
      { minWidth: undefined, maxWidth: undefined }
    );
  });
});
