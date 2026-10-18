import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroPanel, PageHero, Section } from "@/components/site/section";
import { Badge } from "@/components/ui/badge";
import { VERTICALS } from "@/lib/content";

export const metadata: Metadata = { title: "Sectors", description: "PEEPs talent verticals and pools." };

export default function SectorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Sectors"
        title="Deep talent pools, not a catch-all database."
        lead="Each vertical has its own talent pool, its own assessment criteria and its own partner network."
        aside={
          <HeroPanel title="Talent pools">
            {[
              { label: "Launch verticals", items: VERTICALS.filter((v) => v.launch) },
              { label: "Growing pools", items: VERTICALS.filter((v) => !v.launch) },
            ].map((group) => (
              <div key={group.label} className="mb-5 last:mb-0">
                <p className="text-sm text-muted-foreground">{group.label}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((v) => (
                    <li key={v.slug}>
                      <Link href={`/sectors/${v.slug}`} className="inline-flex min-h-9 items-center rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
                        {v.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </HeroPanel>
        }
      />
      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          {VERTICALS.map((v) => (
            <Link key={v.slug} href={`/sectors/${v.slug}`} className="group flex flex-col rounded-3xl border bg-card p-8 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <Badge variant={v.launch ? "solid" : "muted"}>{v.launch ? "Launch vertical" : "Growing pool"}</Badge>
                <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <h2 className="font-display mt-5 text-3xl font-medium">{v.name}</h2>
              <p className="mt-3 text-muted-foreground">{v.blurb}</p>
              <ul className="mt-6 flex flex-wrap gap-1.5">
                {v.roles.map((r) => (
                  <li key={r} className="rounded-full bg-muted px-3 py-1 text-xs">{r}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
