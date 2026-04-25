import { describe, expect, it } from 'vitest';
import { AttributeParser } from '../../lib/utils/attribute-parser';

describe('AttributeParser', () => {
  it('maps supported node attrs to the image element', () => {
    const img = document.createElement('img');

    AttributeParser.parseImageAttributes(
      {
        src: 'https://example.com/photo.png',
        alt: 'photo',
        title: 'cover',
        containerStyle: 'width: 280px; height: auto; cursor: pointer;',
        wrapperStyle: 'display: flex',
        ignored: undefined,
        empty: null,
      },
      img
    );

    expect(img.getAttribute('src')).toBe('https://example.com/photo.png');
    expect(img.getAttribute('alt')).toBe('photo');
    expect(img.getAttribute('title')).toBe('cover');
    expect(img.getAttribute('width')).toBe('280');
    expect(img.hasAttribute('wrapperStyle')).toBe(false);
    expect(img.hasAttribute('ignored')).toBe(false);
    expect(img.hasAttribute('empty')).toBe(false);
  });

  it('extracts width from style text when present', () => {
    expect(AttributeParser.extractWidthFromStyle('height: auto; width: 320px;')).toBe('320');
  });

  it('returns null when width is not present in style text', () => {
    expect(AttributeParser.extractWidthFromStyle('height: auto; cursor: pointer;')).toBeNull();
  });
});
