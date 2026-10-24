"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MotionValue } from "motion/react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { ArtCanvas, type ArtPreset } from "@/components/ui/glass-folder-cards";
import { STAGES, STAGE_META, type Stage } from "@/lib/quality";
import { cn } from "@/lib/utils";
import { CtaLine } from "./cta-line";

const spell = (n: number) => ["None", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"][n] ?? String(n);

type Look = "paper" | "ink" | ArtPreset;

/** One card per stage, then one that leads on to the method. The looks alternate so the run
 *  reads as a set of different pieces of work, not one card repeated. */
const CARDS: ({ kind: "stage"; stage: Stage; index: number } | { kind: "method" })[] = [
  ...STAGES.map((stage, index) => ({ kind: "stage" as const, stage, index })),
  { kind: "method" },
];
const LOOKS: Look[] = ["paper", "ember", "ink", "glacier", "paper", "dusk", "aurora", "ink"];

/** The ring carries the set twice over, so its band never runs out of cards. */
const RING = [...CARDS.keys(), ...CARDS.keys()];
const STEP = 360 / RING.length;
const COLS = 4;
const GAP = 16;

/** The section is pinned for this long; its first viewport is the approach. */
const HEIGHT_SVH = 760;
const PIN_START = 100 / HEIGHT_SVH;

/**
 * The ring's flight through the pin. It is a carousel whose cards face its centre, so only the
 * far wall ever faces the camera: a band of cards, never a hoop around the viewer. It rises from
 * the lower left as an arch seen from above, swings in until the band fills the frame and spins
 * past, then tips back and leaves through the top right.
 *
 * x and y are fractions of the viewport, z is pixels toward the camera, angles are degrees.
 */
type Key = { p: number; x: number; y: number; z: number; rx: number; rz: number; spin: number; o: number };
const RING_KEYS: Key[] = [
  { p: 0, x: -0.1, y: 0.95, z: -900, rx: -26, rz: -16, spin: -60, o: 1 },
  { p: 0.1, x: -0.08, y: 0.42, z: -700, rx: -24, rz: -14, spin: -30, o: 1 },
  { p: 0.22, x: -0.02, y: 0.1, z: 400, rx: -12, rz: -8, spin: 25, o: 1 },
  { p: 0.32, x: 0, y: 0, z: 1360, rx: -5, rz: -3, spin: 80, o: 1 },
  { p: 0.4, x: 0.01, y: -0.02, z: 1360, rx: -3, rz: -3, spin: 125, o: 1 },
  { p: 0.48, x: 0.06, y: -0.2, z: 200, rx: 18, rz: -14, spin: 170, o: 1 },
  { p: 0.54, x: 0.12, y: -0.38, z: -200, rx: 24, rz: -18, spin: 195, o: 1 },
  { p: 0.6, x: 0.18, y: -0.9, z: -550, rx: 28, rz: -20, spin: 215, o: 0 },
];
const CHANNELS = ["x", "y", "z", "rx", "rz", "spin", "o"] as const;

/** Where the words leave the frame, the grid assembles, and the blinds close, along the pin.
 *  The first grid cards drop in while the ring is still leaving, so there is no empty beat. */
const WORDS_OUT = 0.56;
const GRID_FROM = 0.46;
const GRID_TO = 0.72;
const BLINDS_FROM = 0.88;
const BLINDS = 9;

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const rad = (d: number) => (d * Math.PI) / 180;

/** Catmull-Rom through the keys, so the flight never stalls or kinks at a keyframe. */
function sample(keys: Key[], p: number): Key {
  const last = keys.length - 1;
  if (p <= keys[0].p) return keys[0];
  if (p >= keys[last].p) return keys[last];
  let i = 0;
  while (keys[i + 1].p < p) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const dt = b.p - a.p;
  const s = (p - a.p) / dt;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1;
  const h10 = s ** 3 - 2 * s ** 2 + s;
  const h01 = -2 * s ** 3 + 3 * s ** 2;
  const h11 = s ** 3 - s ** 2;
  const slope = (j: number, c: (typeof CHANNELS)[number]) => {
    const lo = keys[Math.max(0, j - 1)];
    const hi = keys[Math.min(last, j + 1)];
    return (hi[c] - lo[c]) / (hi.p - lo.p);
  };
  const out = { p } as Key;
  for (const c of CHANNELS) out[c] = h00 * a[c] + h10 * dt * slope(i, c) + h01 * b[c] + h11 * dt * slope(i + 1, c);
  out.o = clamp01(out.o);
  return out;
}

const ringCardWidth = (vw: number) => Math.min(410, Math.max(240, vw * 0.23));
const gridCardWidth = (vw: number) => Math.min(340, Math.max(220, vw * 0.215));
/** Radius that closes the doubled set into a ring with a little air between cards. */
const ringRadius = (vw: number) => ((RING.length * ringCardWidth(vw)) / (2 * Math.PI)) * 1.06;

/**
 * The vetting, after a studio's "design in motion" reel. Two words slide in from opposite edges
 * and cross the frame. Behind them a carousel of the stages rises, swings in and spins past, then
 * tips away through the top; the stages come back as a grid, dropping in from above and rising
 * from below, and dark blinds close over it into the footer.
 *
 * Driven entirely from the scroll and the viewport size as MotionValues, so scrolling costs no
 * React render: the whole ring is one transform. Without choreography it is the grid.
 */
export function StageArc() {
  const ref = useRef<HTMLElement>(null);
  const { scrollChoreography: live } = useMotionEnv();
  // From the section's top entering the screen to the end of the pin: the words use all of it.
  const { scrollYProgress: whole } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const pin = useTransform(whole, (q) => clamp01((q - PIN_START) / (1 - PIN_START)));

  const vw = useMotionValue(1440);
  const vh = useMotionValue(900);
  useEffect(() => {
    const measure = () => {
      vw.set(window.innerWidth);
      vh.set(window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [vw, vh]);

  // The two words cross the whole frame: in from their own edge, out by the other.
  const out = PIN_START + WORDS_OUT * (1 - PIN_START);
  const leftX = useTransform(whole, [0, PIN_START, out], ["-60vw", "-4vw", "112vw"], { clamp: true });
  const rightX = useTransform(whole, [0, PIN_START, out], ["60vw", "4vw", "-112vw"], { clamp: true });
  const noteOpacity = useTransform(pin, [WORDS_OUT - 0.08, WORDS_OUT], [1, 0], { clamp: true });

  const pose = useTransform(() => sample(RING_KEYS, pin.get()));
  const ring = useTransform(() => {
    const k = pose.get();
    return `translate3d(${k.x * vw.get()}px, ${k.y * vh.get()}px, ${k.z}px) rotateZ(${k.rz}deg) rotateX(${k.rx}deg) rotateY(${k.spin}deg)`;
  });
  const ringOpacity = useTransform(pose, (k) => k.o);
  const spin = useTransform(pose, (k) => k.spin);
  const rule = useTransform(pin, (p) => smooth((p - (GRID_FROM + 0.08)) / (GRID_TO - GRID_FROM - 0.08)));

  if (!live) {
    return (
      <section ref={ref} aria-labelledby="stages-title" className="py-28">
        <Words id="stages-title" />
        <p className="label mx-auto mt-10 max-w-[24ch] text-center">{note}</p>
        <ul className="shell mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, i) => (
            <li key={i} className="aspect-[1/0.72]">
              <Card card={card} look={LOOKS[i]} />
            </li>
          ))}
        </ul>
        <Foot className="mt-16" />
      </section>
    );
  }

  return (
    <section ref={ref} aria-labelledby="stages-title" className="relative" style={{ height: `${HEIGHT_SVH}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <p className="mega">
            <motion.span style={{ x: leftX }} className="absolute left-[9vw] top-[33svh] block whitespace-nowrap">
              From a CV
            </motion.span>
            <motion.span style={{ x: rightX }} className="absolute right-[9vw] top-[52svh] block whitespace-nowrap">
              to a shortlist
            </motion.span>
          </p>
        </div>
        <h2 id="stages-title" className="sr-only">
          From a CV to a shortlist
        </h2>
        <motion.p style={{ opacity: noteOpacity }} className="label absolute left-1/2 top-[46svh] w-[34ch] -translate-x-1/2 text-center">
          {note}
        </motion.p>

        {/* The ring, clipped to a frame inset from either edge so its band ends on clean
            vertical lines rather than at the window. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 perspective-[1400px] [clip-path:inset(0_12.5%)]">
          <motion.div
            style={{ transform: ring, opacity: ringOpacity, transformOrigin: "0 0" }}
            className="absolute left-1/2 top-1/2 transform-3d"
          >
            <Rim vw={vw} offset={-1} />
            <Rim vw={vw} offset={1} />
            {RING.map((card, i) => (
              <RingCard key={i} angle={-i * STEP} spin={spin} vw={vw}>
                <Card card={CARDS[card]} look={LOOKS[card]} />
              </RingCard>
            ))}
          </motion.div>
        </div>

        {/* The grid the stages settle into, with its middle rule drawn in from the left. */}
        <motion.span
          aria-hidden
          style={{ scaleX: rule, opacity: rule }}
          className="absolute left-(--shell) right-(--shell) top-1/2 h-px origin-left bg-border"
        />
        <ul className="absolute inset-0 perspective-[1600px]">
          {CARDS.map((card, i) => (
            <GridCard key={i} slot={i} progress={pin} vw={vw} vh={vh}>
              <Card card={card} look={LOOKS[i]} />
            </GridCard>
          ))}
        </ul>

        <Foot className="absolute inset-x-0 bottom-0 pb-8" />

        <Blinds progress={pin} />
      </div>
    </section>
  );
}

const note = `${spell(STAGES.length)} stages. Each one unlocked only by recorded evidence.`;

function Words({ id }: { id: string }) {
  return (
    <h2 id={id} className="mega shell">
      <span className="block">From a CV</span>
      <span className="block text-right">to a shortlist</span>
    </h2>
  );
}

function Foot({ className }: { className?: string }) {
  return (
    <div className={cn("shell flex flex-col justify-between gap-8 md:flex-row md:items-end", className)}>
      <p className="max-w-[30ch] text-[0.95rem] leading-snug">
        Every candidate climbs the same stages. Each is unlocked only when its evidence is on file.
      </p>
      <CtaLine href="/how-we-select">See how we select</CtaLine>
    </div>
  );
}

/**
 * One card on the ring, facing the centre. It shows only while it is on the far side, facing
 * the camera, and fades as it swings round toward the near side; it never shows its back.
 */
function RingCard({
  angle,
  spin,
  vw,
  children,
}: {
  angle: number;
  spin: MotionValue<number>;
  vw: MotionValue<number>;
  children: React.ReactNode;
}) {
  const transform = useTransform(vw, (v) => `rotateY(${angle}deg) translateZ(${-ringRadius(v)}px) translate(-50%, -50%)`);
  const width = useTransform(vw, (v) => ringCardWidth(v));
  const height = useTransform(vw, (v) => ringCardWidth(v) * 0.68);
  const opacity = useTransform(spin, (s) => smooth((Math.cos(rad(angle + s)) - 0.08) / 0.3));
  return (
    <motion.div
      style={{ transform, width, height, opacity, transformOrigin: "0 0" }}
      className="absolute left-0 top-0 backface-hidden"
    >
      {children}
    </motion.div>
  );
}

/** The thin ellipses that trace the ring's top and bottom edges, carried with it. */
function Rim({ vw, offset }: { vw: MotionValue<number>; offset: -1 | 1 }) {
  const size = useTransform(vw, (v) => ringRadius(v) * 2);
  const transform = useTransform(
    vw,
    (v) => `translate(-50%, -50%) translateY(${offset * (ringCardWidth(v) * 0.34 + 36)}px) rotateX(90deg)`,
  );
  return (
    <motion.span
      style={{ width: size, height: size, transform }}
      className="absolute left-0 top-0 rounded-full border border-foreground/15"
    />
  );
}

/** A card of the final grid: the top row drops in from above, the bottom row rises from the
 *  corners below, each a little rotated until it lands. */
function GridCard({
  slot,
  progress,
  vw,
  vh,
  children,
}: {
  slot: number;
  progress: MotionValue<number>;
  vw: MotionValue<number>;
  vh: MotionValue<number>;
  children: React.ReactNode;
}) {
  const col = slot % COLS;
  const row = Math.floor(slot / COLS);
  const rows = Math.ceil(CARDS.length / COLS);
  const fromAbove = row === 0;
  const spread = col - (COLS - 1) / 2;
  const start = GRID_FROM + col * 0.025 + row * 0.05;
  const span = GRID_TO - GRID_FROM - 0.125;

  const pose = useTransform(() => {
    const t = smooth((progress.get() - start) / span);
    const w = gridCardWidth(vw.get());
    const h = w * 0.72;
    const gx = spread * (w + GAP);
    const gy = (row - (rows - 1) / 2) * (h + GAP * 2);
    return {
      x: gx + (1 - t) * spread * 160,
      y: lerp(gy + (fromAbove ? -1 : 1) * vh.get() * 0.7, gy, t),
      rotateX: (1 - t) * (fromAbove ? -30 : 30),
      rotate: (1 - t) * spread * 5,
      opacity: Math.min(1, t * 3),
    };
  });
  const x = useTransform(pose, (v) => v.x);
  const y = useTransform(pose, (v) => v.y);
  const rotateX = useTransform(pose, (v) => v.rotateX);
  const rotate = useTransform(pose, (v) => v.rotate);
  const opacity = useTransform(pose, (v) => v.opacity);
  const width = useTransform(vw, (v) => gridCardWidth(v));
  const height = useTransform(vw, (v) => gridCardWidth(v) * 0.72);

  return (
    <motion.li
      style={{ x, y, rotateX, rotate, opacity, width, height }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      {children}
    </motion.li>
  );
}

/** Dark bands that open across the frame until they meet, handing the page to the footer. */
function Blinds({ progress }: { progress: MotionValue<number> }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col">
      {Array.from({ length: BLINDS }, (_, i) => (
        <Blind key={i} progress={progress} index={i} />
      ))}
    </div>
  );
}

function Blind({ progress, index }: { progress: MotionValue<number>; index: number }) {
  // Not quite in step: the bands nearest the bottom lead, as the footer pushes up into them.
  const from = BLINDS_FROM + ((BLINDS - 1 - index) / BLINDS) * 0.05;
  const scaleY = useTransform(progress, [from, Math.min(1, from + 0.06)], [0, 1], { clamp: true });
  return (
    <div className="relative flex-1">
      <motion.span style={{ scaleY }} className="absolute -inset-y-px inset-x-0 bg-[#0b0c0f]" />
    </div>
  );
}

/** A piece of the reel: a stage as one candidate's record shows it, or the way on. */
function Card({ card, look }: { card: (typeof CARDS)[number]; look: Look }) {
  const art = look !== "paper" && look !== "ink";
  const onDark = look !== "paper";
  const shell = cn(
    "relative isolate flex size-full flex-col justify-between overflow-hidden rounded-[7px] p-4 shadow-[0_24px_50px_-28px_rgb(0_0_0/0.45)]",
    look === "paper" && "bg-[#f7f7f5] text-[#2b2b2d]",
    look === "ink" && "bg-[#18181b] text-[#ececec]",
    art && "text-white",
  );
  const backdrop = art ? (
    <>
      <ArtCanvas art={look} seed={21} w={300} h={216} density={1} priority={1} className="absolute inset-0 -z-10 h-full! w-full!" />
      <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/45 to-black/5" />
    </>
  ) : null;

  if (card.kind === "method") {
    return (
      <Link href="/how-we-select" className={cn(shell, "group")}>
        {backdrop}
        <span className="label text-[0.7rem] opacity-70">The method, in full</span>
        <span className="flex items-end justify-between gap-3">
          <span className="font-display text-[1.65rem] leading-[0.95] tracking-[-0.06em]">Read every step.</span>
          <ArrowRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </span>
      </Link>
    );
  }

  const meta = STAGE_META[card.stage];
  return (
    <article className={shell}>
      {backdrop}
      <div className="flex items-center justify-between gap-2 font-mono text-[0.625rem]">
        <span className="opacity-70">PEEP-ACC-000124</span>
        <span className="rounded-full border border-current px-2 py-0.5">{meta.short}</span>
      </div>
      <div>
        <h3 className="font-display text-[1.65rem] leading-[0.95] tracking-[-0.06em]">{meta.label}.</h3>
        <p className={cn("mt-2 text-[0.72rem] leading-snug", onDark ? "text-white/75" : "text-[#5c5c60]")}>{meta.description}</p>
        {/* How far up the stages this record is. */}
        <div aria-hidden className="mt-3 flex gap-1">
          {STAGES.map((s, i) => (
            <span key={s} className={cn("h-0.5 flex-1 rounded-full", i <= card.index ? "bg-current" : "bg-current/20")} />
          ))}
        </div>
      </div>
    </article>
  );
}
