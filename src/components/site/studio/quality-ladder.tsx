"use client";

import { useRef, useState } from "react";
import { CHECK_META, STAGES, STAGE_META } from "@/lib/quality";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The seven rungs from Registered to Placed, as a stepped rail: each bar stands a little
 * taller than the one before it, the rungs already earned are solid, the rest are outlines,
 * and the rung being read is picked out in the accent. The evidence each one needs is set
 * beside it.
 *
 * The stage colours the portal uses are deliberately not carried over — inside the studio
 * scope the page has one accent, and a seven-step emerald ramp would read as decoration.
 */
export function StudioQualityLadder() {
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
    <div className="grid gap-14 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-12">
      <div
        role="tablist"
        aria-label="The PEEPs quality ladder"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="flex flex-col gap-1.5 sm:h-[22rem] sm:flex-row sm:items-end sm:gap-2"
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
              id={`rung-${s}`}
              aria-selected={on}
              aria-controls="rung-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className="group flex min-w-0 cursor-pointer items-center gap-4 text-left focus-visible:outline-none sm:h-full sm:flex-1 sm:flex-col sm:items-stretch sm:gap-0"
              style={{ "--rung": `${30 + i * 11}%` } as React.CSSProperties}
            >
              {/* A row that grows rightwards on phones, a column that stands up from sm. */}
              <span className="order-2 h-10 min-w-0 flex-1 sm:order-1 sm:flex sm:h-auto sm:min-h-0 sm:items-end">
                <span
                  className={cn(
                    "flex h-full w-(--rung) items-center justify-end border px-3 transition-colors duration-300 sm:h-(--rung) sm:w-full sm:items-start sm:justify-center sm:px-0 sm:pt-3",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : reached
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground",
                    "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring",
                  )}
                >
                  <span aria-hidden className="label text-[0.7rem]">
                    {pad(i + 1)}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  "label order-1 w-32 shrink-0 transition-colors duration-300 sm:order-2 sm:mt-3 sm:w-auto sm:truncate sm:text-[0.7rem]",
                  on ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STAGE_META[s].label}
              </span>
            </button>
          );
        })}
      </div>

      <div id="rung-panel" role="tabpanel" aria-labelledby={`rung-${stage}`} aria-live="polite">
        <p className="label text-muted-foreground">
          Rung {pad(active + 1)} / {pad(STAGES.length)}
        </p>
        <h3 className="subhead mt-5">{meta.label}</h3>
        <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-snug text-muted-foreground">{meta.description}</p>

        {meta.requires.length > 0 && (
          <>
            <p className="label mt-10 border-t border-border pt-5 text-muted-foreground">Evidence required</p>
            <ul className="mt-5 grid gap-4">
              {meta.requires.map((r) => (
                <li key={r} className="text-[0.95rem] leading-snug">
                  <span className="label">{CHECK_META[r].label}</span>
                  <span className="block text-muted-foreground">{CHECK_META[r].description}</span>
                </li>
              ))}
              {stage === "peeps_ready" && (
                <li className="text-[0.95rem] leading-snug">
                  <span className="label">Classification</span>
                  <span className="block text-muted-foreground">
                    Entry, Competent, Experienced or Specialist, with a written rationale.
                  </span>
                </li>
              )}
            </ul>
          </>
        )}

        <p className="label mt-10 border-t border-border pt-5 text-muted-foreground">
          Uploading a CV never earns a badge.
        </p>
      </div>
    </div>
  );
}
