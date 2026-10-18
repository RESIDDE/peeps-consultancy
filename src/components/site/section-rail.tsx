"use client";

import { useActiveChapter } from "@/components/motion/interaction-provider";
import { cn } from "@/lib/utils";

/**
 * The chapter marker that rides the right edge. Observation lives in the interaction
 * provider, so this is a plain consumer. Decorative, and hidden from assistive tech and
 * from phones, where the margin does not exist.
 */
export function SectionRail() {
  const label = useActiveChapter();

  return (
    <div aria-hidden data-lens-omit className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
      <span
        className={cn(
          "flex items-center gap-2 rounded-full border bg-card/90 py-1.5 pl-3 pr-2.5 shadow-sm backdrop-blur-sm transition-opacity duration-300",
          label ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="font-mono text-xs text-foreground">{label ?? ""}</span>
        <span className="size-1.5 rounded-full bg-primary" />
      </span>
    </div>
  );
}
