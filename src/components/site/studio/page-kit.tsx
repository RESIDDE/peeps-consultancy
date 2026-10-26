import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlurHeading } from "./blur-heading";

/**
 * The landing page's vocabulary, factored out so every other page is set in the same
 * language: fixed dark and light runs, display type at size, small uppercase labels,
 * hairline rules, and numbers carried in the margin.
 *
 * The landing page keeps its own bespoke sections — these are the parts that repeat.
 */

/** The twelve-column indent the landing page sets its section headings on. */
export const INDENT = "lg:pl-[calc((100vw-2*var(--shell))/12)]";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One run of fixed tone. Like the landing page, a page sets its tone per run rather than
 * following the theme, so the rhythm of dark and light is the same for every reader. The
 * nav reads `data-tone` off whatever sits under it to pick its own colours.
 */
export function Tone({
  tone,
  className,
  children,
}: {
  tone: "dark" | "light";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-tone={tone} className={cn(tone === "dark" ? "tone-dark haze" : "tone-light wash", className)}>
      {children}
    </div>
  );
}

/** A section on the site's vertical rhythm, with room for the fixed nav when linked to. */
export function Block({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("scroll-mt-[var(--nav-h)] py-24 md:py-32", className)}>
      {children}
    </section>
  );
}

/**
 * The first screen of every page: the section name ruled across the top, the title at
 * display size, and the figures that matter carried along the bottom, as the hero carries
 * its own. It opens on a dark run, so the nav keeps the colours it starts the site with.
 */
export function PageOpening({
  label,
  title,
  lede,
  actions,
  facts,
  children,
}: {
  label: string;
  title: string;
  lede?: string;
  actions?: React.ReactNode;
  facts?: readonly { value: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="shell relative flex min-h-[80svh] flex-col pb-14 pt-[calc(var(--nav-h)+3rem)]">
      <p className="label flex items-center gap-6 text-muted-foreground">
        {label}
        <span aria-hidden className="h-px flex-1 bg-border" />
      </p>

      <h1 className="display mt-12 max-w-[13ch]">{title}</h1>

      {(lede || actions) && (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-x-16">
          {lede ? <p className="lede">{lede}</p> : <span className="hidden lg:block" />}
          {actions && <div className="flex flex-wrap gap-x-8 gap-y-5">{actions}</div>}
        </div>
      )}

      {children}

      {facts && (
        <ul className="mt-auto grid gap-x-10 gap-y-8 pt-20 sm:grid-cols-3">
          {facts.map((f) => (
            <li key={f.label} className="hairline pt-5">
              <p className="font-display text-[clamp(1.75rem,3vw,2.6rem)] leading-none tracking-[-0.06em]">{f.value}</p>
              <p className="mt-3 max-w-[26ch] text-[0.9rem] leading-snug text-muted-foreground">{f.label}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * A section heading: the label above, the heading resolving out of its blur as it rises,
 * and a short lede set against it on the right.
 */
export function SectionHead({
  id,
  label,
  title,
  lede,
  className,
}: {
  id?: string;
  label?: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <div className={cn("shell grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-x-14", className)}>
      <div className={INDENT}>
        {label && <p className="label text-muted-foreground">{label}</p>}
        <BlurHeading id={id} text={title} className={cn("headline", label && "mt-7")} />
      </div>
      {lede && <p className="max-w-[30ch] text-[0.95rem] leading-snug">{lede}</p>}
    </div>
  );
}

/** A centred rule with a mark at its middle: a plus to open a stretch, a cross to close it. */
export function MarkRule({ className, mark = "plus" }: { className?: string; mark?: "plus" | "cross" }) {
  return (
    <div aria-hidden className={cn("relative mx-auto h-px bg-border", className)}>
      <span
        className={cn(
          "absolute left-1/2 top-1/2 size-[13px] -translate-x-1/2 -translate-y-1/2",
          mark === "cross" && "rotate-45",
        )}
      >
        <span className="absolute left-1/2 top-0 h-full w-px bg-foreground/70" />
        <span className="absolute left-0 top-1/2 h-px w-full bg-foreground/70" />
      </span>
    </div>
  );
}

export type IndexItem = { title: string; body?: string; note?: string; href?: string };

/**
 * A numbered index: rules across the page, the count in the margin, the name set at
 * subhead size and the detail held in the third column. The site's workhorse list.
 */
export function IndexRows({
  items,
  start = 1,
  className,
}: {
  items: readonly IndexItem[];
  start?: number;
  className?: string;
}) {
  return (
    <ol className={cn("shell", className)}>
      {items.map((item, i) => (
        <li key={item.title} className="hairline last:border-b">
          {item.href ? (
            <Link href={item.href} className="group block">
              <RowBody item={item} n={i + start} linked />
            </Link>
          ) : (
            <RowBody item={item} n={i + start} />
          )}
        </li>
      ))}
    </ol>
  );
}

function RowBody({ item, n, linked }: { item: IndexItem; n: number; linked?: boolean }) {
  return (
    <div className="grid items-baseline gap-x-8 gap-y-3 py-7 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.45fr)] md:py-9">
      <span className="label text-muted-foreground">{pad(n)}</span>
      <h3 className={cn("subhead flex items-start gap-3", linked && "transition-opacity duration-300 group-hover:opacity-60")}>
        {item.title}
        {linked && (
          <ArrowUpRight
            aria-hidden
            className="mt-1 size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        )}
      </h3>
      <div>
        {item.body && <p className="text-[0.95rem] leading-snug text-muted-foreground">{item.body}</p>}
        {item.note && <p className="label mt-4 text-muted-foreground">{item.note}</p>}
      </div>
    </div>
  );
}

/** Term and standard, ruled: the shape the quality framework and the legal pages want. */
export function SpecRows({
  items,
  className,
}: {
  items: readonly { term: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("shell", className)}>
      {items.map((row) => (
        <div key={row.term} className="hairline grid gap-x-8 gap-y-1 py-5 last:border-b sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <dt className="text-[1.05rem]">{row.term}</dt>
          <dd className="label text-muted-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A bordered panel. Sharp-cornered and ruled, in the manner of the hero's instrument face. */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[7px] border border-border p-7 md:p-8", className)}>{children}</div>;
}

/** Short items set as ruled boxes: roles, skills, whatever a page needs to list flat. */
export function Boxes({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li key={item} className="label border border-border px-4 py-2.5 text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * A single sentence at headline size, standing alone on the page. The landing page opens
 * with one; the inside pages use them to turn a section.
 */
export function Pronouncement({
  children,
  foot,
  className,
}: {
  children: React.ReactNode;
  foot?: React.ReactNode;
  className?: string;
}) {
  return (
    <Block className={className}>
      <div className="shell">
        <p className={cn("headline max-w-[19ch]", INDENT)}>{children}</p>
        {foot && <div className={cn("mt-16 max-w-[40ch]", INDENT)}>{foot}</div>}
      </div>
    </Block>
  );
}

/**
 * A form, with the ask held beside it. The heading stays put while the form scrolls, so
 * the reason for filling it in is still on screen at the submit button.
 */
export function FormBlock({
  id,
  label,
  title,
  lede,
  aside,
  children,
}: {
  id?: string;
  label: string;
  title: string;
  lede?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Block id={id}>
      <div className="shell grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-x-16">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
          <p className="label text-muted-foreground">{label}</p>
          <h2 className="headline mt-7 text-[clamp(2rem,3.4vw,3rem)]">{title}</h2>
          {lede && <p className="mt-7 max-w-[32ch] text-[0.95rem] leading-snug text-muted-foreground">{lede}</p>}
          {aside}
        </div>
        <Panel className="p-6 md:p-9">{children}</Panel>
      </div>
    </Block>
  );
}

/**
 * Where to go next, set as the full-screen menu sets its links: dimmed until wanted, with
 * a note alongside saying what is behind the word.
 */
export function MoreLinks({
  label,
  items,
}: {
  label: string;
  items: readonly { href: string; label: string; note?: string }[];
}) {
  return (
    <Block>
      <nav aria-label={label} className="shell">
        <p className="label text-muted-foreground">{label}</p>
        <ul className="mt-10">
          {items.map((item) => (
            <li key={item.href} className="hairline last:border-b">
              <Link href={item.href} className="group flex items-end justify-between gap-6 py-4">
                <span className="font-display text-[clamp(1.9rem,4.2vw,3.4rem)] leading-[1.05] tracking-[-0.06em] text-foreground/35 transition-colors duration-300 group-hover:text-foreground">
                  {item.label}
                </span>
                {item.note && <span className="label hidden shrink-0 pb-2 text-muted-foreground sm:block">{item.note}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Block>
  );
}
