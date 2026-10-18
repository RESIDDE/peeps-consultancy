"use client";

import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useActiveChapter } from "./interaction-provider";

/**
 * The chapter name that sits above the page once you have scrolled past the top.
 * Decorative: every section it names already carries its own visible heading.
 */
export function ChapterIndicator() {
  const chapter = useActiveChapter();
  const { scrollY } = useScroll();

  // A threshold plus a spring, rather than useTransform over a pixel range. A transform chained
  // straight off useScroll can be handed to the Web Animations API with its input range as
  // keyframe offsets, and WAAPI only accepts offsets inside [0,1] — pixel stops throw.
  const target = useMotionValue(0);
  const opacity = useSpring(target, { stiffness: 260, damping: 40 });
  useMotionValueEvent(scrollY, "change", (v) => target.set(v > 120 ? 1 : 0));

  return (
    <motion.div
      aria-hidden
      data-lens-omit
      style={{ opacity }}
      className="pointer-events-none fixed inset-x-0 top-0 z-30 hidden h-16 items-center justify-center lg:flex"
    >
      <span className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span className="h-px w-10 bg-xray" />
        {chapter ?? ""}
      </span>
    </motion.div>
  );
}
