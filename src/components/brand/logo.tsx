import { cn } from "@/lib/utils";

/**
 * The PEEPs mark: three people-dots on an arc — Talent, PEEPs, Employer —
 * with PEEPs (gold) as the bridge between them.
 */
export function LogoMark({ className, title = "PEEPs" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-8", className)} role="img" aria-label={title}>
      <rect width="40" height="40" rx="11" fill="var(--ink)" className="dark:fill-[var(--primary)]" />
      <path
        d="M10 26.5 Q20 8 30 26.5"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="dark:stroke-[var(--ink)]"
        opacity="0.9"
      />
      <circle cx="10" cy="26.5" r="4" fill="#f4f1ea" />
      <circle cx="30" cy="26.5" r="4" fill="#f4f1ea" />
      <circle cx="20" cy="16.5" r="5" fill="var(--gold)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] font-semibold tracking-tight">
          PEEP<span className="text-primary">s</span>
        </span>
        {!compact && (
          <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            .HR Partners
          </span>
        )}
      </span>
    </span>
  );
}
