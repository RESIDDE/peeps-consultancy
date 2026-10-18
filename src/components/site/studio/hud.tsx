"use client";

import { useEffect, useRef } from "react";
import { usePointer } from "@/components/motion/interaction-provider";
import { useMotionEnv } from "@/components/motion/use-motion-env";
import { cn } from "@/lib/utils";

/**
 * The corner readout. The counter is always there; the instrument panel beside it —
 * pointer, viewport, scroll, clock — only appears in X-ray, as on the reference.
 *
 * Every value is written straight to the DOM from a MotionValue subscription or a timer,
 * so a readout that changes on every pointer move costs no React render.
 */
export function Hud({ found = 1, total = 15, className }: { found?: number; total?: number; className?: string }) {
  const { pointerExtras } = useMotionEnv();
  const pointer = usePointer();
  const coords = useRef<HTMLSpanElement>(null);
  const size = useRef<HTMLSpanElement>(null);
  const scroll = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!pointerExtras) return;
    const pad = (n: number, w = 4) => String(Math.round(n)).padStart(w, " ");

    const writePointer = () => {
      if (coords.current) coords.current.textContent = `X ${pad(pointer.x.get())}  Y ${pad(pointer.y.get())}`;
    };
    const writeFrame = () => {
      if (size.current) size.current.textContent = `${window.innerWidth}×${window.innerHeight}`;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (scroll.current) scroll.current.textContent = `${max > 0 ? Math.round((window.scrollY / max) * 100) : 0} %`;
    };
    const writeClock = () => {
      if (clock.current) clock.current.textContent = new Date().toTimeString().slice(0, 8);
    };

    writePointer();
    writeFrame();
    writeClock();
    const stopX = pointer.x.on("change", writePointer);
    const stopY = pointer.y.on("change", writePointer);
    const tick = window.setInterval(writeClock, 1000);
    window.addEventListener("scroll", writeFrame, { passive: true });
    window.addEventListener("resize", writeFrame);
    return () => {
      stopX();
      stopY();
      window.clearInterval(tick);
      window.removeEventListener("scroll", writeFrame);
      window.removeEventListener("resize", writeFrame);
    };
  }, [pointerExtras, pointer]);

  return (
    <div
      data-lens-omit
      className={cn("pointer-events-none fixed bottom-5 right-5 z-30 hidden items-center gap-5 lg:flex", className)}
    >
      <div className="hud-readout font-mono text-xs tabular-nums text-muted-foreground">
        <span ref={coords} />
        <span ref={size} />
        <span ref={scroll} />
        <span ref={clock} />
      </div>

      <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 py-1.5 pl-3 pr-3.5 shadow-sm backdrop-blur-sm">
        <span aria-hidden className="size-2 rounded-full border-[1.5px] border-[color:var(--accent)]" />
        <span className="font-mono text-xs tabular-nums text-foreground">
          {found}/{total}
        </span>
        <span className="font-mono text-xs text-muted-foreground">found</span>
      </div>
    </div>
  );
}
