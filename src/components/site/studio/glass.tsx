"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useDragControls,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { LensFace } from "@/components/motion/lens-face";
import { takeSnapshot } from "@/components/motion/page-snapshot";
import { CX, CY, R_GLASS, VIEW, Magnifier } from "./magnifier";

/** Width the glass settles at once it is lifted off the page. */
const SIZE = 380;
const ZOOM = 2.1;

// Rounded before it reaches the DOM. Division is deterministic across engines so this is
// not the hydration hazard the bezel trig was, but inline styles should not carry 15 digits.
const k = SIZE / VIEW;
const place = (n: number) => Math.round(n * 100) / 100;
const GLASS_X = place(CX * k);
const GLASS_Y = place(CY * k);
const GLASS_R = place(R_GLASS * k);
// Rounding the parts then subtracting reintroduces the error, so round the result too.
const WELL_LEFT = place(GLASS_X - GLASS_R);
const WELL_TOP = place(GLASS_Y - GLASS_R);
const WELL_SIZE = place(GLASS_R * 2);

/**
 * The glass as a physical object: press it, carry it anywhere, and the page magnifies
 * through its lens as it travels. Pressing swaps the copy sitting in the hero for a
 * free-floating one at the same spot, so the handover is invisible.
 *
 * The floating copy stays mounted and merely hidden. Motion can only begin a drag on an
 * element that already exists, so mounting it on press would cost the user the gesture they
 * are already making and they would have to press a second time to move it.
 */
export function DraggableGlass({ children }: { children: React.ReactNode }) {
  const anchor = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);
  const controls = useDragControls();

  const { scrollX, scrollY } = useScroll();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Lean into the direction of travel, and settle back when it stops.
  const tilt = useSpring(useTransform(useVelocity(x), [-2200, 0, 2200], [-16, 0, 16], { clamp: true }), {
    stiffness: 160,
    damping: 20,
  });

  // The magnified view is anchored to the glass itself, not to the pointer.
  const offsetX = useTransform(() => -(x.get() + GLASS_X + scrollX.get()));
  const offsetY = useTransform(() => -(y.get() + GLASS_Y + scrollY.get()));
  const inner = useMotionTemplate`translate(${GLASS_R}px, ${GLASS_R}px) scale(${ZOOM}) translate(${offsetX}px, ${offsetY}px)`;

  const lift = useCallback(
    (event: React.PointerEvent) => {
      const r = anchor.current?.getBoundingClientRect();
      if (!r) return;
      // Start life exactly where the hero copy stood, centred on the same glass.
      x.set(r.left + (r.width * CX) / VIEW - GLASS_X);
      y.set(r.top + (r.height * CY) / VIEW - GLASS_Y);
      takeSnapshot(host.current);
      setHeld(true);
      controls.start(event);
    },
    [x, y, controls],
  );

  // A snapshot goes stale when the page moves beneath it.
  useEffect(() => {
    if (!held) return;
    let settle: number | undefined;
    const refresh = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => takeSnapshot(host.current), 120);
    };
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, [held]);

  useEffect(() => {
    document.documentElement.classList.toggle("lens-held", held);
    return () => document.documentElement.classList.remove("lens-held");
  }, [held]);

  return (
    <>
      {/* The copy that lives in the hero. Hidden rather than unmounted, so the slot keeps its size. */}
      <div
        ref={anchor}
        data-no-lens
        className="cursor-grab transition-opacity duration-200"
        style={{ opacity: held ? 0 : 1 }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0 || held) return;
          e.preventDefault();
          lift(e);
        }}
      >
        {children}
      </div>

      <motion.div
        data-lens-root
        data-no-lens
        drag
        dragListener={false}
        dragControls={controls}
        dragMomentum
        dragElastic={0.1}
        dragTransition={{ power: 0.2, timeConstant: 340, bounceStiffness: 260, bounceDamping: 26 }}
        onDragEnd={() => takeSnapshot(host.current)}
        whileDrag={{ scale: 1.04 }}
        style={{
          x,
          y,
          rotate: tilt,
          width: SIZE,
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 75,
          cursor: "grabbing",
          opacity: held ? 1 : 0,
          pointerEvents: held ? "auto" : "none",
          willChange: "transform",
        }}
        className="origin-center touch-none transition-opacity duration-200"
      >
        {/* The magnified page, clipped to the real glass rather than to an arbitrary circle */}
        <div
          aria-hidden
          className="lens-well"
          style={{ left: WELL_LEFT, top: WELL_TOP, width: WELL_SIZE, height: WELL_SIZE }}
        >
          <motion.div ref={host} className="lens-inner" style={{ transform: inner }} />
          {/* No rim graduations here: the drawn bezel already carries its own. */}
          <LensFace x={x} y={y} radius={GLASS_R} ticks={false} />
          <span className="lens-glare" />
        </div>
        <Magnifier />
      </motion.div>
    </>
  );
}
