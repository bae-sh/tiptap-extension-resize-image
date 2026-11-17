export interface ResizeState {
  isResizing: boolean;
  startX: number;
  startWidth: number;
}

export interface ResizeLimits {
  minWidth?: number;
  maxWidth?: number;
}

export type Alignment = 'left' | 'center' | 'right';

export type AlignIcons = Partial<Record<Alignment, string>>;

export interface AlignControlOptions {
  icons?: AlignIcons;
  unstyled?: boolean;
}

export interface PositionController {
  element: HTMLElement;
  leftController: HTMLElement;
  centerController?: HTMLElement;
  rightController: HTMLElement;
}

export interface ImageElements {
  wrapper: HTMLElement;
  container: HTMLElement;
  img: HTMLImageElement;
}
