"use client";

import { useRef } from "react";
import type { MotionValue } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { COMPANY } from "@/lib/content";
import { CtaLine } from "./cta-line";

/** The first clause of the positioning line, which is the whole proposition. */
const STATEMENT = "PEEPs connects organisations with verified, assessed and professionally prepared talent.";
const WORDS = STATEMENT.split(" ");

/** How far a word still to come is dimmed. Present enough to read ahead, faint enough to wait. */
const DIM = 0.12;

/**
 * The proposition at headline size, brightening a word at a time as it scrolls up the
 * screen. Sits over the dark run that starts with the hero, with no background of its own,
 * so the glass travelling out of the hero stays visible behind it.
 */
export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { mounted, reduced } = useMotionEnv();
  const live = mounted && !reduced;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });

  return (
    <section id="about" className="relative z-10 pb-24 pt-32 md:pb-36 md:pt-48">
      <div className="shell lg:pl-[calc(var(--shell)+8.33%)]">
        <h2 className="sr-only">About PEEPs</h2>
        <p ref={ref} className="headline max-w-[19ch]">
          <span className="sr-only">{STATEMENT}</span>
          {WORDS.map((word, i) => (
            <Word key={i} progress={scrollYProgress} index={i} live={live}>
              {word}
            </Word>
          ))}
        </p>
      </div>

      <div className="shell mt-20 md:mt-32 lg:pl-[calc(var(--shell)+8.33%)]">
        {/* The rule, with a crosshair where the right-hand column begins. */}
        <div className="relative hairline">
          <span aria-hidden className="absolute -top-[7px] left-[60%] hidden size-[13px] lg:block">
            <span className="absolute left-1/2 top-0 h-full w-px bg-foreground/70" />
            <span className="absolute left-0 top-1/2 h-px w-full bg-foreground/70" />
          </span>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-[60%_1fr]">
          <p className="label">
            {COMPANY.tagline.split(". ").map((part, i, all) => (
              <span key={part} className="block">
                {part}
                {i < all.length - 1 ? "." : ""}
              </span>
            ))}
          </p>
          <div className="max-w-[34ch]">
            <p className="text-[0.95rem] leading-snug">
              We help employers hire on evidence, not on CVs. Every candidate arrives with an assessment report, so
              identity, qualifications, history and readiness are recorded rather than asserted.
            </p>
            <CtaLine href="/about" className="mt-14">
              More about us
            </CtaLine>
          </div>
        </div>
      </div>
    </section>
  );
}

function Word({
  progress,
  index,
  live,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  live: boolean;
  children: string;
}) {
  // Each word owns an equal slice of the scroll, and brightens across it.
  const from = index / WORDS.length;
  const to = (index + 1) / WORDS.length;
  const opacity = useTransform(progress, [from, to], [DIM, 1], { clamp: true });
  return (
    <>
      <motion.span aria-hidden style={live ? { opacity } : undefined}>
        {children}
      </motion.span>{" "}
    </>
  );
}
