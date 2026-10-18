"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform, useVelocity } from "motion/react";
import { CURSOR_IDLE, CURSOR_LINK, CURSOR_TEXT, usePointer } from "./interaction-provider";
import { useMotionEnv } from "./use-motion-env";

/**
 * The ring that replaces the pointer. Position, scale and stretch all come from MotionValues,
 * so moving the mouse never re-renders React.
 *
 * The native cursor is only hidden while `data-cursor="on"` is set from here, and it comes
 * straight back on Tab or when the window loses focus: hiding the system cursor overrides the
 * viewer's own OS cursor-size and high-contrast settings, so it must never be the sticky state.
 */
export function Cursor() {
  const { pointerExtras } = useMotionEnv();
  const { x, y, intent } = usePointer();

  const springs = { stiffness: 900, damping: 50, mass: 0.4 };
  const sx = useSpring(x, springs);
  const sy = useSpring(y, springs);

  const scale = useTransform(intent, [CURSOR_IDLE, CURSOR_LINK, CURSOR_TEXT], [1, 1.9, 0.5]);
  const borderWidth = useTransform(intent, [CURSOR_IDLE, CURSOR_LINK], ["1.5px", "1px"]);

  // A touch of speed-stretch is what stops the ring reading as a sticker.
  const velocity = useVelocity(sx);
  const stretch = useTransform(velocity, [-2400, 0, 2400], [1.25, 1, 1.25], { clamp: true });

  useEffect(() => {
    if (!pointerExtras) return;
    const root = document.documentElement;
    const show = () => {
      root.dataset.cursor = "on";
    };
    const hide = () => {
      root.dataset.cursor = "off";
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") hide();
    };

    show();
    window.addEventListener("pointermove", show, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", hide);
    return () => {
      delete root.dataset.cursor;
      window.removeEventListener("pointermove", show);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", hide);
    };
  }, [pointerExtras]);

  if (!pointerExtras) return null;

  return (
    <motion.div
      aria-hidden
      data-lens-omit
      className="peeps-cursor pointer-events-none fixed left-0 top-0 z-[60] size-[18px] rounded-full border-[color:var(--accent)] will-change-transform"
      style={{ x: sx, y: sy, scale, scaleX: stretch, borderWidth, translateX: "-50%", translateY: "-50%" }}
    />
  );
}
