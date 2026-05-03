import { afterEach, vi } from 'vitest';
import { __resetDocumentClickManagerForTests } from '../lib/utils/document-click-manager';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  __resetDocumentClickManagerForTests();
});
