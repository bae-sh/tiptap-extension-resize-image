import { describe, expect, it } from 'vitest';
import { sanitizeStyle } from '../../lib/utils/style-sanitizer';

/**
 * Backward-compatibility guard: every CSS string that previous versions of
 * the library could have written into the containerStyle / wrapperStyle node
 * attributes (via StyleManager and PositionController) MUST round-trip
 * through sanitizeStyle unchanged. This protects users with persisted
 * documents from any visual regression introduced by the sanitizer.
 *
 * If a future change tightens the whitelist and breaks one of these cases,
 * either restore the property or document the migration explicitly.
 */
describe('sanitizeStyle backward compatibility', () => {
  describe('values produced by StyleManager.getContainerStyle', () => {
    it('block container with explicit width', () => {
      const stored = 'width: 320px; height: auto; cursor: pointer;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('block container with default width (100%)', () => {
      const stored = 'width: 100%; height: auto; cursor: pointer;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('inline container appends display: inline-block', () => {
      const stored = 'width: 320px; height: auto; cursor: pointer; display: inline-block;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });
  });

  describe('values produced by StyleManager.getWrapperStyle', () => {
    it('block wrapper', () => {
      const stored = 'display: flex; margin: 0;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('inline wrapper', () => {
      const stored = 'display: inline-block; float: left; padding-right: 8px;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });
  });

  describe('values produced by PositionController alignment clicks', () => {
    it('block container after left-align', () => {
      const stored = 'width: 320px; height: auto; cursor: pointer; margin: 0 auto 0 0;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('block container after center-align', () => {
      const stored = 'width: 320px; height: auto; cursor: pointer; margin: 0 auto;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('block container after right-align', () => {
      const stored = 'width: 320px; height: auto; cursor: pointer; margin: 0 0 0 auto;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('inline container after left-align (display + float + padding)', () => {
      const stored = 'display: inline-block; float: left; padding-right: 8px;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('inline container after right-align (display + float + padding)', () => {
      const stored = 'display: inline-block; float: right; padding-left: 8px;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });
  });

  describe('values produced by browser cssText normalization', () => {
    it('keeps zero shorthand normalized as 0px', () => {
      const stored = 'display: flex; margin: 0px;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });

    it('keeps margin shorthand normalized as 0px auto', () => {
      const stored = 'width: 320px; height: auto; cursor: pointer; margin: 0px auto;';
      expect(sanitizeStyle(stored)).toBe(stored);
    });
  });

  describe('values that legacy data may carry but are intentionally dropped', () => {
    it('strips position: relative left over from selection-border concatenation', () => {
      // The previous selection border path appended `position: relative;
      // border: 1px dashed #6C6C6C;` ahead of the user style. If a stored
      // document still carries those tokens, the sanitizer drops them but
      // the runtime click handler re-applies them via element.style, so
      // the visual behavior is unchanged.
      const legacy =
        'position: relative; border: 1px dashed #6C6C6C; width: 320px; height: auto; cursor: pointer;';
      expect(sanitizeStyle(legacy)).toBe('width: 320px; height: auto; cursor: pointer;');
    });
  });
});
