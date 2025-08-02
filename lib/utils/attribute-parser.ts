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
}
