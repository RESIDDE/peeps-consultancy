"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { MotionValue } from "motion/react";
import { useMotionValue } from "motion/react";
import { useMotionEnv } from "./use-motion-env";

export const CURSOR_IDLE = 0;
export const CURSOR_LINK = 1;
export const CURSOR_TEXT = 2;

/** Elements the cursor reacts to. Matched by delegation, so server markup needs no props. */
const INTERACTIVE = "a,button,[role='button'],[data-cursor],input,textarea,select,summary";

type Pointer = { x: MotionValue<number>; y: MotionValue<number>; intent: MotionValue<number> };

const PointerContext = createContext<Pointer | null>(null);
const ChapterContext = createContext<string | null>(null);

/** MotionValues only — this context's identity never changes, so consumers never re-render. */
export function usePointer() {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error("usePointer must be used inside <InteractionProvider>");
  return ctx;
}

export function useActiveChapter() {
  return useContext(ChapterContext);
}

/**
 * Owns every page-wide listener: one pointermove, one delegated pointerover, one
 * IntersectionObserver. Pointer position is published as MotionValues rather than state,
 * so moving the mouse costs no React work at all.
 *
 * Chapters are discovered from `data-chapter` attributes on server-rendered markup, so no
 * page has to register anything.
 */
export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const { finePointer } = useMotionEnv();
  const pathname = usePathname();

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const intent = useMotionValue(CURSOR_IDLE);
  const pointer = useMemo(() => ({ x, y, intent }), [x, y, intent]);

  // Keyed by pathname so a stale chapter from the previous page is never shown.
  const [seen, setSeen] = useState<{ path: string; label: string } | null>(null);
  const activeChapter = seen && seen.path === pathname ? seen.label : null;

  useEffect(() => {
    if (!finePointer) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [finePointer, x, y]);

  useEffect(() => {
    if (!finePointer) return;
    const onOver = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (!hit) return intent.set(CURSOR_IDLE);
      const tag = hit.tagName;
      intent.set(tag === "INPUT" || tag === "TEXTAREA" ? CURSOR_TEXT : CURSOR_LINK);
    };
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => document.removeEventListener("pointerover", onOver);
  }, [finePointer, intent]);

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-chapter]");
    if (targets.length === 0) return;

    // A band across the middle of the viewport: whichever section crosses it wins.
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        const label = hit?.target.getAttribute("data-chapter");
        if (label) setSeen({ path: pathname, label });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <PointerContext.Provider value={pointer}>
      <ChapterContext.Provider value={activeChapter}>{children}</ChapterContext.Provider>
    </PointerContext.Provider>
  );
}
