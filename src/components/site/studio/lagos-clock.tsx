"use client";

import { useEffect, useRef } from "react";

const FORMAT = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" });

/**
 * The time in Lagos and Abuja.
 *
 * It renders a real time rather than a row of dashes: these pages are prerendered, so the
 * markup a crawler or a reader without JavaScript sees used to read "WAT → --:--", which
 * makes a live site look broken. The first render prints the clock as it stands wherever it
 * runs, hydration is told not to compare the two — they can never agree, and the difference
 * does not matter — and the effect below corrects it and keeps it ticking.
 */
export function LagosClock() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const write = () => {
      if (ref.current) ref.current.textContent = FORMAT.format(new Date());
    };
    write();
    const tick = window.setInterval(write, 15_000);
    return () => window.clearInterval(tick);
  }, []);
  return (
    <span ref={ref} suppressHydrationWarning className="tabular-nums">
      {FORMAT.format(new Date())}
    </span>
  );
}
