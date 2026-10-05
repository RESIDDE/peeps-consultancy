export type ValueFormat = "number" | "naira";

const compact = new Intl.NumberFormat("en-NG", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en-NG");

export function formatValue(v: number, format: ValueFormat, short = false): string {
  if (format === "naira") return short ? `₦${compact.format(v)}` : `₦${full.format(v)}`;
  return short ? compact.format(v) : full.format(v);
}

/** Clean, round tick values from 0 to just above max (≈4 intervals). */
export function niceTicks(max: number, target = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const ticks: number[] = [];
  for (let t = 0; t < max + step * 0.001; t += step) ticks.push(Math.round(t * 1e6) / 1e6);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}
