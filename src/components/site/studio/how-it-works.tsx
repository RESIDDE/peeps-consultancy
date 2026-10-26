"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EMPLOYER_PROCESS } from "@/lib/content";
import { cn } from "@/lib/utils";
import { BlurHeading } from "./blur-heading";
import { MarkRule } from "./page-kit";
import { CtaLine } from "./cta-line";

const pad = (n: number) => String(n).padStart(2, "0");

/** The three stretches of an engagement, by step: the brief, the search, the shortlist. */
const phaseOf = (i: number) => (i < 2 ? "Brief" : i < 4 ? "Search & screen" : "Shortlist & hire");

/** Whose move a step is, in its own words: the steps that begin "You…" are the employer's. */
const isYours = (body: string) => /^You\b/.test(body);

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * How it works, laid out as a set of stories: the steps of an engagement listed down the
 * left, the chosen one told at size on the right, with arrows to walk through them in
 * order. Every word is the employers page's own.
 */
export function HowItWorks() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const step = EMPLOYER_PROCESS[active];
  const count = EMPLOYER_PROCESS.length;
  const go = (dir: 1 | -1) => setActive((i) => (i + dir + count) % count);

  return (
    <section aria-labelledby="hiw-title" className="pb-24 pt-32 md:pb-32 md:pt-44">
      <div className="shell grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-x-14">
        <BlurHeading id="hiw-title" text="How it works" className="headline lg:pl-[calc((100vw-2*var(--shell))/12)]" />
        <p className="max-w-[24ch] text-[0.95rem] leading-snug">
          One vacancy in, five evidenced names out. These are the steps between them.
        </p>
      </div>

      <MarkRule className="mt-20 w-[60%] md:mt-24" mark="plus" />

      <div className="shell mt-16 grid gap-14 md:mt-20 lg:grid-cols-2">
        <ol className="lg:pl-[calc((100vw-2*var(--shell))/12)]">
          {EMPLOYER_PROCESS.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={on ? "step" : undefined}
                  className={cn(
                    "label flex items-center gap-4 py-1.5 text-left transition-colors duration-300",
                    on ? "text-foreground" : "text-foreground/35 hover:text-foreground/70",
                  )}
                >
                  {s.title}
                  {on && <ArrowRight className="size-3.5" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ol>

        <div aria-live="polite" className="min-h-[19rem]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(6px)" }}
              transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE }}
            >
              <p className="subhead max-w-[22ch] text-[clamp(1.75rem,2.6vw,2.4rem)] text-balance">{step.body}</p>

              <div className="mt-14 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <span
                    aria-hidden
                    className="grid size-[4.5rem] shrink-0 place-items-center rounded-[4px] bg-foreground font-display text-3xl tracking-[-0.06em] text-background"
                  >
                    {pad(active + 1)}
                  </span>
                  <div className="text-[1.05rem] leading-snug">
                    <p>{step.title}</p>
                    <p className="text-muted-foreground">
                      {phaseOf(active)} · Step {active + 1} of {count}
                    </p>
                  </div>
                </div>
                <p className="label">{isYours(step.body) ? "◇ Your move" : "◆ Our move"}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="shell mt-16 grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-x-14">
        <div className="flex lg:pl-[calc((100vw-2*var(--shell))/12)]">
          <SquareButton label="Previous step" onClick={() => go(-1)}>
            <ArrowLeft className="size-4" aria-hidden />
          </SquareButton>
          <SquareButton label="Next step" onClick={() => go(1)} className="-ml-px">
            <ArrowRight className="size-4" aria-hidden />
          </SquareButton>
        </div>
        <div>
          <CtaLine href="/employers#request">Request talent</CtaLine>
        </div>
      </div>

      <MarkRule className="mt-28 w-[80%]" mark="cross" />
    </section>
  );
}

function SquareButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-[4.5rem] items-end justify-start border border-border p-4 transition-colors duration-300 hover:bg-foreground hover:text-background active:scale-[0.97]",
        className,
      )}
    >
      {children}
    </button>
  );
}
