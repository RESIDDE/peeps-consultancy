"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import type { MotionValue } from "motion/react";
import { useMotionValue } from "motion/react";

type Pointer = { x: MotionValue<number>; y: MotionValue<number> };

const PointerContext = createContext<Pointer | null>(null);

/** MotionValues only — this context's identity never changes, so consumers never re-render. */
export function usePointer() {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error("usePointer must be used inside <InteractionProvider>");
  return ctx;
}

/**
 * Owns the one page-wide pointermove listener. Position is published as MotionValues
 * rather than state, so moving the mouse costs no React work at all.
 */
export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const pointer = useMemo(() => ({ x, y }), [x, y]);

  // Every pointer type, because the hero glass leans toward a finger as readily as a mouse.
  // Passive, so tracking can never hold up a scroll.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, [x, y]);

  return <PointerContext.Provider value={pointer}>{children}</PointerContext.Provider>;
}
