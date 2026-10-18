"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { CHECK_META, STAGES, STAGE_META } from "@/lib/quality";
import { cn } from "@/lib/utils";

/**
 * Interactive Registered → Placed ladder with the evidence each rung needs.
 * Phones get horizontal bars with full stage names; from sm it becomes a staircase.
 */
export function QualityLadder() {
  const [active, setActive] = useState(2);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = STAGES[active];
  const meta = STAGE_META[stage];

  function select(i: number) {
    const next = (i + STAGES.length) % STAGES.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: STAGES.length - 1,
    };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key]);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-10">
      <div
        className="flex flex-col gap-2 sm:h-80 sm:flex-row sm:items-end sm:gap-3"
        role="tablist"
        aria-label="PEEPs quality ladder"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
      >
        {STAGES.map((s, i) => {
          const on = i === active;
          const reached = i <= active;
          return (
            <button
              key={s}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`ladder-tab-${s}`}
              aria-selected={on}
              aria-controls="ladder-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-none sm:h-full sm:flex-1 sm:flex-col sm:items-stretch sm:gap-0 sm:text-center"
              style={{ "--bar": `${28 + i * 12}%` } as React.CSSProperties}
            >
              {/* Track: a row on phones (bar grows rightwards), the flexible column height from sm. */}
              <span className="order-2 h-9 min-w-0 flex-1 sm:order-1 sm:flex sm:h-auto sm:min-h-0 sm:items-end">
                <span
                  className={cn(
                    "reveal-bar relative flex h-full w-(--bar) items-center rounded-r-lg transition-opacity duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background sm:h-(--bar) sm:w-full sm:items-start sm:justify-center sm:rounded-t-xl sm:rounded-br-none",
                    reached ? "opacity-100" : "opacity-30",
                    on && "shadow-lg",
                  )}
                  style={{ background: `var(--stage-${s})` }}
                >
                  <span aria-hidden className="px-2.5 font-mono text-xs font-semibold text-white/95 sm:px-0 sm:pt-2">{String(i + 1).padStart(2, "0")}</span>
                </span>
              </span>
              <span
                className={cn(
                  "order-1 w-28 shrink-0 text-sm font-medium sm:order-2 sm:mt-2 sm:w-auto sm:truncate sm:text-xs",
                  on ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STAGE_META[s].label}
              </span>
            </button>
          );
        })}
      </div>

      <div id="ladder-panel" role="tabpanel" aria-labelledby={`ladder-tab-${stage}`} className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="font-mono text-xs text-muted-foreground">
          Stage {active + 1} of {STAGES.length}
        </p>
        <h3 className="font-display mt-2 text-3xl font-medium">
          <span className="mr-2 inline-block size-3 rounded-full align-middle" style={{ background: `var(--stage-${stage})` }} aria-hidden />
          {meta.label}
        </h3>
        <p className="mt-3 text-muted-foreground">{meta.description}</p>
        {meta.requires.length > 0 && (
          <ul className="mt-5 grid gap-2.5">
            {meta.requires.map((r) => (
              <li key={r} className="flex gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="font-medium">{CHECK_META[r].label}</span>
                  <span className="text-muted-foreground">: {CHECK_META[r].description}</span>
                </span>
              </li>
            ))}
            {stage === "peeps_ready" && (
              <li className="flex gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  <span className="font-medium">Classification</span>
                  <span className="text-muted-foreground">: Entry, Competent, Experienced or Specialist, with a written rationale.</span>
                </span>
              </li>
            )}
          </ul>
        )}
        <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">Every rung requires recorded evidence. Uploading a CV never earns a badge.</p>
      </div>
    </div>
  );
}
