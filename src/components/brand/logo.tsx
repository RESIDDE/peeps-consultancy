import { cn } from "@/lib/utils";

/**
 * The PEEPs wordmark, painted with `currentColor` through a mask rather than swapped
 * between a black file and a white one.
 *
 * The swap keyed off the theme, which is only one of the things that decides whether the
 * surface under the mark is light or dark. X-ray inverts the page without touching the
 * theme class, and the footer, console sidebar and auth panel are dark in either theme —
 * so a theme-keyed swap shows a black mark on a black ground in several real cases.
 * Taking the colour from the text colour is right in all of them, and halves the bytes.
 */
export function Logo({
  className,
  compact = false,
  tone = "auto",
}: {
  className?: string;
  /** Slightly smaller, for tight chrome. */
  compact?: boolean;
  /** `onDark` pins it white for a surface that sets no text colour of its own. */
  tone?: "auto" | "onDark";
}) {
  return (
    <span
      role="img"
      aria-label="PEEPs"
      className={cn("peeps-wordmark", compact ? "h-5" : "h-6", tone === "onDark" && "text-white", className)}
    />
  );
}
