import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
  tone = "default",
  chapter,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "muted" | "ink";
  /** Name shown by the chapter rail and the top indicator while this section is on screen. */
  chapter?: string;
}) {
  return (
    <section
      id={id}
      data-chapter={chapter}
      className={cn(
        "scroll-mt-20 py-20 sm:py-28",
        tone === "muted" && "bg-muted/60",
        tone === "ink" && "grain relative overflow-hidden bg-ink text-ink-foreground",
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  onDark,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  onDark?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("eyebrow", onDark && "text-gold")}>{eyebrow}</p>}
      <h2 className="font-display mt-3 text-balance text-3xl font-medium leading-[1.1] sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {lead && (
        <p className={cn("mt-5 text-pretty text-lg leading-relaxed", onDark ? "text-white/70" : "text-muted-foreground")}>
          {lead}
        </p>
      )}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  /** Optional panel beside the heading on large screens (below it on phones), e.g. <HeroFacts>. */
  aside?: React.ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden border-b">
      <div className="dotgrid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <div className={cn("container-page py-14 sm:py-20 lg:py-24", aside && "grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-16")}>
        <div className="anim-rise">
          <p className="eyebrow">{eyebrow}</p>
          <h1
            className={cn(
              "font-display mt-4 max-w-4xl text-balance text-4xl font-medium leading-[1.05] sm:text-5xl",
              aside ? "lg:text-[3.25rem] xl:text-6xl" : "lg:text-6xl",
            )}
          >
            {title}
          </h1>
          {lead && <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">{lead}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {aside && <div className="anim-rise [animation-delay:120ms]">{aside}</div>}
      </div>
    </section>
  );
}

/** Card for a PageHero aside: a small uppercase title over any content. */
export function HeroPanel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border bg-card/85 p-6 shadow-sm backdrop-blur-sm sm:p-7", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

/** Three or so headline facts for a PageHero aside. Only use facts the page itself states. */
export function HeroFacts({
  title = "At a glance",
  items,
}: {
  title?: string;
  items: { icon: LucideIcon; value: string; label: string }[];
}) {
  return (
    <HeroPanel title={title}>
      <dl className="grid gap-5">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={value} className="flex items-start gap-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col-reverse">
              <dt className="mt-0.5 text-sm text-muted-foreground">{label}</dt>
              <dd className="font-display text-xl font-medium leading-tight">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </HeroPanel>
  );
}
