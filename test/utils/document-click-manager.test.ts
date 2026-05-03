import { describe, expect, it, vi } from 'vitest';
import {
  __resetDocumentClickManagerForTests,
  subscribeDocumentClick,
} from '../../lib/utils/document-click-manager';

describe('document click manager', () => {
  it('attaches a single document listener regardless of subscriber count', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');

    const offA = subscribeDocumentClick(() => {});
    const offB = subscribeDocumentClick(() => {});
    const offC = subscribeDocumentClick(() => {});

    const clicks = addSpy.mock.calls.filter(([type]) => type === 'click');
    expect(clicks).toHaveLength(1);

    offA();
    offB();
    offC();
  });

  it('detaches the document listener only after the last unsubscribe', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const offA = subscribeDocumentClick(() => {});
    const offB = subscribeDocumentClick(() => {});

    offA();
    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(0);

    offB();
    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1);
  });

  it('dispatches click events to every active subscriber', () => {
    const seen: string[] = [];
    const offA = subscribeDocumentClick(() => seen.push('a'));
    const offB = subscribeDocumentClick(() => seen.push('b'));

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(seen).toEqual(['a', 'b']);
    offA();
    offB();
  });

  it('lets a subscriber unsubscribe itself during dispatch without skipping siblings', () => {
    const seen: string[] = [];
    let offA: () => void = () => {};
    offA = subscribeDocumentClick(() => {
      seen.push('a');
      offA();
    });
    const offB = subscribeDocumentClick(() => seen.push('b'));

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(seen).toEqual(['a', 'b']);
    offB();
  });

  it('isolates subscriber errors so other subscribers still run', () => {
    const seen: string[] = [];
    const offA = subscribeDocumentClick(() => {
      throw new Error('boom');
    });
    const offB = subscribeDocumentClick(() => seen.push('b'));

    expect(() =>
      document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    ).not.toThrow();
    expect(seen).toEqual(['b']);

    offA();
    offB();
  });

  it('treats a duplicated unsubscribe as a no-op', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const off = subscribeDocumentClick(() => {});
    off();
    off();
    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1);
  });

  it('reset helper drops all subscribers and detaches the listener', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    subscribeDocumentClick(() => {});
    subscribeDocumentClick(() => {});

    __resetDocumentClickManagerForTests();

    expect(removeSpy.mock.calls.filter(([type]) => type === 'click')).toHaveLength(1);

    const seen: string[] = [];
    const off = subscribeDocumentClick(() => seen.push('after-reset'));
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(seen).toEqual(['after-reset']);
    off();
  });
});
