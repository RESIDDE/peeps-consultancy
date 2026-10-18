"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from "motion/react";
import { LensFace } from "./lens-face";
import { usePointer } from "./interaction-provider";
import { takeSnapshot } from "./page-snapshot";
import { useMotionEnv } from "./use-motion-env";

/** How much bigger the page reads under the glass. */
const ZOOM = 2.1;
/** Surfaces where a press means something else and the lens must stay out of the way. */
const NO_LENS = "input, textarea, select, [contenteditable], [data-no-lens]";

/**
 * A working magnifier. No browser API magnifies live DOM — `element()` is Firefox-only,
 * `backdrop-filter` cannot scale, and rasterising is far too slow to track a pointer — so the
 * lens shows a cloned copy of the page, scaled, clipped to a circle and offset so the point
 * under the glass lands in its middle.
 *
 * The clone is taken once per pick-up rather than per frame: dragging is then pure transform.
 */
export function Lens() {
  const { pointerExtras, wide } = useMotionEnv();
  const pointer = usePointer();
  const { scrollX, scrollY } = useScroll();

  const host = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);
  const active = pointerExtras && held;

  const radius = wide ? 150 : 110;

  // Follow with a little lag, the way a held object trails the hand.
  const follow = { stiffness: 700, damping: 44, mass: 0.5 };
  const lx = useSpring(useTransform(pointer.x, (v) => v - radius), follow);
  const ly = useSpring(useTransform(pointer.y, (v) => v - radius), follow);

  // Scale about the lens centre, so the magnified point sits exactly under the glass.
  const innerX = useTransform(() => -(lx.get() + radius + scrollX.get()));
  const innerY = useTransform(() => -(ly.get() + radius + scrollY.get()));
  const inner = useMotionTemplate`translate(${radius}px, ${radius}px) scale(${ZOOM}) translate(${innerX}px, ${innerY}px)`;

  const snapshot = useCallback(() => takeSnapshot(host.current), []);

  useEffect(() => {
    if (!pointerExtras) return;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest(NO_LENS)) return;

      snapshot();
      setHeld(true);
    };

    const onUp = () => setHeld(false);

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, [pointerExtras, snapshot]);

  // A stale snapshot would magnify the wrong thing, so refresh it when the page moves under it.
  useEffect(() => {
    if (!active) return;
    let settle: number | undefined;
    const refresh = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(snapshot, 120);
    };
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, [active, snapshot]);

  // Text selection while dragging a lens around looks broken.
  useEffect(() => {
    document.documentElement.classList.toggle("lens-held", Boolean(active));
    return () => document.documentElement.classList.remove("lens-held");
  }, [active]);

  if (!pointerExtras) return null;

  return (
    <motion.div
      data-lens-root
      aria-hidden
      className="lens"
      style={{
        x: lx,
        y: ly,
        width: radius * 2,
        height: radius * 2,
        opacity: active ? 1 : 0,
        scale: active ? 1 : 0.75,
      }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div ref={host} className="lens-inner" style={{ transform: inner }} />
      <LensFace x={lx} y={ly} radius={radius} />
      <span className="lens-glare" />
    </motion.div>
  );
}
