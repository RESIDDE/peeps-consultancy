"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

const CHOSEN = new Set([13, 37, 52, 68, 86]);

/** 100 CVs collapse into 5 evidenced candidates. */
export function CvFunnel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const done = inView || reduce;

  return (
    <div ref={ref} className="grid grid-cols-10 gap-1.5 sm:gap-2" aria-label="100 CVs reduced to 5 qualified candidates" role="img">
      {Array.from({ length: 100 }, (_, i) => {
        const chosen = CHOSEN.has(i);
        return (
          <motion.span
            key={i}
            className="aspect-[3/4] rounded-[3px] sm:rounded-md"
            initial={false}
            animate={
              done
                ? chosen
                  ? { backgroundColor: "var(--gold)", scale: 1.15, opacity: 1 }
                  : { backgroundColor: "var(--muted-foreground)", scale: 0.85, opacity: 0.18 }
                : { backgroundColor: "var(--muted-foreground)", scale: 1, opacity: 0.45 }
            }
            transition={{ duration: 0.6, delay: reduce ? 0 : chosen ? 1.1 : (i % 10) * 0.03 + Math.floor(i / 10) * 0.04 }}
          />
        );
      })}
    </div>
  );
}
