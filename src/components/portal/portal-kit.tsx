import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Centered rule with a cross or plus in the middle, mirroring the studio landing page.
 */
export function PortalMarkRule({
  className,
  mark = "plus",
}: {
  className?: string;
  mark?: "plus" | "cross";
}) {
  return (
    <div aria-hidden className={cn("relative mx-auto h-px bg-border", className)}>
      <span
        className={cn(
          "absolute left-1/2 top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2",
          mark === "cross" && "rotate-45",
        )}
      >
        <span className="absolute left-1/2 top-0 h-full w-px bg-foreground/60" />
        <span className="absolute left-0 top-1/2 h-px w-full bg-foreground/60" />
      </span>
    </div>
  );
}

/**
 * Standard studio page header for portal dashboards:
 * Uppercase tracking label with a hairline extension, display-scale title,
 * contextual lede, and optional primary action buttons.
 */
export function PortalPageHeader({
  label,
  title,
  lede,
  actions,
  className,
}: {
  label: string;
  title: string;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-10", className)}>
      <p className="label flex items-center gap-4 text-muted-foreground">
        <span>{label}</span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-[clamp(2.4rem,4.5vw,4rem)] font-normal leading-[0.95] tracking-[-0.055em] text-foreground">
            {title}
          </h1>
          {lede && (
            <div className="mt-3.5 max-w-[55ch] text-[0.95rem] leading-relaxed text-muted-foreground">
              {lede}
            </div>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Studio-style metric card, styled in the manner of the landing page Key Facts:
 * zero-padded index, uppercase label, display numeral, operational note, and explicit action prompt.
 */
export function PortalStatCard({
  index,
  label,
  value,
  note,
  actionLabel,
  guide,
  tone = "default",
  href,
  className,
}: {
  index?: number;
  label: string;
  value: React.ReactNode;
  note?: string;
  actionLabel?: string;
  guide?: string;
  tone?: "default" | "accent" | "dark";
  href?: string;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "group relative flex h-full flex-col justify-between rounded-[7px] border p-6 transition-all duration-300 md:p-7",
        tone === "accent"
          ? "border-primary/40 bg-primary/10 text-foreground"
          : tone === "dark"
            ? "border-foreground/15 bg-ink text-ink-foreground shadow-inner"
            : "border-border bg-card/60 backdrop-blur-xs hover:border-foreground/30",
        href && "cursor-pointer hover:shadow-sm",
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="label text-[0.78rem] text-muted-foreground">
            {label}
          </span>
          {typeof index === "number" && (
            <span className="font-mono text-[0.72rem] text-muted-foreground/70">
              {pad(index)}
            </span>
          )}
        </div>

        <div className="my-5">
          <div className="font-display text-[clamp(2.6rem,4vw,3.6rem)] font-normal leading-[0.92] tracking-[-0.06em]">
            {value}
          </div>
        </div>

        {note && (
          <p className="text-[0.82rem] leading-snug text-muted-foreground">
            {note}
          </p>
        )}

        {guide && (
          <p className="mt-2 font-mono text-[0.72rem] text-muted-foreground/80 border-t border-border/40 pt-2">
            ℹ️ {guide}
          </p>
        )}
      </div>

      {actionLabel && (
        <div className="mt-5 border-t border-border/60 pt-3 flex items-center justify-between font-mono text-xs text-primary group-hover:text-foreground transition-colors">
          <span>{actionLabel}</span>
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      )}

      {href && !actionLabel && (
        <ArrowUpRight
          aria-hidden
          className="absolute right-5 top-5 size-4 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 text-muted-foreground"
        />
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

/**
 * Studio-styled panel: sharp 7px corners, hairline borders, clean header with optional action
 * and contextual operational guide for new users.
 */
export function PortalPanel({
  title,
  label,
  description,
  actions,
  actionGuide,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  label?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  actionGuide?: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[7px] border border-border bg-card/65 backdrop-blur-xs transition-colors",
        className,
      )}
    >
      {(title || label || actions) && (
        <div className="flex flex-col gap-2 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {label && (
              <p className="label mb-1 text-[0.75rem] text-muted-foreground">
                {label}
              </p>
            )}
            {title && (
              <h2 className="font-display text-[1.25rem] font-normal leading-tight tracking-[-0.03em] text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-[0.85rem] text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {actionGuide && (
        <div className="flex items-start gap-2.5 border-b border-border/60 bg-muted/20 px-6 py-2.5 font-mono text-[11px] text-muted-foreground">
          <span className="font-semibold uppercase tracking-wider text-primary shrink-0">
            Guide:
          </span>
          <span className="leading-snug">{actionGuide}</span>
        </div>
      )}

      <div className={cn("p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/**
 * Candidate Quality Ladder visualization adapted directly from the Studio Landing Page.
 * Renders the 7 rungs of verification with candidate current position, earned rungs,
 * and upcoming rungs.
 */
import { STAGES, STAGE_META, stageIndex, type Stage } from "@/lib/quality";

export function PortalCandidateLadder({ currentStage }: { currentStage: string }) {
  const currentIndex = stageIndex(currentStage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="label text-[0.78rem] text-muted-foreground">
          7-Step Verification Ramp
        </p>
        <span className="font-mono text-xs text-primary font-medium">
          Rung {pad(currentIndex + 1)} of {pad(STAGES.length)} · {STAGE_META[currentStage as Stage]?.label ?? currentStage}
        </span>
      </div>

      {/* Visual stepped rail */}
      <div className="grid grid-cols-7 items-end gap-1.5 sm:gap-2 h-28 pt-2" aria-hidden>
        {STAGES.map((s, i) => {
          const reached = i <= currentIndex;
          const current = i === currentIndex;
          const heightPercent = 30 + i * 11;

          return (
            <div key={s} className="flex h-full flex-col items-center justify-end">
              <div
                className={cn(
                  "w-full rounded-[3px] border transition-all duration-300 relative",
                  current
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : reached
                      ? "border-foreground/80 bg-foreground/90 text-background"
                      : "border-border/60 bg-muted/40 text-muted-foreground",
                )}
                style={{ height: `${heightPercent}%` }}
              >
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-semibold">
                  {pad(i + 1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step listings with evidence notes */}
      <ol className="divide-y divide-border/60 border-t border-border/60">
        {STAGES.map((s, i) => {
          const reached = i <= currentIndex;
          const current = i === currentIndex;
          const meta = STAGE_META[s];

          return (
            <li
              key={s}
              className={cn(
                "flex items-start gap-4 py-3.5 transition-colors",
                current ? "bg-primary/[0.04] px-3 -mx-3 rounded-[5px]" : "opacity-90",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-[4px] border font-mono text-[11px] font-semibold",
                  current
                    ? "border-primary bg-primary text-primary-foreground"
                    : reached
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground",
                )}
              >
                {pad(i + 1)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "font-display text-[0.95rem] tracking-[-0.02em]",
                      reached ? "text-foreground font-medium" : "text-muted-foreground",
                    )}
                  >
                    {meta.label}
                  </span>
                  {current && (
                    <span className="label rounded-[3px] border border-primary/40 bg-primary/10 px-2 py-0.5 text-[0.68rem] text-primary">
                      Current Stage
                    </span>
                  )}
                  {reached && !current && (
                    <span className="label rounded-[3px] border border-foreground/20 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                      Evidenced
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[0.82rem] leading-snug text-muted-foreground">
                  {meta.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Status Tag in the Studio style: clean border, dot indicator, uppercase text.
 */
export function PortalTag({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "accent" | "muted" | "solid";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-[0.72rem] font-medium uppercase tracking-wider font-mono",
        variant === "primary" && "border-primary/40 bg-primary/10 text-primary",
        variant === "accent" && "border-gold/40 bg-gold/10 text-gold-foreground dark:text-gold",
        variant === "solid" && "border-foreground bg-foreground text-background",
        variant === "muted" && "border-border bg-muted/50 text-muted-foreground",
        variant === "default" && "border-border bg-card text-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full shrink-0",
          variant === "primary" && "bg-primary",
          variant === "accent" && "bg-gold",
          variant === "solid" && "bg-background",
          variant === "muted" && "bg-muted-foreground",
          variant === "default" && "bg-foreground/60",
        )}
      />
      {children}
    </span>
  );
}
