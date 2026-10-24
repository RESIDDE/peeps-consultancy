"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** The wordmark file's own proportions. Only its alpha is read. */
const SRC = "/peeps-wordmark-white.png";
const RATIO = 649 / 2400;

/** Stiffness and damping of each line's spring home. A little under-damped, as a plucked
 *  string is: the pointer threw it, so a small overshoot is earned. */
const K = 0.06;
const DAMP = 0.86;

type Row = { y: number; runs: [number, number][]; off: number; v: number };

/**
 * The PEEPs wordmark drawn as horizontal rules, the way an engraver would hatch it. Each
 * row of the mark becomes one line broken wherever the letters are open. Sweep the pointer
 * across and the nearest lines are dragged along with it, then spring back.
 *
 * Drawn into a canvas from the logo file's alpha, so the shape is the real mark at any
 * width. The animation runs only while a line is still moving.
 */
export function LineWordmark({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current;
    const cvs = canvas.current;
    const ctx = cvs?.getContext("2d");
    if (!box || !cvs || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    let rows: Row[] = [];
    let width = 0;
    let lineWidth = 2;
    let frame = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, width * RATIO);
      ctx.lineCap = "round";
      ctx.lineWidth = lineWidth;
      for (const row of rows) {
        // Lines that have been disturbed brighten a little while they settle.
        ctx.strokeStyle = `rgb(216 216 216 / ${Math.min(1, 0.55 + Math.abs(row.off) / 40)})`;
        ctx.beginPath();
        for (const [x0, x1] of row.runs) {
          ctx.moveTo(x0 + row.off, row.y);
          ctx.lineTo(x1 + row.off, row.y);
        }
        ctx.stroke();
      }
    };

    // Sample the mark at the current width: one row every `gap` pixels, broken into the runs
    // where the letters are solid.
    const layout = () => {
      if (!img.complete || !img.naturalWidth) return;
      // A box with no width yet (mid-layout, or hidden) has nothing to sample.
      if (box.clientWidth < 1) return;
      width = box.clientWidth;
      const height = Math.round(width * RATIO);
      const dpr = window.devicePixelRatio || 1;
      cvs.width = Math.round(width * dpr);
      cvs.height = Math.round(height * dpr);

      const probe = document.createElement("canvas");
      probe.width = width;
      probe.height = height;
      const pctx = probe.getContext("2d", { willReadFrequently: true });
      if (!pctx) return;
      pctx.drawImage(img, 0, 0, width, height);
      const alpha = pctx.getImageData(0, 0, width, height).data;

      const gap = Math.max(5, Math.round(width / 170));
      lineWidth = Math.max(1.25, gap * 0.28);
      rows = [];
      for (let y = Math.round(gap / 2); y < height; y += gap) {
        const runs: [number, number][] = [];
        let start = -1;
        for (let x = 0; x <= width; x++) {
          const solid = x < width && alpha[(y * width + x) * 4 + 3] > 110;
          if (solid && start < 0) start = x;
          if (!solid && start >= 0) {
            runs.push([start, x - 1]);
            start = -1;
          }
        }
        if (runs.length) rows.push({ y, runs, off: 0, v: 0 });
      }
      draw();
    };

    const step = () => {
      let moving = false;
      for (const row of rows) {
        row.v = (row.v - row.off * K) * DAMP;
        row.off += row.v;
        if (Math.abs(row.off) > 0.05 || Math.abs(row.v) > 0.05) moving = true;
        else row.off = row.v = 0;
      }
      draw();
      frame = moving ? requestAnimationFrame(step) : 0;
    };

    // Lines within reach of the pointer take its horizontal motion, the nearest most.
    const onMove = (e: PointerEvent) => {
      if (still || !e.movementX) return;
      const r = cvs.getBoundingClientRect();
      const py = e.clientY - r.top;
      const reach = Math.max(18, r.height * 0.07);
      for (const row of rows) {
        const d = Math.abs(row.y - py);
        if (d < reach) row.v += e.movementX * 0.35 * (1 - d / reach);
      }
      if (!frame) frame = requestAnimationFrame(step);
    };

    img.onload = layout;
    img.src = SRC;
    const resize = new ResizeObserver(layout);
    resize.observe(box);
    cvs.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      cvs.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className={cn("relative w-full", className)} style={{ aspectRatio: `${1 / RATIO}` }}>
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}
