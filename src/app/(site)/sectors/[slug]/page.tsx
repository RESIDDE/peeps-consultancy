import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardCheck, Lightbulb } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { buttonVariants } from "@/components/ui/button";
import { VERTICALS } from "@/lib/content";
import { SECTOR_BY_CODE } from "@/lib/taxonomy";

export function generateStaticParams() {
  return VERTICALS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = VERTICALS.find((x) => x.slug === slug);
  return v ? { title: `${v.name} Talent`, description: v.blurb } : {};
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = VERTICALS.find((x) => x.slug === slug);
  if (!v) notFound();

  return (
    <>
      <PageHero eyebrow={v.launch ? "Launch vertical" : "Growing talent pool"} title={`${v.name} talent`} lead={v.blurb}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/employers#request" className={buttonVariants({ size: "lg" })}>
            Request {v.name.toLowerCase()} talent <ArrowRight />
          </Link>
          <Link href="/register/candidate" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Join this talent pool
          </Link>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SectionHeading eyebrow="Roles we place" title="Who you'll find in this pool." />
            <ul className="mt-8 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2">
              {v.roles.map((r) => (
                <li key={r} className="bg-card px-5 py-4 font-medium">{r}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Talent categories: {v.sectors.map((c) => SECTOR_BY_CODE[c].name).join(" · ")}
            </p>
          </div>
          <div className="grid content-start gap-4">
            <div className="rounded-3xl bg-ink p-7 text-ink-foreground">
              <Lightbulb className="size-6 text-gold" />
              <h3 className="font-display mt-4 text-2xl font-medium">Why PEEPs for {v.name.toLowerCase()}</h3>
              <p className="mt-3 leading-relaxed text-white/75">{v.why}</p>
            </div>
            <div className="rounded-3xl border bg-card p-7">
              <ClipboardCheck className="size-6 text-primary" />
              <h3 className="font-display mt-4 text-2xl font-medium">What we assess</h3>
              <ul className="mt-4 grid gap-2">
                {v.assessment.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-gold" /> {a}
                  </li>
                ))}
              </ul>
              <Link href="/how-we-select" className={buttonVariants({ variant: "link", className: "mt-4" })}>
                Full methodology <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
