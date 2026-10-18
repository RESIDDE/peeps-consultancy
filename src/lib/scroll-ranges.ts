/**
 * Input ranges for scroll-linked `useTransform` calls.
 *
 * Every stop must sit inside [0,1] and ascend. When motion accelerates a value chained off
 * `useScroll` it hands the input range to the Web Animations API as keyframe offsets
 * (`keyframeOptions.offset = times`, motion-dom's start-waapi-animation), and WAAPI throws
 * "Offsets must be monotonically non-decreasing" on anything outside that range or out of
 * order. Padding a range with -1 or 2 to hold a value at the ends looks harmless and is not.
 */

/** Smallest gap between two stops. Below this the interpolation divides by ~zero. */
export const EPSILON = 0.0001;

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Two ascending stops around `at`, for something that fades in once and stays. */
export function fadeStops(at: number, halfWindow: number): [number, number] {
  const to = clamp01(at + halfWindow);
  const from = Math.min(clamp01(at - halfWindow), to - EPSILON);
  return [clamp01(from), to];
}

/**
 * Four ascending stops for one slide of a cross-fade: off, on, on, off. The first and last
 * slides are pinned to the track ends so they hold rather than fading to nothing.
 */
export function crossFadeStops(index: number, count: number, halfWindow: number): number[] {
  const from = index / count;
  const to = (index + 1) / count;
  // Two half-windows have to fit inside one slide, or a slide's "on" stops cross its "off"
  // stops and the range stops ascending. Narrow the fade rather than produce an invalid range.
  const w = Math.min(halfWindow, 1 / (2 * count) - EPSILON);
  const first = index === 0;
  const last = index === count - 1;
  return [
    first ? 0 : clamp01(from - w),
    first ? EPSILON : clamp01(from + w),
    last ? 1 - EPSILON : clamp01(to - w),
    last ? 1 : clamp01(to + w),
  ];
}

/** True when every stop is inside [0,1] and strictly ascending — what WAAPI demands. */
export function isValidRange(stops: readonly number[]) {
  return stops.every((v, i) => v >= 0 && v <= 1 && (i === 0 || v > stops[i - 1]));
}
