"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { CHECK_META, STAGES, STAGE_META } from "@/lib/quality";
import { cn } from "@/lib/utils";

/** Interactive Registered → Placed staircase with the evidence each rung needs. */
export function QualityLadder() {
  const [active, setActive] = useState(2);
  const stage = STAGES[active];
  const meta = STAGE_META[stage];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
      <div className="flex h-72 items-end gap-1.5 sm:h-80 sm:gap-3" role="tablist" aria-label="PEEPs quality ladder">
        {STAGES.map((s, i) => {
          const on = i === active;
          const reached = i <= active;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="ladder-panel"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className="group relative flex h-full flex-1 flex-col justify-end focus-visible:outline-none"
            >
              <span
                className={cn(
                  "reveal-grow relative block w-full rounded-t-xl transition-opacity duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ring",
                  reached ? "opacity-100" : "opacity-30",
                  on && "shadow-lg",
                )}
                style={{ background: `var(--stage-${s})`, height: `${28 + i * 12}%` }}
              >
                <span className="absolute inset-x-0 top-2 text-center font-mono text-[10px] font-semibold text-white/90 sm:text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span
                className={cn(
                  "mt-2 block truncate text-center text-[10px] font-medium sm:text-xs",
                  on ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STAGE_META[s].label}
              </span>
            </button>
          );
        })}
      </div>

      <div id="ladder-panel" role="tabpanel" className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="font-mono text-xs text-muted-foreground">Stage {active + 1} of {STAGES.length}</p>
        <h3 className="font-display mt-2 text-3xl font-medium">
          <span className="mr-2 inline-block size-3 rounded-full align-middle" style={{ background: `var(--stage-${stage})` }} />
          {meta.label}
        </h3>
        <p className="mt-3 text-muted-foreground">{meta.description}</p>
        {meta.requires.length > 0 && (
          <ul className="mt-5 grid gap-2.5">
            {meta.requires.map((r) => (
              <li key={r} className="flex gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="font-medium">{CHECK_META[r].label}</span>
                  <span className="text-muted-foreground">: {CHECK_META[r].description}</span>
                </span>
              </li>
            ))}
            {stage === "peeps_ready" && (
              <li className="flex gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="font-medium">Classification</span>
                  <span className="text-muted-foreground">: Entry, Competent, Experienced or Specialist, with a written rationale.</span>
                </span>
              </li>
            )}
          </ul>
        )}
        <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">
          Every rung requires recorded evidence. Uploading a CV never earns a badge.
        </p>
      </div>
    </div>
  );
}
