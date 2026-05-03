/**
 * Shared `document` click dispatcher.
 *
 * Every editable ImageNodeView used to attach its own `click` listener to
 * `document` so it could detect clicks outside the image and dismiss the
 * resize UI. With many images on a page this scaled to N listeners and made
 * every click in the document fan out to N handlers.
 *
 * This module keeps a single `document` listener regardless of how many
 * NodeViews subscribe. Subscribers are dispatched in insertion order; one
 * subscriber throwing does not stop the rest.
 */

type ClickListener = (event: MouseEvent) => void;

const subscribers: Set<ClickListener> = new Set();
let attached = false;
let attachedDoc: Document | null = null;

const dispatch = (event: MouseEvent): void => {
  // Snapshot to allow a subscriber to unsubscribe itself during dispatch
  // without skipping siblings.
  const snapshot = Array.from(subscribers);
  for (const listener of snapshot) {
    try {
      listener(event);
    } catch {
      // Swallow per-subscriber errors so a buggy NodeView cannot block the
      // rest of the page from receiving outside-click handling.
    }
  }
};

const ensureAttached = (): void => {
  if (attached) return;
  if (typeof document === 'undefined') return;
  attachedDoc = document;
  attachedDoc.addEventListener('click', dispatch);
  attached = true;
};

const detachIfEmpty = (): void => {
  if (!attached) return;
  if (subscribers.size > 0) return;
  attachedDoc?.removeEventListener('click', dispatch);
  attached = false;
  attachedDoc = null;
};

/**
 * Registers a callback that will be invoked for every `click` event on
 * `document`. Returns an idempotent `unsubscribe` function that the caller
 * MUST invoke (typically from a NodeView `destroy` hook) to avoid leaks.
 */
export function subscribeDocumentClick(listener: ClickListener): () => void {
  subscribers.add(listener);
  ensureAttached();

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    subscribers.delete(listener);
    detachIfEmpty();
  };
}

/**
 * Test-only helper. Clears all subscribers and detaches the underlying
 * `document` listener so that test cases do not leak state into one
 * another. Production code MUST NOT call this.
 */
export function __resetDocumentClickManagerForTests(): void {
  subscribers.clear();
  detachIfEmpty();
}
