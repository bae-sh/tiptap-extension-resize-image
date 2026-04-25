import { describe, expect, it, vi } from 'vitest';
import { ImageNodeView } from '../../lib/controllers/image-node-view';

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
      },
    },
    getPos: undefined as (() => number) | undefined,
  };
}

describe('ImageNodeView', () => {
  it('returns a destroy function that unregisters the document click handler', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const nodeView = new ImageNodeView(createContext(), false);

    const result = nodeView.initialize();
    const clickRegistration = addSpy.mock.calls.find(([type]) => type === 'click');

    expect(typeof result.destroy).toBe('function');
    expect(clickRegistration).toBeTruthy();

    result.destroy?.();

    expect(removeSpy).toHaveBeenCalledWith('click', clickRegistration?.[1]);
  });

  it('adds resize UI on container click and removes it on outside click', () => {
    const nodeView = new ImageNodeView(createContext(), false);
    const result = nodeView.initialize();

    document.body.appendChild(result.dom);

    const container = result.dom.firstElementChild as HTMLElement;
    expect(container.querySelectorAll('[data-resize-image-ui]').length).toBe(0);

    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(container.querySelectorAll('[data-resize-image-ui]').length).toBe(5);

    const outside = document.createElement('div');
    document.body.appendChild(outside);
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(container.querySelectorAll('[data-resize-image-ui]').length).toBe(0);
  });

  it('keeps resize UI when clicking another resize UI element', () => {
    const nodeView = new ImageNodeView(createContext(), false);
    const result = nodeView.initialize();

    document.body.appendChild(result.dom);

    const container = result.dom.firstElementChild as HTMLElement;
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const controlsBefore = container.querySelectorAll('[data-resize-image-ui]').length;
    const uiElement = container.querySelector('[data-resize-image-ui]') as HTMLElement;
    uiElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(container.querySelectorAll('[data-resize-image-ui]').length).toBe(controlsBefore);
  });

  it('returns the container directly when the editor is not editable', () => {
    const nodeView = new ImageNodeView(
      createContext({
        editor: {
          options: {
            editable: false,
          },
        },
      }),
      false
    );

    const result = nodeView.initialize();

    expect(result.destroy).toBeUndefined();
    expect(result.dom.tagName).toBe('DIV');
    expect(result.dom.firstElementChild?.tagName).toBe('IMG');
  });

  it('applies maxWidth during initialization when no width is stored', () => {
    const nodeView = new ImageNodeView(
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

    const result = nodeView.initialize();
    const container = result.dom.firstElementChild as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;

    expect(container.style.width).toBe('240px');
    expect(img.style.width).toBe('240px');
    expect(img.getAttribute('width')).toBe('240');
  });

  it('persists updated attrs through setNodeMarkup when a position control is used', () => {
    const transaction = { id: 'transaction' };
    const setNodeMarkup = vi.fn(() => transaction);
    const dispatch = vi.fn();
    const getPos = vi.fn(() => 5);
    const nodeView = new ImageNodeView(
      createContext({
        view: {
          dispatch,
          state: {
            tr: {
              setNodeMarkup,
            },
          },
        },
        getPos,
      }),
      false
    );

    const result = nodeView.initialize();
    document.body.appendChild(result.dom);

    const container = result.dom.firstElementChild as HTMLElement;
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
    const calls = setNodeMarkup.mock.calls as unknown as Array<
      [number, null, { containerStyle: string }]
    >;
    expect(calls[0]).toBeDefined();
    const attrs = calls[0][2];
    expect(attrs.containerStyle).toContain('margin: 0px auto;');
    expect(dispatch).toHaveBeenCalledWith(transaction);
  });
});
