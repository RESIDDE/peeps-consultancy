const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-NG", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function naira(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return ngn.format(amount);
}

export function nairaCompact(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `₦${compact.format(amount)}`;
}

export function salaryRange(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null && max == null) return "Not stated";
  if (min != null && max != null) return `${nairaCompact(min)} – ${nairaCompact(max)}`;
  return nairaCompact(min ?? max);
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(d: Date | number | string | null | undefined): string {
  if (d == null) return "—";
  return dateFmt.format(new Date(d));
}

export function formatDateTime(d: Date | number | string | null | undefined): string {
  if (d == null) return "—";
  return dateTimeFmt.format(new Date(d));
}

export function relativeDays(d: Date | number | string | null | undefined): string {
  if (d == null) return "—";
  const days = Math.round((new Date(d).getTime() - Date.now()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function humanize(value: string | null | undefined): string {
  if (!value) return "—";
  const s = value.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isPast(d: Date | number | string | null | undefined): boolean {
  return d != null && new Date(d).getTime() < Date.now();
}

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** "four" for 4, for counts used in prose; larger numbers stay as digits. Pass `capital` at the start of a sentence. */
export function numberWord(n: number, capital = false): string {
  const word = NUMBER_WORDS[n] ?? String(n);
  return capital ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}
