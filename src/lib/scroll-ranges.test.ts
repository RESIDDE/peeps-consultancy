import { describe, expect, it } from "vitest";
import { clamp01, crossFadeStops, fadeStops, isValidRange } from "./scroll-ranges";

const COUNTS = [1, 2, 3, 7, 8, 12];
const WINDOWS = [0.001, 0.018, 0.05, 0.2];

describe("scroll range stops", () => {
  it("clamps into the unit interval", () => {
    expect(clamp01(-3)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(9)).toBe(1);
  });

  it("keeps fade stops valid at both ends of the track", () => {
    for (const w of WINDOWS) {
      expect(isValidRange(fadeStops(0, w))).toBe(true);
      expect(isValidRange(fadeStops(1, w))).toBe(true);
      expect(isValidRange(fadeStops(0.5, w))).toBe(true);
    }
  });

  it("keeps every cross-fade slide valid for any count and window", () => {
    for (const count of COUNTS) {
      for (const w of WINDOWS) {
        for (let i = 0; i < count; i++) {
          const stops = crossFadeStops(i, count, w);
          expect(isValidRange(stops), `count=${count} window=${w} index=${i} → ${stops}`).toBe(true);
        }
      }
    }
  });

  it("holds the first and last slide against the track ends", () => {
    const first = crossFadeStops(0, 7, 0.018);
    const last = crossFadeStops(6, 7, 0.018);
    expect(first[0]).toBe(0);
    expect(last[3]).toBe(1);
  });

  it("rejects the padding trick that WAAPI throws on", () => {
    expect(isValidRange([-1, -0.9, 0.12, 0.16])).toBe(false);
    expect(isValidRange([0.83, 0.87, 2, 2.1])).toBe(false);
    expect(isValidRange([0.3, 0.3])).toBe(false);
  });
});
