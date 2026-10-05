import { cn } from "@/lib/utils";
import { formatValue, type ValueFormat } from "./scale";

/**
 * Horizontal single-series bars, value at the tip. An optional swatch beside
 * the label carries identity (e.g. a quality stage) — text stays in ink.
 */
export function BarList({
  data,
  format = "number",
  className,
}: {
  data: { label: string; value: number; swatch?: string; hint?: string }[];
  format?: ValueFormat;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className={cn("grid gap-2.5", className)}>
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            {d.swatch && <span className="size-2 shrink-0 rounded-full" style={{ background: d.swatch }} />}
            <span className="truncate text-muted-foreground" title={d.hint ?? d.label}>
              {d.label}
            </span>
          </span>
          <span className="flex items-center gap-2" aria-label={`${d.label}: ${formatValue(d.value, format)}`}>
            <span
              className="block h-3.5 rounded-r-[4px]"
              style={{ width: `${(d.value / max) * 85}%`, minWidth: d.value > 0 ? 3 : 0, background: "var(--chart-1)" }}
            />
            <span className="shrink-0 text-xs font-semibold tabular-nums">{formatValue(d.value, format, format === "naira")}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
