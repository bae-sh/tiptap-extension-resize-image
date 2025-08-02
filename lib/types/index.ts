export interface ResizeState {
  isResizing: boolean;
  startX: number;
  startWidth: number;
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
