"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { usePointer } from "@/components/motion/interaction-provider";
import { takeSnapshot } from "@/components/motion/page-snapshot";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { DraggableGlass } from "./glass";
import { CX, CY, R_GLASS, VIEW, Magnifier } from "./magnifier";

/** How large the glass grows by the time it reaches the middle of the screen. Gentler on a
 *  phone, where 3.2x of a full-width object would cover the page rather than travel across it. */
const ZOOM_WIDE = 3.2;
const ZOOM_NARROW = 1.9;
/** Degrees of lean at the far edge of the window. */
const TILT = 14;
const TILT_Z = 4;
/** Magnification through the glass. Held constant as the glass grows, so a bigger lens
 *  simply takes in more of its surroundings rather than zooming further in. */
const LENS = 1.9;

const unit = (n: number) => Math.max(-1, Math.min(1, n));

export function StudioHero() {
  const section = useRef<HTMLElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const drift = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { pointerExtras, wide } = useMotionEnv();
  const pointer = usePointer();

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });

  // Geometry lives in MotionValues, so re-measuring on resize costs no render.
  const dx = useMotionValue(0);
  const dy = useMotionValue(0);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const halfW = useMotionValue(1);
  const halfH = useMotionValue(1);

  // Rest geometry for the lens, in document coordinates: the glass centre, the element
  // centre it is scaled about, and the glass radius in unscaled local pixels.
  const lensHost = useRef<HTMLDivElement>(null);
  const gX = useMotionValue(0);
  const gY = useMotionValue(0);
  const eX = useMotionValue(0);
  const eY = useMotionValue(0);
  const rLocal = useMotionValue(0);

  const measure = useCallback(() => {
    const el = slot.current;
    const host = section.current;
    if (!el || !host) return;
    const r = el.getBoundingClientRect();
    const h = host.getBoundingClientRect();

    // Horizontal travel does not depend on scroll position.
    dx.set(window.innerWidth / 2 - (r.left + r.width / 2));
    // By the end of the range the page has scrolled the hero's full height, so the vertical
    // target is expressed relative to the section instead of the viewport.
    dy.set(window.innerHeight / 2 - r.height / 2 - (r.top - h.top) + h.height);

    cx.set(r.left + r.width / 2);
    cy.set(r.top + r.height / 2);
    halfW.set(window.innerWidth / 2);
    halfH.set(window.innerHeight / 2);

    gX.set(r.left + window.scrollX + (r.width * CX) / VIEW);
    gY.set(r.top + window.scrollY + (r.height * CY) / VIEW);
    eX.set(r.left + window.scrollX + r.width / 2);
    eY.set(r.top + window.scrollY + r.height / 2);
    rLocal.set((r.width * R_GLASS) / VIEW);
  }, [dx, dy, cx, cy, halfW, halfH, gX, gY, eX, eY, rLocal]);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (slot.current) observer.observe(slot.current);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // Pause the drift while the page is moving, resume a beat after it settles, and take a
  // fresh reading then: the glass has moved, so the tilt needs a new centre to work from.
  useEffect(() => {
    let settle: number | undefined;
    const onScroll = () => {
      drift.current?.setAttribute("data-idle", "false");
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        drift.current?.setAttribute("data-idle", "true");
        measure();
      }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  }, [measure]);

  const x = useTransform(() => scrollYProgress.get() * dx.get());
  const y = useTransform(() => scrollYProgress.get() * dy.get());
  const scale = useTransform(scrollYProgress, [0, 1], [1, wide ? ZOOM_WIDE : ZOOM_NARROW]);
  // Hold it solid most of the way, then let go just before the next section lands.
  const opacity = useTransform(scrollYProgress, [0, 0.86, 1], [1, 1, 0]);

  // Lean toward wherever the pointer is. The provider seeds the pointer offscreen at -100,
  // which must read as "no pointer yet" rather than as a hard lean to the top left.
  const aimX = useTransform(() => {
    const px = pointer.x.get();
    if (px < 0 || pointer.y.get() < 0) return 0;
    return unit((px - cx.get()) / halfW.get());
  });
  const aimY = useTransform(() => {
    const py = pointer.y.get();
    if (py < 0 || pointer.x.get() < 0) return 0;
    return unit((py - cy.get()) / halfH.get());
  });
  const spring = { stiffness: 130, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(aimX, (v) => v * TILT), spring);
  const rotateX = useSpring(useTransform(aimY, (v) => -v * TILT), spring);
  const rotateZ = useSpring(useTransform(aimX, (v) => v * TILT_Z), spring);

  const still = reduced === true;

  // Where the glass centre currently sits in the document. A translate, then a scale about
  // the element centre: E + T + s(G - E). Derived from the same values that drive the
  // transform, so the lens tracks exactly without reading layout on any frame.
  const lensX = useTransform(() => -(eX.get() + x.get() + scale.get() * (gX.get() - eX.get())));
  const lensY = useTransform(() => -(eY.get() + y.get() + scale.get() * (gY.get() - eY.get())));
  // The well sits inside the scaled glass, so the copy is counter-scaled to hold the
  // magnification steady on screen as the glass grows.
  const lensZoom = useTransform(scale, (v) => LENS / Math.max(v, 0.001));
  const lensInner = useMotionTemplate`translate(${rLocal}px, ${rLocal}px) scale(${lensZoom}) translate(${lensX}px, ${lensY}px)`;

  // One copy, taken after mount. It is positioned in document space, so scrolling does not
  // invalidate it; only a change of layout does.
  useEffect(() => {
    if (still) return;
    const take = () => takeSnapshot(lensHost.current, { invert: false });
    take();
    window.addEventListener("resize", take);
    return () => window.removeEventListener("resize", take);
  }, [still]);


  return (
    <section
      ref={section}
      id="intro"
      data-chapter="Intro"
      data-x="Hero"
      className="shell relative grid items-end gap-10 pb-14 pt-24 sm:pt-28 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.12fr_0.88fr] lg:gap-14 lg:pb-16"
    >
      <h1 className="display" data-x="Heading" data-x-font="true">
        Look closer before you hire.
      </h1>

      <div className="flex h-full flex-col justify-between gap-10">
        <div ref={slot} className="ml-auto w-[min(100%,30rem)] lg:w-[min(100%,34rem)]">
          {/* Three transforms, nested so they compose: scroll travel, idle drift, pointer lean. */}
          <DraggableGlass>
            <motion.div
              style={still ? undefined : { x, y, scale, opacity, willChange: "transform" }}
              className="origin-center"
            >
              <div ref={drift} data-idle="true" className="loupe-float" style={{ perspective: "1200px" }}>
                <motion.div style={pointerExtras ? { rotateX, rotateY, rotateZ } : undefined}>
                  <Magnifier>
                  {/* A clear lens: the page around the glass, magnified, with nothing
                      painted behind it. */}
                  {!still && <motion.div ref={lensHost} style={{ transform: lensInner }} />}
                </Magnifier>
                </motion.div>
              </div>
            </motion.div>
          </DraggableGlass>
        </div>

        <div className="max-w-[34ch]">
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl" data-x="Intro" data-x-font="true">
            Recruitment, assessment and workforce development in Nigeria. Every shortlist arrives
            with the evidence behind each name.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/employers#request"
              className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-ink-foreground transition-transform duration-200 hover:-translate-y-0.5"
              data-x="Button"
            >
              <span className="font-medium">Request talent</span>
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white">
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
            <Link
              href="/how-we-select"
              className="group inline-flex items-center gap-3 rounded-full border border-border py-2 pl-6 pr-2 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-foreground/30"
            >
              <span className="font-medium">See how we select</span>
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-border">
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
