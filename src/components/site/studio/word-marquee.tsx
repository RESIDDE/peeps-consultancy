"use client";

import { Fragment, useRef } from "react";
import { Plus } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";

/** The four words of the tagline, which are also the four things done to every candidate. */
const WORDS = ["Identified", "Screened", "Assessed", "Prepared"];

/**
 * The tagline at its largest, drifting sideways as the page scrolls past rather than on a
 * timer, so it moves only while the reader does. Twice over, so the row never runs short.
 */
export function WordMarquee() {
  const ref = useRef<HTMLElement>(null);
  const { mounted, reduced } = useMotionEnv();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-46%"], { clamp: true });

  return (
    <section ref={ref} aria-label="Identified, screened, assessed, prepared" className="relative z-10 overflow-hidden pb-28 pt-12 md:pb-40">
      <p className="label shell">
        Recorded,
        <br />
        not asserted.
      </p>

      <motion.div
        aria-hidden
        style={mounted && !reduced ? { x } : undefined}
        className="mega mt-16 flex w-max items-center gap-[0.35em] whitespace-nowrap md:mt-28"
      >
        {[...WORDS, ...WORDS].map((word, i) => (
          <Fragment key={i}>
            <Plus className="size-[0.42em] shrink-0" strokeWidth={0.6} />
            <span>{word}</span>
          </Fragment>
        ))}
      </motion.div>

      <p className="label mt-16 text-center md:mt-28">✦ From one vacancy to one hire.</p>
    </section>
  );
}
