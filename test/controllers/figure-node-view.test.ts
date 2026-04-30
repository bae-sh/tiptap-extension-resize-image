import { afterEach, describe, expect, it, vi } from 'vitest';
import { FigureNodeView } from '../../lib/controllers/figure-node-view';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { ViewMutationRecord } from '@tiptap/pm/view';

type TestContext = ReturnType<typeof createContextBase>;
type TestContextOverrides = {
  node?: {
    attrs?: Partial<TestContext['node']['attrs']>;
  };
  editor?: {
    options?: Partial<TestContext['editor']['options']>;
  };
  view?: Partial<TestContext['view']> & {
    state?: Partial<TestContext['view']['state']>;
  };
  getPos?: (() => number) | undefined;
};

function createContext(overrides?: TestContextOverrides) {
  const base = createContextBase();

  return {
    ...base,
    ...overrides,
    node: {
      ...base.node,
      ...overrides?.node,
      attrs: {
        ...base.node.attrs,
        ...overrides?.node?.attrs,
      },
    },
    editor: {
      ...base.editor,
      ...overrides?.editor,
      options: {
        ...base.editor.options,
        ...overrides?.editor?.options,
      },
    },
    view: {
      ...base.view,
      ...overrides?.view,
      state: {
        ...base.view.state,
        ...overrides?.view?.state,
      },
    },
  };
}

function createContextBase() {
  const editorDom = document.createElement('div');

  return {
    node: {
      type: {},
      attrs: {
        src: 'https://example.com/image.png',
        alt: 'example',
        width: 320,
        containerStyle: 'width: 320px; height: auto; cursor: pointer;',
        wrapperStyle: 'display: flex; margin: 0;',
      },
    },
    editor: {
      options: {
        editable: true,
      },
    },
    view: {
      dom: editorDom,
      dispatch: vi.fn(),
      state: {
        tr: {
          setNodeMarkup: vi.fn(),
        },
        selection: { map: vi.fn() },
        doc: {},
      },
    },
    getPos: undefined as (() => number) | undefined,
  };
}

describe('FigureNodeView', () => {
  describe('Rendering', () => {
    it('renders a simplified static structure in read-only mode', () => {
      const figureNodeView = new FigureNodeView(
        createContext({ editor: { options: { editable: false } } }),
        false
      );

      const result = figureNodeView.initializeFigure();
      const dom = result.dom as HTMLElement;

      expect(result.destroy).toBeUndefined();
      expect(dom.tagName).toBe('FIGURE');
      expect(dom.firstElementChild?.tagName).toBe('DIV');
      expect(dom.firstElementChild?.firstElementChild?.tagName).toBe('IMG');
    });
  });

  describe('Layout', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('shows resize UI when container is clicked', () => {
      const figureNodeView = new FigureNodeView(createContext(), false);
      const result = figureNodeView.initializeFigure();

      const dom = result.dom as HTMLElement;
      document.body.appendChild(dom);

      const container = dom.firstElementChild as HTMLElement;
      container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(container.querySelectorAll('[data-resize-image-ui]').length).toBe(5);
    });

    it('removes resize UI when clicking outside the container', () => {
      const figureNodeView = new FigureNodeView(createContext(), false);
      const result = figureNodeView.initializeFigure();

      const dom = result.dom as HTMLElement;
      document.body.appendChild(dom);

      const container = dom.firstElementChild as HTMLElement;
      container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const outside = document.createElement('div');
      document.body.appendChild(outside);
      outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(container.querySelectorAll('[data-resize-image-ui]').length).toBe(0);
    });

    it('keeps resize UI when clicking another resize UI element', () => {
      const figureNodeView = new FigureNodeView(createContext(), false);
      const result = figureNodeView.initializeFigure();

      const dom = result.dom as HTMLElement;
      document.body.appendChild(dom);

      const container = dom.firstElementChild as HTMLElement;
      container.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const controlsBefore = container.querySelectorAll('[data-resize-image-ui]').length;

      const uiElement = container.querySelector('[data-resize-image-ui]') as HTMLElement;
      uiElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(container.querySelectorAll('[data-resize-image-ui]').length).toBe(controlsBefore);
    });

    it('applies maxWidth during initialization when no width is stored', () => {
      const figureNodeView = new FigureNodeView(
        createContext({
          node: {
            attrs: {
              containerStyle: 'height: auto; cursor: pointer;',
            },
          },
        }),
        false,
        { maxWidth: 240 }
      );

      const result = figureNodeView.initializeFigure();
      const dom = result.dom as HTMLElement;
      const container = dom.firstElementChild as HTMLElement;
      const img = container.querySelector('img') as HTMLImageElement;

      expect(container.style.width).toBe('240px');
      expect(img.style.width).toBe('240px');
      expect(img.getAttribute('width')).toBe('240');
    });

    it('persists layout changes when a position control is used', () => {
      const transaction = { id: 'transaction' };
      const setNodeMarkup = vi.fn().mockReturnValue({
        setSelection: vi.fn().mockReturnValue(transaction),
        doc: {},
      });
      const dispatch = vi.fn();
      const getPos = vi.fn(() => 5);

      const figureNodeView = new FigureNodeView(
        createContext({
          view: {
            dispatch,
            state: {
              tr: { setNodeMarkup },
              selection: { map: vi.fn().mockReturnValue({ id: 'newSelection' }) },
              doc: {},
            },
          },
          getPos,
        }),
        false
      );
      const result = figureNodeView.initializeFigure();

      const dom = result.dom as HTMLElement;
      document.body.appendChild(dom);

      const container = dom.firstElementChild as HTMLElement;
      container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const controls = container.querySelector('[data-resize-image-ui="position-controller"]');
      (controls?.children[1] as HTMLElement).click();

      expect(getPos).toHaveBeenCalled();
      expect(setNodeMarkup).toHaveBeenCalledWith(
        5,
        null,
        expect.objectContaining({
          width: '320',
          wrapperStyle: 'display: flex; margin: 0px;',
        })
      );

      const calls = setNodeMarkup.mock.calls as unknown as [
        number,
        null,
        { containerStyle: string },
      ][];
      expect(calls[0]).toBeDefined();

      const attrs = calls[0][2];
      expect(attrs.containerStyle).toContain('margin: 0px auto;');
      expect(dispatch).toHaveBeenCalledWith(transaction);
    });
  });

  describe('Event handling', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('update', () => {
      it('updates DOM attributes without re-rendering when node type is unchanged', () => {
        const context = createContext();
        const figureNodeView = new FigureNodeView(context, false);
        const result = figureNodeView.initializeFigure();
        const dom = result.dom as HTMLElement;
        const container = dom.firstElementChild as HTMLElement;
        const update = result.update as unknown as (node: ProseMirrorNode) => boolean;

        const updatedNode = {
          type: context.node.type,
          attrs: {
            src: 'https://example.com/updated.png',
            alt: 'updated',
            width: 480,
            containerStyle: 'width: 480px; height: auto; cursor: pointer;',
            wrapperStyle: 'display: flex; margin: 0 auto;',
          },
        } as unknown as ProseMirrorNode;

        const updated = update(updatedNode);

        expect(updated).toBe(true);
        expect(dom.getAttribute('style')).toBe('display: flex; margin: 0 auto;');
        expect(container.getAttribute('style')).toBe(
          'width: 480px; height: auto; cursor: pointer;'
        );
      });
    });

    describe('stopEvent', () => {
      it('lets the editor handle dragstart events for native drag support', () => {
        const figureNodeView = new FigureNodeView(createContext(), false);
        const result = figureNodeView.initializeFigure();

        const event = new Event('dragstart');

        expect(result.stopEvent?.(event)).toBe(false);
      });

      it('allows the editor to process input events originating inside the caption', () => {
        const figureNodeView = new FigureNodeView(createContext(), false);
        const result = figureNodeView.initializeFigure();

        const contentDOM = result.contentDOM as HTMLElement;
        const target = document.createElement('span');
        contentDOM.appendChild(target);

        const event = { type: 'keydown', target } as unknown as Event;

        expect(result.stopEvent?.(event)).toBe(false);
      });

      it('stops events outside the caption to prevent unintended editor interactions', () => {
        const figureNodeView = new FigureNodeView(createContext(), false);
        const result = figureNodeView.initializeFigure();
        const dom = result.dom as HTMLElement;
        const container = dom.firstElementChild as HTMLElement;

        const event = { type: 'click', target: container } as unknown as Event;

        expect(result.stopEvent?.(event)).toBe(true);
      });
    });

    describe('ignoreMutation', () => {
      it('lets the editor observe selection changes for correct cursor positioning', () => {
        const figureNodeView = new FigureNodeView(createContext(), false);
        const result = figureNodeView.initializeFigure();

        const mutation = {
          type: 'selection',
          target: document.createElement('span'),
        } as unknown as ViewMutationRecord;

        expect(result.ignoreMutation?.(mutation)).toBe(false);
      });

      it('lets the editor track content changes within the caption area', () => {
        const figureNodeView = new FigureNodeView(createContext(), false);
        const result = figureNodeView.initializeFigure();

        const contentDOM = result.contentDOM as HTMLElement;
        const target = document.createElement('span');
        contentDOM.appendChild(target);

        const mutation = { type: 'childList', target } as unknown as ViewMutationRecord;

        expect(result.ignoreMutation?.(mutation)).toBe(false);
      });

      it('ignores internal DOM changes to prevent unnecessary re-rendering', () => {
        const figureNodeView = new FigureNodeView(createContext(), false);
        const result = figureNodeView.initializeFigure();
        const target = document.createElement('span');

        const mutation = { type: 'childList', target } as unknown as ViewMutationRecord;

        expect(result.ignoreMutation?.(mutation)).toBe(true);
      });
    });

    describe('destroy', () => {
      it('unregisters all event handlers', () => {
        const elementAddSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');
        const elementRemoveSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener');
        const documentAddSpy = vi.spyOn(document, 'addEventListener');
        const documentRemoveSpy = vi.spyOn(document, 'removeEventListener');

        const figureNodeView = new FigureNodeView(createContext(), false);
        const result = figureNodeView.initializeFigure();

        const containerClickHandlers = elementAddSpy.mock.calls
          .filter(([type]) => type === 'click')
          .map(([, handler]) => handler);

        const dragStartCalls = elementAddSpy.mock.calls.find(([type]) => type === 'dragstart');
        const wrapperDragHandler = dragStartCalls?.[1];

        const documentClickCalls = documentAddSpy.mock.calls.find(([type]) => type === 'click');
        const documentClickHandler = documentClickCalls?.[1];

        expect(typeof result.destroy).toBe('function');

        result.destroy?.();

        containerClickHandlers.forEach((handler) => {
          expect(elementRemoveSpy).toHaveBeenCalledWith('click', handler);
        });
        expect(elementRemoveSpy).toHaveBeenCalledWith('dragstart', wrapperDragHandler);
        expect(documentRemoveSpy).toHaveBeenCalledWith('click', documentClickHandler);
      });
    });
  });
});
