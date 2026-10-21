"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";

/**
 * The graduated rules down both edges. Values are viewport pixels from the top, so the
 * numbers stay true and never update on scroll.
 *
 * Scrolling pushes a swell along them: the ticks nearest the bulge grow and brighten, and
 * the bulge leads the direction of travel. Each tick works out its own distance from the
 * bulge in CSS, so the whole rail is driven by two custom properties and no React work.
 */
/** Inline styles here carry custom properties, which React's own type does not describe. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

const MINOR = 8;
const MAJOR = 64;
const HEIGHT = 1600;

function Rule({ side }: { side: "left" | "right" }) {
  const ticks = Array.from({ length: Math.floor(HEIGHT / MINOR) + 1 }, (_, i) => i * MINOR);
  const edge = side === "left" ? { left: 0 } : { right: 0 };

  return (
    <div
      aria-hidden
      data-lens-omit
      className="scale-rule pointer-events-none fixed top-0 z-30 hidden h-dvh w-16 select-none overflow-hidden lg:block"
      style={edge}
    >
      {ticks.map((y) => {
        const major = y % MAJOR === 0 && y > 0;
        return (
          <div key={y} className="absolute" style={{ top: y, ...edge, "--i": y } as Vars}>
            <span className="scale-tick" style={{ ...edge, "--w": major ? 10 : 5 } as Vars} />
            {/* Only the left rule is numbered: two columns of figures either side of the
                page would read as data rather than as a measure. */}
            {major && side === "left" && <span className="scale-label">{y}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function ScaleRail() {
  const { reduced } = useMotionEnv();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  // Height of the viewport, so the bulge can be placed in the same pixel space as the ticks.
  const vh = useMotionValue(800);
  useEffect(() => {
    const measure = () => vh.set(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [vh]);

  // Amplitude follows how fast the page is moving, sprung so it swells in and settles out.
  // A floor keeps a gentle swell present at rest rather than a dead straight rule.
  const speed = useSpring(
    useTransform(velocity, (v) => Math.min(1, Math.abs(v) / 1400)),
    { stiffness: 190, damping: 28 },
  );
  const bulge = useTransform(speed, (v) => (reduced ? 0 : 0.2 + 0.8 * v));

  // The swell leads the direction of travel: down the rule when scrolling down, and back up
  // when scrolling up, settling to the middle when the page stops.
  const lead = useSpring(
    useTransform(velocity, (v) => 0.5 + Math.max(-0.24, Math.min(0.24, v / 4200))),
    { stiffness: 120, damping: 26 },
  );
  const at = useTransform(() => vh.get() * lead.get());

  return (
    <motion.div style={{ "--bulge": bulge, "--bulge-at": at } as unknown as Vars}>
      <Rule side="left" />
      <Rule side="right" />
    </motion.div>
  );
}
