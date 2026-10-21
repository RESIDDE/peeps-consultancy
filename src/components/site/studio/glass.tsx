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
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { CX, CY, R_GLASS, VIEW, Magnifier } from "./magnifier";

const ZOOM = 2.1;

/** Width the glass settles at once lifted. A 380px object swamps a phone. */
const SIZE_WIDE = 380;
const SIZE_NARROW = 240;

// Rounded before it reaches the DOM. Division is deterministic across engines so this is
// not the hydration hazard the bezel trig was, but inline styles should not carry 15 digits.
const place = (n: number) => Math.round(n * 100) / 100;

/** Where the drawn glass's lens sits, for whatever width the object is rendered at. */
function geometry(size: number) {
  const k = size / VIEW;
  const x = place(CX * k);
  const y = place(CY * k);
  const r = place(R_GLASS * k);
  // Rounding the parts then subtracting reintroduces the error, so round the result too.
  return { size, x, y, r, wellLeft: place(x - r), wellTop: place(y - r), wellSize: place(r * 2) };
}

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
  const { wide } = useMotionEnv();
  const g = geometry(wide ? SIZE_WIDE : SIZE_NARROW);

  const { scrollX, scrollY } = useScroll();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Lean into the direction of travel, and settle back when it stops.
  const tilt = useSpring(useTransform(useVelocity(x), [-2200, 0, 2200], [-16, 0, 16], { clamp: true }), {
    stiffness: 160,
    damping: 20,
  });

  // The magnified view is anchored to the glass itself, not to the pointer.
  const offsetX = useTransform(() => -(x.get() + g.x + scrollX.get()));
  const offsetY = useTransform(() => -(y.get() + g.y + scrollY.get()));
  const inner = useMotionTemplate`translate(${g.r}px, ${g.r}px) scale(${ZOOM}) translate(${offsetX}px, ${offsetY}px)`;

  const lift = useCallback(
    (event: React.PointerEvent) => {
      const r = anchor.current?.getBoundingClientRect();
      if (!r) return;
      // Start life exactly where the hero copy stood, centred on the same glass.
      x.set(r.left + (r.width * CX) / VIEW - g.x);
      y.set(r.top + (r.height * CY) / VIEW - g.y);
      takeSnapshot(host.current);
      setHeld(true);
      controls.start(event);
    },
    [x, y, controls, g.x, g.y],
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

  useEffect(() => {
    if (!held) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setHeld(false);
    const drop = () => setHeld(false);
    // On the window, not the element: if pointer capture never established, the release
    // would land on the anchor instead and the glass would stay lifted with no way down.
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);
    window.addEventListener("blur", drop);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", drop);
      window.removeEventListener("blur", drop);
      window.removeEventListener("keydown", onKey);
    };
  }, [held]);

  return (
    <>
      {/* The copy that lives in the hero. Hidden rather than unmounted, so the slot keeps its size. */}
      <div
        ref={anchor}
        data-no-lens
        data-lens-omit
        className="cursor-grab transition-opacity duration-200"
        style={{ opacity: held ? 0 : 1 }}
        onPointerDown={(e) => {
          // Mouse only. A finger that presses here is scrolling or using the lens, and
          // preventDefault would take that gesture away.
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
        dragMomentum={false}
        onDragEnd={() => setHeld(false)}
        whileDrag={{ scale: 1.04 }}
        style={{
          x,
          y,
          rotate: tilt,
          width: g.size,
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
          style={{ left: g.wellLeft, top: g.wellTop, width: g.wellSize, height: g.wellSize }}
        >
          <motion.div ref={host} className="lens-inner" style={{ transform: inner }} />
          {/* No rim graduations here: the drawn bezel already carries its own. */}
          <LensFace x={x} y={y} radius={g.r} ticks={false} />
          <span className="lens-glare" />
        </div>
        <Magnifier />
      </motion.div>
    </>
  );
}
