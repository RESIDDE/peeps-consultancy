"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatValue, niceTicks, type ValueFormat } from "./scale";

/**
 * Single-series column chart: ≤24px columns with a 4px rounded data-end,
 * hairline solid grid, the latest value direct-labelled, and a per-column
 * hover/focus tooltip. A table twin is rendered by <ChartTable>.
 */
export function ColumnChart({
  data,
  format = "number",
  title,
  height = 200,
}: {
  data: { label: string; value: number }[];
  format?: ValueFormat;
  title: string;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0));
  const top = ticks[ticks.length - 1] || 1;
  const last = data.length - 1;

  return (
    <figure aria-label={title} className="w-full">
      <div className="relative flex" style={{ height: height + 24 }}>
        {/* y axis */}
        <div className="relative w-12 shrink-0" style={{ height }} aria-hidden>
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-2 text-[10px] tabular-nums text-muted-foreground"
              style={{ bottom: `${(t / top) * 100}%`, transform: "translateY(50%)" }}
            >
              {formatValue(t, format, true)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {/* grid */}
          <div className="absolute inset-x-0 top-0" style={{ height }} aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="absolute inset-x-0 h-px bg-border" style={{ bottom: `${(t / top) * 100}%` }} />
            ))}
          </div>
          {/* columns */}
          <div className="absolute inset-x-0 top-0 flex items-end" style={{ height }}>
            {data.map((d, i) => {
              const pct = (d.value / top) * 100;
              const on = active === i;
              return (
                <button
                  key={d.label}
                  type="button"
                  className="group relative flex h-full flex-1 cursor-default items-end justify-center focus-visible:outline-none"
                  aria-label={`${d.label}: ${formatValue(d.value, format)}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  <span
                    className={cn(
                      "block w-[min(24px,60%)] rounded-t-[4px] transition-[filter] duration-150",
                      on && "brightness-110",
                      "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-card",
                    )}
                    style={{ height: `${pct}%`, background: "var(--chart-1)", minHeight: d.value > 0 ? 2 : 0 }}
                  />
                  {i === last && !on && d.value > 0 && (
                    <span
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-foreground"
                      style={{ bottom: `calc(${pct}% + 4px)` }}
                    >
                      {formatValue(d.value, format, true)}
                    </span>
                  )}
                  {on && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-popover px-2.5 py-1.5 text-left shadow-lg"
                      style={{ bottom: `calc(${Math.min(pct, 85)}% + 8px)` }}
                    >
                      <span className="block text-sm font-semibold text-foreground">{formatValue(d.value, format)}</span>
                      <span className="block text-[11px] text-muted-foreground">{d.label}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* x axis */}
          <div className="absolute inset-x-0 flex" style={{ top: height + 6 }} aria-hidden>
            {data.map((d) => (
              <span key={d.label} className="flex-1 truncate text-center text-[10px] text-muted-foreground">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
