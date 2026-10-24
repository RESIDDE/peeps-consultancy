"use client";

import { useRef } from "react";
import type { MotionValue } from "motion/react";
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { ArtCanvas, type ArtPreset } from "@/components/ui/glass-folder-cards";
import { VERTICALS } from "@/lib/content";
import { cn } from "@/lib/utils";
import { CtaLine } from "./cta-line";

const LAUNCH = VERTICALS.filter((v) => v.launch);
const spell = (n: number) => ["None", "One", "Two", "Three", "Four", "Five", "Six"][n] ?? String(n);
const ART: ArtPreset[] = ["aurora", "glacier", "verdant"];
const TITLE = "Where we go deep.";

/** Every panel is half a viewport wide, so the travel is known without measuring anything. */
const PANEL_VW = 50;
const PANELS = LAUNCH.length + 2;
/** The strip runs until its last panel has left the frame. */
const TRAVEL_VW = PANELS * PANEL_VW;
/**
 * The last stretch of that travel uncovers the section beneath, which pins there waiting for
 * it. DivisionsStack pulls itself up by this much (plus a viewport) so the two overlap exactly.
 */
export const REVEAL_VW = 100;

/** How far below its line a panel sits on its way in, by how far right of centre it is. */
function rise(centreVw: number, xVw: number) {
  const d = (centreVw + xVw - 50) / 50;
  return 17 * Math.min(1.4, Math.max(0, d)) ** 3;
}

/**
 * The launch sectors as a strip that runs sideways while the page holds still, one sector per
 * half-screen, each card lifting into line as it comes in from the right. The strip then keeps
 * going until it has slid clean off the frame, uncovering What we do pinned beneath it.
 * Without choreography (phones, reduced motion) it is an ordinary column.
 */
export function SectorGallery() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollChoreography: live } = useMotionEnv();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const xVw = useTransform(scrollYProgress, [0, 1], [0, -TRAVEL_VW], { clamp: true });
  const x = useMotionTemplate`${xVw}vw`;
  // The cross on the strip's trailing edge turns from + to × as the strip leaves.
  const turn = useTransform(scrollYProgress, [1 - REVEAL_VW / TRAVEL_VW, 1], [0, 45], { clamp: true });

  if (!live) {
    return (
      <section aria-labelledby="sectors-title" className="py-24">
        {/* The scroll target is still attached, so the hook above has something to measure. */}
        <div ref={track}>
          <h2 id="sectors-title" className="headline shell">
            {TITLE}
          </h2>
          <ul className="shell mt-14 grid gap-16">
            {LAUNCH.map((v, i) => (
              <li key={v.slug}>
                <SectorCard vertical={v} index={i} />
              </li>
            ))}
          </ul>
          <div className="shell mt-20">
            <Closing />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="sectors-title">
      {/* The rule above the pin, with its line dropping from the cross into the strip's first edge. */}
      <div aria-hidden className="relative h-[16svh]">
        <span className="absolute inset-x-(--shell) top-0 h-px bg-border" />
        <span className="absolute bottom-0 left-1/2 top-0 w-px bg-border" />
        <Cross className="left-1/2 top-0" />
      </div>

      <div ref={track} className="relative" style={{ height: `calc(100svh + ${TRAVEL_VW}vw)` }}>
        {/* Above the next section, and see-through wherever the strip is not. */}
        <div className="pointer-events-none sticky top-0 z-10 h-svh overflow-hidden">
          <motion.ul
            style={{ x }}
            className="pointer-events-auto flex h-full w-max bg-linear-to-b from-[#f0f0f0] to-[#cdcdcd]"
          >
            <li className="flex h-full w-[50vw] items-center border-r border-border pl-[calc(var(--shell)+5vw)]">
              <div>
                <h2 id="sectors-title" className="headline max-w-[9ch]">
                  {TITLE}
                </h2>
                <CtaLine href="/sectors" className="mt-10">
                  View all sectors
                </CtaLine>
              </div>
            </li>
            {LAUNCH.map((v, i) => (
              <Panel key={v.slug} centre={(i + 1.5) * PANEL_VW} xVw={xVw} className="px-[4vw]">
                <SectorCard vertical={v} index={i} />
              </Panel>
            ))}
            <Panel centre={(PANELS - 0.5) * PANEL_VW} xVw={xVw} className="justify-center px-[6vw]">
              <Closing />
              <motion.span
                aria-hidden
                style={{ rotate: turn }}
                className="absolute -right-[7px] top-1/2 size-[13px] -translate-y-1/2"
              >
                <span className="absolute left-1/2 top-0 h-full w-px bg-foreground/70" />
                <span className="absolute left-0 top-1/2 h-px w-full bg-foreground/70" />
              </motion.span>
            </Panel>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

/** A half-screen panel whose content lifts into line as it travels in from the right. */
function Panel({
  centre,
  xVw,
  className,
  children,
}: {
  centre: number;
  xVw: MotionValue<number>;
  className?: string;
  children: React.ReactNode;
}) {
  const y = useTransform(xVw, (v) => `${rise(centre, v)}svh`);
  return (
    <li className={cn("relative flex h-full w-[50vw] items-center border-r border-border", className)}>
      <motion.div style={{ y }} className="w-full">
        {children}
      </motion.div>
    </li>
  );
}

function SectorCard({ vertical: v, index }: { vertical: (typeof LAUNCH)[number]; index: number }) {
  return (
    <article className="w-full">
      <div className="relative isolate aspect-[576/396] overflow-hidden rounded-[7px] bg-[#cfcfcf] text-white">
        <ArtCanvas
          art={ART[index % ART.length]}
          seed={5 + index * 7}
          w={576}
          h={396}
          density={1}
          priority={1}
          className="absolute inset-0 -z-10 h-full! w-full!"
        />
        <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
        <div className="flex h-full flex-col justify-between p-5 md:p-7">
          <div className="label flex justify-between text-[0.75rem]">
            <span>PEEPs · {v.name}</span>
            <span>{v.roles.length} roles</span>
          </div>
          <p aria-hidden className="max-w-[16ch] font-display text-[clamp(1.75rem,3.2vw,3.25rem)] leading-[0.92] tracking-[-0.06em]">
            {v.roles.slice(0, 3).join(". ")}.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h3 className="font-display text-[1.45rem] leading-none tracking-[-0.04em]">{v.name}</h3>
          <p className="mt-2.5 max-w-[38ch] text-[0.875rem] leading-snug text-muted-foreground">{v.blurb}</p>
        </div>
        <CtaLine href={`/sectors/${v.slug}`} className="shrink-0">
          Explore sector
        </CtaLine>
      </div>
    </article>
  );
}

function Closing() {
  return (
    <div className="text-center">
      <p className="mx-auto max-w-[24ch] font-display text-[clamp(1.3rem,1.7vw,1.7rem)] leading-[1.12] tracking-[-0.03em]">
        {spell(LAUNCH.length)} sectors live and {spell(VERTICALS.length - LAUNCH.length).toLowerCase()} on the way, each
        with the roles we fill and how we assess them.
      </p>
      <CtaLine href="/sectors" className="mt-8">
        View all sectors
      </CtaLine>
    </div>
  );
}

/** The cross where a rule meets a line. */
function Cross({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("absolute size-[13px] -translate-x-1/2 -translate-y-1/2", className)}>
      <span className="absolute left-1/2 top-0 h-full w-px bg-foreground/70" />
      <span className="absolute left-0 top-1/2 h-px w-full bg-foreground/70" />
    </span>
  );
}
