import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero, Section } from "@/components/site/section";
import { buttonVariants } from "@/components/ui/button";
import { DIVISIONS } from "@/lib/content";

export const metadata: Metadata = { title: "Services", description: "PEEPs Talent, Academy, Professional and Workforce." };

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Four divisions. One talent ecosystem."
        lead="Whenever you need people, training or professional support, PEEPs should be one of the first calls you make."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/employers#request" className={buttonVariants({ size: "lg" })}>
            Request talent <ArrowRight />
          </Link>
          <Link href="/contact" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Talk to a consultant
          </Link>
        </div>
      </PageHero>
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {DIVISIONS.map((d) => (
            <Link key={d.slug} href={`/services/${d.slug}`} className="group rounded-3xl border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <p className="eyebrow">{d.kicker}</p>
                <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <h2 className="font-display mt-3 text-3xl font-medium">{d.name}</h2>
              <p className="mt-3 text-muted-foreground">{d.summary}</p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {d.services.map((s) => (
                  <li key={s.title} className="rounded-full bg-muted px-3 py-1 text-xs">
                    {s.title}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
