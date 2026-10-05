import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
  tone = "default",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "muted" | "ink";
}) {
  return (
    <section
      id={id}
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
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden border-b">
      <div className="dotgrid absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <div className="container-page py-16 sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-4 max-w-4xl text-balance text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {lead && <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
