"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { MotionValue } from "motion/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { ArtCanvas, type ArtRecipe } from "@/components/ui/glass-folder-cards";
import { DIVISIONS } from "@/lib/content";
import { clamp01 } from "@/lib/scroll-ranges";
import { cn } from "@/lib/utils";
import { CtaLine } from "./cta-line";
import { REVEAL_VW } from "./sector-gallery";

/** The division names without the shared prefix: Talent, Academy, Professional, Workforce. */
const NAMES = DIVISIONS.map((d) => d.name.replace(/^PEEPs\s+/, ""));

/** Basalt: near-black folded through slate, for the slab the names break away from. */
const STONE: ArtRecipe = {
  style: "marble",
  colors: ["#08080a", "#1c1c20", "#3a3a40", "#6a6a70", "#26262b", "#111114"],
  scale: 1.3,
  warp: 1.9,
  gloss: 0.12,
  veins: 0.65,
};

/** A small seeded generator, so every letter has its own flight and it is the same each visit. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seeded(4204);
const FLIGHTS = NAMES.map((name) =>
  [...name].map(() => ({
    x: (rand() - 0.5) * 120,
    y: (rand() - 0.5) * 100,
    rotate: (rand() - 0.5) * 240,
    scale: 0.6 + rand() * 1.4,
    delay: rand() * 0.06,
  })),
);

/** Where each phase of the pin happens, as fractions of its scroll after the reveal. */
const DARKEN = [0, 0.1] as const;
const SCATTER = [0.13, 0.35] as const;
const SLAB = [0.19, 0.39] as const;
const PANELS_FROM = 0.37;
const PANEL_STEP = 0.13;
const PANEL_SPAN = 0.32;

/** The same faint haze as `.tone-dark.haze`, faded in with the dark. */
const HAZE =
  "radial-gradient(60% 45% at 20% 30%, rgb(255 255 255 / 0.045), transparent 70%), radial-gradient(50% 40% at 85% 75%, rgb(255 255 255 / 0.035), transparent 70%)";

/**
 * What we do, as a pinned sequence. It pins early, underneath the sector strip, so that strip
 * slides off it: the four division names wait there stacked, black on white. The frame then
 * darkens, the names break apart letter by letter, a slab rises where they stood, and the four
 * divisions float up past it as panels. Without choreography it is the names over a grid.
 */
export function DivisionsStack() {
  const ref = useRef<HTMLElement>(null);
  const after = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const { scrollChoreography: live } = useMotionEnv();
  // Progress runs over the stretch after the reveal; the reveal itself holds the opening frame.
  const { scrollYProgress } = useScroll({ target: after, offset: ["start start", "end end"] });
  const background = useTransform(scrollYProgress, [...DARKEN], ["#ffffff", "#0b0c0f"], { clamp: true });
  const color = useTransform(scrollYProgress, [...DARKEN], ["#1b1b1d", "#d8d8d8"], { clamp: true });
  const haze = useTransform(scrollYProgress, [...DARKEN], [0, 1], { clamp: true });

  // The nav reads its colours off the nearest data-tone, so the frame keeps its own current.
  useEffect(() => {
    const el = frame.current;
    if (!live || !el) return;
    const write = (p: number) => {
      const tone = p < (DARKEN[0] + DARKEN[1]) / 2 ? "light" : "dark";
      if (el.dataset.tone !== tone) el.dataset.tone = tone;
    };
    write(scrollYProgress.get());
    return scrollYProgress.on("change", write);
  }, [live, scrollYProgress]);

  if (!live) {
    return (
      <section ref={ref} aria-labelledby="divisions-title" className="py-24 md:py-32">
        {/* The scroll target is still attached, so the hook above has something to measure. */}
        <div ref={after}>
          <p id="divisions-title" className="label text-center">
            What we do
          </p>
          <h2 className="mega mt-10 text-center">
            {NAMES.map((n) => (
              <span key={n} className="block">
                {n}
              </span>
            ))}
          </h2>
          <ul className="shell mt-16 grid gap-4 md:grid-cols-2">
            {DIVISIONS.map((d, i) => (
              <li key={d.slug}>
                <Panel division={d} index={i} />
              </li>
            ))}
          </ul>
          <Footer className="mt-16" />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      aria-labelledby="divisions-title"
      className="relative"
      // Pulled up under the end of the sector strip, so it is already pinned as the strip leaves.
      style={{ height: `calc(460svh + ${REVEAL_VW}vw)`, marginTop: `calc(-100svh - ${REVEAL_VW}vw)` }}
    >
      <div ref={after} aria-hidden className="absolute inset-x-0 bottom-0" style={{ top: `${REVEAL_VW}vw` }} />
      <motion.div
        ref={frame}
        data-tone="light"
        style={{ backgroundColor: background, color }}
        className="sticky top-0 flex h-svh flex-col overflow-hidden"
      >
        <motion.span aria-hidden style={{ opacity: haze, backgroundImage: HAZE }} className="pointer-events-none absolute inset-0" />
        <p id="divisions-title" className="label relative pt-[6.5rem] text-center">
          What we do
        </p>

        <div className="relative flex-1">
          <Slab progress={scrollYProgress} />

          <h2 className="mega absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="sr-only">{NAMES.join(", ")}</span>
            {NAMES.map((name, w) => (
              <span key={name} aria-hidden className="block whitespace-nowrap">
                {[...name].map((ch, c) => (
                  <Shard key={c} progress={scrollYProgress} flight={FLIGHTS[w][c]}>
                    {ch}
                  </Shard>
                ))}
              </span>
            ))}
          </h2>

          <ul className="absolute inset-0">
            {DIVISIONS.map((d, i) => (
              <FloatingPanel key={d.slug} progress={scrollYProgress} index={i}>
                <Panel division={d} index={i} />
              </FloatingPanel>
            ))}
          </ul>
        </div>

        <Footer className="pb-8" />
      </motion.div>
    </section>
  );
}

function Footer({ className }: { className?: string }) {
  return (
    <div className={cn("shell relative z-10 grid items-end gap-6 md:grid-cols-3", className)}>
      <span className="hidden md:block" />
      <p className="label text-center">✦ Four divisions. One standard of evidence.</p>
      <div className="justify-self-center md:justify-self-end">
        <CtaLine href="/services">View services</CtaLine>
      </div>
    </div>
  );
}

/** One letter of the stacked names, flying off on its own path as the scatter runs. */
function Shard({
  progress,
  flight,
  children,
}: {
  progress: MotionValue<number>;
  flight: (typeof FLIGHTS)[number][number];
  children: string;
}) {
  const from = clamp01(SCATTER[0] + flight.delay);
  const to = clamp01(SCATTER[1] + flight.delay);
  const x = useTransform(progress, [from, to], ["0vw", `${flight.x}vw`], { clamp: true });
  const y = useTransform(progress, [from, to], ["0vh", `${flight.y}vh`], { clamp: true });
  const rotate = useTransform(progress, [from, to], [0, flight.rotate], { clamp: true });
  const scale = useTransform(progress, [from, to], [1, flight.scale], { clamp: true });
  const opacity = useTransform(progress, [clamp01(from + (to - from) * 0.45), to], [1, 0], { clamp: true });
  return (
    <motion.span className="pointer-events-none inline-block" style={{ x, y, rotate, scale, opacity }}>
      {children}
    </motion.span>
  );
}

/** The slab: a block of generated basalt with the wordmark cut into its face. */
function Slab({ progress }: { progress: MotionValue<number> }) {
  const scale = useTransform(progress, [SLAB[0], SLAB[1]], [0.72, 1], { clamp: true });
  const opacity = useTransform(progress, [SLAB[0], SLAB[1]], [0, 1], { clamp: true });
  const rotate = useTransform(progress, [SLAB[0], 1], [-8, 4], { clamp: true });
  return (
    <motion.div
      aria-hidden
      style={{ scale, opacity, rotate }}
      className="absolute left-1/2 top-1/2 size-[min(32rem,52svh)] -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative size-full overflow-hidden rounded-[10px] shadow-[0_50px_90px_-30px_rgb(0_0_0/0.9)]">
        <ArtCanvas art={STONE} seed={9} w={512} h={512} density={1} priority={0} className="absolute inset-0 h-full! w-full!" />
        <span className="absolute inset-0 bg-[radial-gradient(80%_70%_at_30%_25%,rgb(255_255_255/0.12),transparent_60%)]" />
        <span
          className="peeps-wordmark absolute left-1/2 top-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 text-[#060607]/80"
          style={{ filter: "drop-shadow(0 1.5px 0 rgb(255 255 255 / 0.16)) drop-shadow(0 -1px 0 rgb(0 0 0 / 0.7))" }}
        />
      </div>
    </motion.div>
  );
}

/** A division panel drifting up through the frame on its own stretch of the scroll. */
function FloatingPanel({
  progress,
  index,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  children: React.ReactNode;
}) {
  const from = clamp01(PANELS_FROM + index * PANEL_STEP);
  const to = clamp01(from + PANEL_SPAN);
  const y = useTransform(progress, [from, to], ["75svh", "-75svh"], { clamp: true });
  const opacity = useTransform(progress, [from, clamp01(from + 0.04), clamp01(to - 0.04), to], [0, 1, 1, 0], {
    clamp: true,
  });
  return (
    <motion.li
      style={{ y, opacity }}
      className={cn(
        "absolute top-1/2 w-[min(28rem,36vw)] -translate-y-1/2",
        index % 2 === 0 ? "left-[var(--shell)] xl:left-[6vw]" : "right-[var(--shell)] xl:right-[6vw]",
      )}
    >
      {children}
    </motion.li>
  );
}

function Panel({ division: d, index }: { division: (typeof DIVISIONS)[number]; index: number }) {
  return (
    <Link
      href={`/services/${d.slug}`}
      className="group block rounded-[7px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.07] md:p-8"
    >
      <div className="flex items-start justify-between gap-6">
        <h3 className="subhead text-white">{d.name}</h3>
        <Glyph index={index} />
      </div>
      <p className="mt-14 max-w-[32ch] text-[0.95rem] leading-snug text-muted-foreground">{d.summary}</p>
      <p className="label mt-8 flex items-center gap-2 text-white">
        {d.services.length} services
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </p>
    </Link>
  );
}

/** Line marks, one per division, in the manner of an engraved emblem. */
function Glyph({ index }: { index: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" as const };
  return (
    <svg aria-hidden viewBox="0 0 64 64" className="size-14 shrink-0 text-white/60">
      {index === 0 && [8, 15, 22, 29].map((r) => <circle key={r} cx="32" cy="32" r={r} {...common} />)}
      {index === 1 && [10, 20, 30, 40, 50].map((y) => <path key={y} d={`M8 ${y + 6} Q32 ${y - 8} 56 ${y + 6}`} {...common} />)}
      {index === 2 && [10, 18, 26, 34, 42, 50].map((x, i) => <path key={x} d={`M${x} ${56 - i * 6}V56`} {...common} />)}
      {index === 3 && [12, 20, 28, 36, 44, 52].map((y, i) => <path key={y} d={`M${8 + (i % 2) * 8} ${y}H${56 - (i % 3) * 6}`} {...common} />)}
    </svg>
  );
}
