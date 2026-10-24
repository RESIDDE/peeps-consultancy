"use client";

import { useEffect, useRef } from "react";

const FORMAT = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" });

/**
 * The time in Lagos and Abuja. Written into the DOM after mount rather than rendered, so the
 * server's clock and the reader's never have to agree for hydration.
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
    <span ref={ref} className="tabular-nums">
      --:--
    </span>
  );
}
