import { beforeEach, describe, expect, it, vi } from 'vitest';

const { figureNodeViewConstructor, initializeFigureResult } = vi.hoisted(() => {
  return {
    figureNodeViewConstructor: vi.fn(),
    initializeFigureResult: { dom: document.createElement('figure') },
  };
});

vi.mock('../lib/controllers/figure-node-view', () => ({
  FigureNodeView: class MockFigureNodeView {
    constructor(...args: unknown[]) {
      figureNodeViewConstructor(...args);
    }

    initializeFigure() {
      return initializeFigureResult;
    }
  },
}));

import { Figure } from '../lib/figure';

describe('Figure', () => {
  beforeEach(() => {
    figureNodeViewConstructor.mockClear();
  });

  it('passes configured options to FigureNodeView through addNodeView', () => {
    const extension = Figure.configure({
      minWidth: 120,
      maxWidth: 480,
    });
    const createNodeView = extension.config.addNodeView?.call(extension as never);

    expect(createNodeView).toBeTypeOf('function');

    const node = { attrs: { src: 'https://example.com/image.png' } };
    const editor = {
      view: { id: 'editor-view' },
      options: { editable: true },
    };
    const getPos = () => 7;

    const result = createNodeView?.({ node, editor, getPos } as never);

    expect(figureNodeViewConstructor).toHaveBeenCalledWith(
      { node, editor, view: editor.view, getPos },
      false,
      { minWidth: 120, maxWidth: 480 }
    );

    expect(result).toBe(initializeFigureResult);
  });

  it('omits getPos when it is not a function', () => {
    const extension = Figure.configure({});
    const createNodeView = extension.config.addNodeView?.call(extension as never);

    expect(createNodeView).toBeTypeOf('function');

    const node = { attrs: {} };
    const editor = {
      view: { id: 'editor-view' },
      options: { editable: true },
    };

    createNodeView?.({ node, editor, getPos: 3 } as never);

    expect(figureNodeViewConstructor).toHaveBeenLastCalledWith(
      { node, editor, view: editor.view, getPos: undefined },
      false,
      { minWidth: undefined, maxWidth: undefined }
    );
  });
});
