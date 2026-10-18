"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";

/** Graduations round the rim, as on an instrument. */
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const round = (n: number) => Math.round(n * 100) / 100;

/**
 * The instrument face laid over the magnified copy: measuring grid, crosshair, centre dot,
 * rim graduations and a live coordinate readout. Colours come from the xray pair, which
 * flips with the theme, so the face is always legible against whatever the lens contains.
 */
export function LensFace({
  x,
  y,
  radius,
  ticks = true,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  radius: number;
  /** The drawn glass has graduations on its own bezel, so it does not want a second set. */
  ticks?: boolean;
}) {
  const readX = useRef<HTMLSpanElement>(null);
  const readY = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const write = () => {
      if (readX.current) readX.current.textContent = `x ${Math.round(x.get() + radius)}`;
      if (readY.current) readY.current.textContent = `y ${Math.round(y.get() + radius)}`;
    };
    write();
    const stopX = x.on("change", write);
    const stopY = y.on("change", write);
    return () => {
      stopX();
      stopY();
    };
  }, [x, y, radius]);

  return (
    <>
      <span aria-hidden className="lens-grid" />
      <span aria-hidden className="lens-cross" />
      <span aria-hidden className="lens-dot" />
      {ticks && (
        <svg aria-hidden className="lens-ticks" viewBox="0 0 200 200">
          {TICKS.map((deg) => {
            const a = (deg * Math.PI) / 180;
            const major = deg % 15 === 0;
            const r1 = 94;
            const r2 = major ? 100 : 97;
            return (
              <line
                key={deg}
                x1={round(100 + Math.cos(a) * r1)}
                y1={round(100 + Math.sin(a) * r1)}
                x2={round(100 + Math.cos(a) * r2)}
                y2={round(100 + Math.sin(a) * r2)}
                strokeWidth={major ? 1.6 : 0.9}
              />
            );
          })}
        </svg>
      )}
      <span aria-hidden className="lens-readout">
        <span ref={readX} />
        <span ref={readY} />
      </span>
    </>
  );
}
