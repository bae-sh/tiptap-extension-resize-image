import { ResizeLimits } from '../types';

/**
 * Clamps a width value to the given resize limits.
 * Always enforces a minimum of 0 to prevent invalid negative CSS values.
 */
export function clampWidth(width: number, limits: ResizeLimits): number {
  const { minWidth, maxWidth } = limits;

  const absoluteMin = minWidth !== undefined ? Math.max(0, minWidth) : 0;
  let clampedWidth = Math.max(absoluteMin, width);

  if (maxWidth !== undefined && clampedWidth > maxWidth) {
    clampedWidth = maxWidth;
  }

  return clampedWidth;
}
