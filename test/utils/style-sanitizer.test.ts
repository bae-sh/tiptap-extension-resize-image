import { describe, expect, it } from 'vitest';
import { sanitizeStyle } from '../../lib/utils/style-sanitizer';

describe('sanitizeStyle', () => {
  it('returns empty string for empty / nullish input', () => {
    expect(sanitizeStyle('')).toBe('');
    expect(sanitizeStyle(null)).toBe('');
    expect(sanitizeStyle(undefined)).toBe('');
  });

  it('keeps whitelisted dimension properties with valid values', () => {
    expect(sanitizeStyle('width: 320px; height: auto;')).toBe('width: 320px; height: auto;');
    expect(sanitizeStyle('max-width: 100%; min-width: 50px;')).toBe(
      'max-width: 100%; min-width: 50px;'
    );
  });

  it('keeps whitelisted enum properties with valid values', () => {
    expect(sanitizeStyle('display: inline-block; float: left;')).toBe(
      'display: inline-block; float: left;'
    );
    expect(sanitizeStyle('cursor: pointer;')).toBe('cursor: pointer;');
  });

  it('accepts shorthand margin / padding values', () => {
    expect(sanitizeStyle('margin: 0 auto;')).toBe('margin: 0 auto;');
    expect(sanitizeStyle('margin: 0 0 0 auto;')).toBe('margin: 0 0 0 auto;');
    expect(sanitizeStyle('padding: 10px 20px;')).toBe('padding: 10px 20px;');
  });

  it('drops properties that are not whitelisted', () => {
    expect(sanitizeStyle('position: fixed; top: 0; left: 0;')).toBe('');
    expect(sanitizeStyle('z-index: 99999;')).toBe('');
    expect(sanitizeStyle('background: red;')).toBe('');
    expect(sanitizeStyle('transform: scale(2);')).toBe('');
    expect(sanitizeStyle('opacity: 0.1;')).toBe('');
    expect(sanitizeStyle('pointer-events: none;')).toBe('');
  });

  it('drops values containing function calls or unsafe characters', () => {
    expect(sanitizeStyle('width: calc(100% - 10px);')).toBe('');
    expect(sanitizeStyle('width: var(--w);')).toBe('');
    expect(sanitizeStyle('background: url("https://attacker.example/p");')).toBe('');
    expect(sanitizeStyle('width: expression(alert(1));')).toBe('');
    expect(sanitizeStyle('display: block /* injected */;')).toBe('');
    expect(sanitizeStyle('cursor: pointer; /* */ color: red;')).toBe('cursor: pointer;');
  });

  it('drops invalid enum values for whitelisted properties', () => {
    expect(sanitizeStyle('display: anything;')).toBe('');
    expect(sanitizeStyle('float: top;')).toBe('');
    expect(sanitizeStyle('cursor: url(http://x);')).toBe('');
  });

  it('drops invalid dimension values', () => {
    expect(sanitizeStyle('width: 100xyz;')).toBe('');
    expect(sanitizeStyle('width: red;')).toBe('');
  });

  it('strips !important to prevent override of host page styles', () => {
    expect(sanitizeStyle('width: 320px !important;')).toBe('');
  });

  it('preserves only the first occurrence of a duplicated property', () => {
    expect(sanitizeStyle('width: 100px; width: 200px;')).toBe('width: 100px;');
  });

  it('mixes safe and unsafe declarations correctly', () => {
    const input =
      'width: 320px; position: fixed; top: 0; display: block; background: url(x); margin: 0 auto;';
    expect(sanitizeStyle(input)).toBe('width: 320px; display: block; margin: 0 auto;');
  });

  it('rejects css injection attempts via property names', () => {
    expect(sanitizeStyle('width</style><script>alert(1)</script>: 100px;')).toBe('');
  });

  it('is case-insensitive for property names', () => {
    expect(sanitizeStyle('WIDTH: 320px;')).toBe('width: 320px;');
  });
});
