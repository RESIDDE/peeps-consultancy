"use client";

import { useRef, useState } from "react";
import { ArrowDown, Check, CircleDot, Star } from "lucide-react";
import type { MotionValue } from "motion/react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { MotionNumber } from "@/components/motion/motion-number";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { crossFadeStops, fadeStops } from "@/lib/scroll-ranges";
import { STAGES, STAGE_META } from "@/lib/quality";
import { cn } from "@/lib/utils";

/**
 * What each rung visibly adds to the specimen card. One row per stage, in the
 * same order as STAGES, so the build mirrors the framework rather than decorating it.
 */
const ROWS = [
  { icon: CircleDot, text: "Profile submitted, consent recorded" },
  { icon: Check, text: "CV reviewed by a consultant" },
  { icon: Check, text: "Identity and qualifications verified" },
  { icon: Check, text: "Interviewed and skills assessed" },
  { icon: Check, text: "References checked, classification assigned" },
  { icon: Star, text: "Shortlisted against a live vacancy" },
  { icon: CircleDot, text: "Hired by a PEEPs client" },
] as const;

/** Scroll distance given to each rung. Enough to read a line before the next lands. */
const VH_PER_STAGE = 85;
const TOTAL = STAGES.length;
/** Half the cross-fade window between one rung and the next, as a fraction of total scroll. */
const FADE = 0.018;

/**
 * Scroll progress is a MotionValue from here down: every opacity and the percentage counter
 * are driven straight from it, so scrolling repaints without re-rendering React. The only
 * state is the active index, which exists purely so `aria-current` stays truthful.
 */
export function TheVetting() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { mounted, wide } = useMotionEnv();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const pct = useTransform(scrollYProgress, (p) => Math.min(Math.max(p, 0), 1) * 100);

  const stepRef = useRef(0);
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.min(TOTAL - 1, Math.max(0, Math.floor(p * TOTAL)));
    if (next === stepRef.current) return;
    stepRef.current = next;
    setStep(next);
  });

  // Reduced motion and phones get the whole ladder at once: same information, no pinning.
  if (reduced || (mounted && !wide)) return <VettingStatic />;

  return (
    <>
      <section
        ref={ref}
        id="vetting"
        data-chapter="The vetting"
        aria-labelledby="vetting-title"
        className="relative bg-muted/60"
        style={{ height: `${TOTAL * VH_PER_STAGE}vh` }}
      >
        <div className="sticky top-[4.5rem] flex h-[calc(100dvh-4.5rem)] flex-col overflow-hidden">
          <div className="container-page flex min-h-0 flex-1 flex-col pb-10 pt-8">
            {/* Chapter label and the progress counter, as in the reference */}
            <div className="flex items-start justify-between gap-6">
              <div className="font-mono text-xs leading-relaxed text-muted-foreground">
                <p id="vetting-title">The vetting</p>
                <p className="text-foreground">From a CV to a shortlist.</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-muted-foreground">Evidence recorded</p>
                <p aria-hidden className="font-mono text-5xl font-medium leading-none text-foreground/10 sm:text-7xl">
                  <MotionNumber value={pct} pad={3} />
                  <span className="text-3xl sm:text-4xl">%</span>
                </p>
              </div>
            </div>

            {/* The specimen card, gaining a layer per rung */}
            <div className="flex min-h-0 flex-1 items-center justify-center py-6">
              <SpecimenCard step={step} progress={scrollYProgress} />
            </div>

            {/* Which rung we are on */}
            <div className="flex items-end justify-between gap-6">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">
                  <span className="text-primary">{String(step + 1).padStart(2, "0")}</span>
                  <span className="mx-2">——</span>
                  {String(TOTAL).padStart(2, "0")}
                </p>
                <ol className="relative mt-2">
                  {STAGES.map((s, i) => (
                    <Caption key={s} stage={s} index={i} progress={scrollYProgress} active={i === step} />
                  ))}
                </ol>
              </div>
              <a
                href="#after-vetting"
                className="shrink-0 font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Skip the vetting <ArrowDown className="inline size-3.5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>
      <span id="after-vetting" className="block scroll-mt-20" />
    </>
  );
}

function Caption({
  stage,
  index,
  progress,
  active,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const opacity = useTransform(progress, crossFadeStops(index, TOTAL, FADE), [0, 1, 1, 0]);
  return (
    <motion.li
      aria-current={active ? "step" : undefined}
      style={{ opacity }}
      className={cn(index > 0 && "pointer-events-none absolute inset-0")}
    >
      <h2 className="font-display text-3xl font-medium sm:text-4xl">{STAGE_META[stage].label}.</h2>
      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
        {STAGE_META[stage].description}
      </p>
    </motion.li>
  );
}

function EvidenceRow({
  icon: Icon,
  text,
  index,
  progress,
}: {
  icon: typeof Check;
  text: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const stops = fadeStops(index / TOTAL, FADE);
  const opacity = useTransform(progress, stops, [0.25, 1], { clamp: true });
  const tick = useTransform(progress, stops, [0.35, 1], { clamp: true });
  return (
    <motion.li style={{ opacity }} className="flex items-start gap-2.5 text-sm">
      <motion.span style={{ opacity: tick }} className="mt-0.5 shrink-0 text-primary">
        <Icon className="size-4" aria-hidden />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
}

function SpecimenCard({ step, progress }: { step: number; progress: MotionValue<number> }) {
  const stage = STAGES[step];
  return (
    <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-xs text-muted-foreground">PEEP-ACC-000124</span>
        <span
          className="rounded-full px-2.5 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-wider text-white transition-colors duration-500"
          style={{ background: `var(--stage-${stage})` }}
        >
          {STAGE_META[stage].short}
        </span>
      </div>

      {/* Name: a redacted bar that resolves once the CV has been read */}
      <div className="mt-5 flex items-center gap-3">
        <span className="size-11 shrink-0 rounded-full bg-secondary" aria-hidden />
        <span className="min-w-0 flex-1">
          {step === 0 ? (
            <span aria-hidden className="block h-5 w-40 rounded bg-muted" />
          ) : (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display block truncate text-xl font-medium">
              Adaeze O.
            </motion.span>
          )}
          <span className="mt-1 block font-mono text-xs text-muted-foreground">Finance · Lagos</span>
        </span>
      </div>

      <ul className="mt-5 grid gap-2.5 border-t pt-5">
        {ROWS.map(({ icon, text }, i) => (
          <EvidenceRow key={text} icon={icon} text={text} index={i} progress={progress} />
        ))}
      </ul>
    </div>
  );
}

/** The same seven rungs, laid out plainly, for reduced motion. */
function VettingStatic() {
  return (
    <section id="vetting" data-chapter="The vetting" aria-labelledby="vetting-title-static" className="bg-muted/60 py-20 sm:py-28">
      <div className="container-page">
        <p className="font-mono text-xs text-muted-foreground">The vetting</p>
        <h2 id="vetting-title-static" className="font-display mt-2 text-balance text-3xl font-medium leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
          From a CV to a shortlist.
        </h2>
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (
            <li key={s} className="rounded-3xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="size-3 rounded-full" style={{ background: `var(--stage-${s})` }} aria-hidden />
                <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display mt-6 text-xl font-medium">{STAGE_META[s].label}.</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{STAGE_META[s].description}</p>
            </li>
          ))}
        </ol>
      </div>
      <span id="after-vetting" className="block scroll-mt-20" />
    </section>
  );
}
