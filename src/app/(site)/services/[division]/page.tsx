import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { HeroPanel, PageHero, Section, SectionHeading } from "@/components/site/section";
import { EnquiryForm } from "@/components/site/forms";
import { buttonVariants } from "@/components/ui/button";
import { DIVISIONS } from "@/lib/content";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return DIVISIONS.map((d) => ({ division: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ division: string }> }): Promise<Metadata> {
  const { division } = await params;
  const d = DIVISIONS.find((x) => x.slug === division);
  return d ? { title: d.name, description: d.summary } : {};
}

const ENQUIRY_TYPE = { talent: "contact", academy: "academy", professional: "professional", workforce: "contact" } as const;

export default async function DivisionPage({ params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const d = DIVISIONS.find((x) => x.slug === division);
  if (!d) notFound();
  const others = DIVISIONS.filter((x) => x.slug !== d.slug);

  return (
    <>
      <PageHero
        eyebrow={d.kicker}
        title={d.name}
        lead={d.summary}
        aside={
          <HeroPanel title="What's included">
            <ol className="grid gap-3">
              {d.services.map((s, i) => (
                <li key={s.title} className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-medium">{s.title}</span>
                </li>
              ))}
            </ol>
          </HeroPanel>
        }
      >
        <p className="font-display max-w-2xl text-2xl italic text-primary">&ldquo;{d.lead}&rdquo;</p>
      </PageHero>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {d.services.map((s, i) => (
            <div key={s.title} className="rounded-3xl border bg-card p-7 sm:p-8">
              <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display mt-3 text-2xl font-medium">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 rounded-3xl bg-secondary/60 p-6">
          <span className="text-sm font-semibold">What clients get:</span>
          {d.outcomes.map((o) => (
            <span key={o} className="inline-flex items-center gap-1.5 text-sm">
              <Check className="size-4 text-primary" /> {o}
            </span>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading eyebrow="Get in touch" title={`Talk to us about ${d.name}.`} lead="A consultant will respond within one working day." />
            {d.slug === "talent" && (
              <Link href="/employers#request" className={cn(buttonVariants(), "mt-8")}>
                Or submit a talent request <ArrowRight />
              </Link>
            )}
          </div>
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <EnquiryForm type={ENQUIRY_TYPE[d.slug]} subjectPlaceholder={d.services[0].title} />
          </div>
        </div>
      </Section>

      <Section>
        <p className="eyebrow">Across the ecosystem</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {others.map((o) => (
            <Link key={o.slug} href={`/services/${o.slug}`} className="group rounded-3xl border p-6 hover:bg-card">
              <p className="text-xs text-muted-foreground">{o.kicker}</p>
              <p className="font-display mt-1 text-xl font-medium group-hover:text-primary">{o.name}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
