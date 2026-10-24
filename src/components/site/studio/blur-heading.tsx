"use client";

import { Fragment, useRef } from "react";
import type { MotionValue } from "motion/react";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { clamp01 } from "@/lib/scroll-ranges";

/**
 * A heading that resolves out of a blur letter by letter, in a scattered order, as it rises
 * into view. Read whole by assistive tech; the letters are decoration. Under reduced motion,
 * or before hydration, it is simply the heading.
 */
export function BlurHeading({ text, id, className }: { text: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { mounted, reduced } = useMotionEnv();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.55"] });
  const live = mounted && !reduced;

  return (
    <h2 ref={ref} id={id} className={className}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, w) => (
        <Fragment key={w}>
          {w > 0 && " "}
          <span aria-hidden className="inline-block whitespace-nowrap">
            {[...word].map((ch, c) => (
              <Letter key={c} progress={scrollYProgress} order={(w * 7 + c * 5) % 11} live={live}>
                {ch}
              </Letter>
            ))}
          </span>
        </Fragment>
      ))}
    </h2>
  );
}

function Letter({
  progress,
  order,
  live,
  children,
}: {
  progress: MotionValue<number>;
  order: number;
  live: boolean;
  children: string;
}) {
  const start = clamp01(0.2 + order * 0.045);
  const end = clamp01(start + 0.3);
  const blur = useTransform(progress, [start, end], [12, 0], { clamp: true });
  const opacity = useTransform(progress, [start, end], [0.15, 1], { clamp: true });
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span className="inline-block" style={live ? { filter, opacity } : undefined}>
      {children}
    </motion.span>
  );
}
