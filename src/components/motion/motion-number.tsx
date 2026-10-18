"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

const format = (n: number, pad: number) => String(Math.round(n)).padStart(pad, "0");

/**
 * Renders a MotionValue as text by writing textContent directly, so a counter that changes
 * on every scroll frame never re-renders React. Tabular figures are not optional: proportional
 * digits change width as they count and the number visibly jitters.
 */
export function MotionNumber({
  value,
  pad = 0,
  className,
}: {
  value: MotionValue<number>;
  pad?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const write = (n: number) => {
      if (ref.current) ref.current.textContent = format(n, pad);
    };
    write(value.get());
    return value.on("change", write);
  }, [value, pad]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {format(value.get(), pad)}
    </span>
  );
}
