import { CONSTANTS } from '../constants/index';

export const utils = {
  isMobile(): boolean {
    return document.documentElement.clientWidth < CONSTANTS.MOBILE_BREAKPOINT;
  },

  getDotPosition(): string {
    return utils.isMobile() ? CONSTANTS.DOT_POSITION.MOBILE : CONSTANTS.DOT_POSITION.DESKTOP;
  },

  getDotSize(): number {
    return utils.isMobile() ? CONSTANTS.DOT_SIZE.MOBILE : CONSTANTS.DOT_SIZE.DESKTOP;
  },

  clearContainerBorder(container: HTMLElement): void {
    const containerStyle = container.getAttribute('style');
    const newStyle = containerStyle
      ?.replace('border: 1px dashed #6C6C6C;', '')
      .replace('border: 1px dashed rgb(108, 108, 108)', '');
    container.setAttribute('style', newStyle as string);
  },

  removeResizeElements(container: HTMLElement): void {
    if (container.childElementCount > 3) {
      for (let i = 0; i < 5; i++) {
        container.removeChild(container.lastChild as Node);
      }
    }
  },
};
