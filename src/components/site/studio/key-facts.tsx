"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { ArtCanvas } from "@/components/ui/glass-folder-cards";
import { VERTICALS } from "@/lib/content";
import { CHECK_META, STAGES } from "@/lib/quality";
import { clamp01 } from "@/lib/scroll-ranges";
import { cn } from "@/lib/utils";

/** Inline styles here carry custom properties, which React's own type does not describe. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

const pad = (n: number) => String(n).padStart(2, "0");

/** Every figure is one the site already states; nothing here is a new claim. */
const FACTS = [
  {
    label: "Quality stages",
    value: pad(STAGES.length),
    note: "Each one unlocked only by recorded evidence.",
    look: "art",
  },
  {
    label: "Verification checks",
    value: pad(Object.keys(CHECK_META).length),
    note: "Recorded for every candidate, from identity to references.",
    look: "light",
  },
  {
    label: "Per shortlist",
    value: "~5",
    note: "Qualified, evidenced candidates. Not a hundred CVs.",
    look: "dark",
  },
  {
    label: "Fees to candidates",
    value: "00",
    note: "Employers pay for recruitment. Candidates never pay placement fees.",
    look: "light",
  },
] as const;

/**
 * Key facts: four cards that tip up into place as they scroll in, their figures rolling over
 * like an odometer. Followed by the sectors, set as a strip where a studio would put its
 * partners' logos.
 */
export function KeyFacts() {
  const grid = useRef<HTMLUListElement>(null);
  const { scrollChoreography: live } = useMotionEnv();
  const { scrollYProgress } = useScroll({ target: grid, offset: ["start end", "start 0.35"] });

  return (
    <section className="py-28 md:py-44">
      <div className="shell text-center">
        <h2 className="headline">Key facts</h2>
        <p className="mx-auto mt-6 max-w-[22ch] text-[0.95rem] leading-snug">A snapshot of how every shortlist is made.</p>
      </div>

      <ul
        ref={grid}
        className="shell mx-auto mt-20 grid max-w-[82rem] gap-5 perspective-[1400px] sm:grid-cols-2 md:mt-28 xl:grid-cols-4"
      >
        {FACTS.map((fact, i) => (
          <FactCard key={fact.label} fact={fact} index={i} progress={scrollYProgress} live={live} />
        ))}
      </ul>

      <div className="shell mt-28 text-center md:mt-36">
        <p className="label">Sectors we recruit for</p>
        <ul className="mt-8 flex flex-wrap justify-center">
          {VERTICALS.map((v) => (
            <li
              key={v.slug}
              className="border-border px-6 py-2 font-display text-xl tracking-[-0.04em] md:px-9 md:not-last:border-r md:text-2xl"
            >
              {v.name}
              {!v.launch && <span className="label ml-2 align-super text-[0.6rem] text-muted-foreground">Soon</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FactCard({
  fact,
  index,
  progress,
  live,
}: {
  fact: (typeof FACTS)[number];
  index: number;
  progress: MotionValue<number>;
  live: boolean;
}) {
  // Each card starts a beat after the one before it, laid back on its bottom edge.
  const from = clamp01(index * 0.1);
  const to = clamp01(0.6 + index * 0.1);
  const rotateX = useTransform(progress, [from, to], [55, 0], { clamp: true });
  const y = useTransform(progress, [from, to], [140, 0], { clamp: true });
  const opacity = useTransform(progress, [from, to], [0.2, 1], { clamp: true });

  const onDark = fact.look !== "light";
  return (
    <motion.li
      style={live ? { rotateX, y, opacity, transformOrigin: "50% 100%" } : undefined}
      className={cn(
        "relative isolate flex aspect-[356/439] flex-col justify-between overflow-hidden rounded-[7px] p-6",
        fact.look === "light" && "bg-white/55 text-[#3a3a3a]",
        fact.look === "dark" && "bg-[#232326] text-[#d8d8d8]",
        fact.look === "art" && "bg-[#232326] text-white",
      )}
    >
      {fact.look === "art" && (
        <>
          <ArtCanvas art="ember" seed={11} w={356} h={439} density={1} priority={0} className="absolute inset-0 -z-10 h-full! w-full!" />
          <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-black/10 via-black/20 to-black/70" />
        </>
      )}
      <p className="label">{fact.label}</p>
      <div>
        <p className="font-display text-[clamp(4.5rem,7vw,6.5rem)] tracking-[-0.06em]">
          <Odometer value={fact.value} />
        </p>
        <p className={cn("mt-5 max-w-[24ch] text-[0.9rem] leading-snug", onDark ? "text-white/70" : "text-[#5c5c60]")}>
          {fact.note}
        </p>
      </div>
    </motion.li>
  );
}

/**
 * Figures that roll into place the first time they come into view. Each digit is a column of
 * 0–9 slid to its value; non-digits are set as they are.
 *
 * The rendered state is the final one, so the server, a reader without JavaScript and reduced
 * motion all see the right number. Only a figure still below the fold is wound back to zero,
 * straight on the DOM, and released when it arrives. Already on screen, it is left alone.
 */
function Odometer({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionEnv();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.dataset.phase = "armed";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        delete el.dataset.phase;
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <span ref={ref} className="odometer inline-flex leading-[0.92]">
      <span className="sr-only">{value.replace("~", "about ")}</span>
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="inline-block h-[0.92em] overflow-hidden">
            <span className="odo-col flex flex-col" style={{ "--d": Number(ch), "--i": i } as Vars}>
              {Array.from({ length: 10 }, (_, n) => (
                <span key={n} className="block h-[0.92em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
