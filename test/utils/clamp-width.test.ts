import { describe, expect, it } from 'vitest';
import { clampWidth } from '../../lib/utils/clamp-width';

describe('clampWidth', () => {
  it('returns the width unchanged when within limits', () => {
    expect(clampWidth(320, { minWidth: 100, maxWidth: 500 })).toBe(320);
  });

  it('clamps to the minimum width', () => {
    expect(clampWidth(80, { minWidth: 120 })).toBe(120);
  });

  it('clamps to the maximum width', () => {
    expect(clampWidth(900, { maxWidth: 640 })).toBe(640);
  });

  it('never returns a negative width', () => {
    expect(clampWidth(-20, {})).toBe(0);
    expect(clampWidth(-20, { minWidth: -100 })).toBe(0);
  });

  it('respects both minimum and maximum bounds together', () => {
    expect(clampWidth(50, { minWidth: 120, maxWidth: 300 })).toBe(120);
    expect(clampWidth(500, { minWidth: 120, maxWidth: 300 })).toBe(300);
  });
});
