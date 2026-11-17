export class AttributeParser {
  static parseImageAttributes(nodeAttrs: Record<string, any>, imgElement: HTMLImageElement): void {
    Object.entries(nodeAttrs).forEach(([key, value]) => {
      if (value === undefined || value === null || key === 'wrapperStyle') return;

      if (key === 'containerStyle') {
        const width = (value as string).match(/width:\s*([0-9.]+)px/);
        if (width) {
          imgElement.setAttribute('width', width[1]);
        }
        return;
      }
      imgElement.setAttribute(key, value as string);
    });
  }

  static extractWidthFromStyle(style: string): string | null {
    const width = style.match(/width:\s*([0-9.]+)px/);
    return width ? width[1] : null;
  }

  static getResizedSize(
    attrs: Record<string, any>,
    containerStyle: string
  ): { width: unknown; height: unknown } {
    const styleWidth = AttributeParser.extractWidthFromStyle(containerStyle);
    if (styleWidth === null) return { width: attrs.width, height: attrs.height };

    const width = Number(styleWidth);
    const prevWidth = Number(attrs.width);
    const prevHeight = Number(attrs.height);
    const height =
      prevWidth > 0 && prevHeight > 0 ? Math.round((prevHeight * width) / prevWidth) : attrs.height;
    return { width, height };
  }
}
