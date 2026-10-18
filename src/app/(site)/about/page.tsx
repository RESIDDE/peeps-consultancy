import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroPanel, PageHero, Section, SectionHeading } from "@/components/site/section";
import { Lifecycle } from "@/components/site/lifecycle";
import { numberWord } from "@/lib/format";
import { COMPANY, DIVISIONS, ROADMAP, VALUES } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "Vision, mission, values and roadmap of PEEPs.HR Partners." };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About PEEPs"
        title={
          <>
            A workforce partner, <span className="italic text-primary">built on systems.</span>
          </>
        }
        lead={COMPANY.positioning}
        aside={
          <HeroPanel title={`One partner, ${numberWord(DIVISIONS.length)} divisions`}>
            <ul className="-mx-3 grid">
              {DIVISIONS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/services/${d.slug}`} className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted">
                    <span className="min-w-0">
                      <span className="block font-medium">{d.name}</span>
                      <span className="block truncate text-sm text-muted-foreground">{d.kicker}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </HeroPanel>
        }
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-ink p-8 text-ink-foreground sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Vision</p>
            <p className="font-display mt-4 text-2xl leading-snug sm:text-3xl">
              When an organisation needs people, training or professional support, PEEPs is one of the first calls it makes. When a
              professional wants to grow, PEEPs is where they register.
            </p>
          </div>
          <div className="rounded-3xl border bg-card p-8 sm:p-10">
            <p className="eyebrow">Mission</p>
            <p className="font-display mt-4 text-2xl leading-snug sm:text-3xl">
              To identify, screen, assess and prepare talent, and connect it with employers through a process that both sides can trust.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            eyebrow="Our story"
            title="Experience turned into method."
            lead="PEEPs was founded by a finance and business leader whose career spans CFO responsibilities, HR, business development, internal audit, external-audit coordination and operations. That experience is a clear picture of what employers actually need."
          />
          <div className="grid content-start gap-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              Rather than build a firm that depends on one person&apos;s judgement, we have turned that experience into systems: a
              published methodology, a quality framework, sector-specific assessments and a structured talent registry.
            </p>
            <p>
              Our advantage starts with access. Through a professional training school we reach a pipeline of developing talent,
              and through our business and automobile networks we reach the employers who need it. PEEPs builds the bridge between
              the two and holds it to a standard.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="ink">
        <SectionHeading
          onDark
          eyebrow="The PEEPs model"
          title="Train → Assess → Prepare → Match → Deploy → Develop"
          lead="This isn't a recruitment agency bolted onto a database. It's a single loop that develops talent, proves it, places it, and uses employer feedback to improve the next cohort."
        />
        <div className="mt-14">
          <Lifecycle />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Values" title="What we hold ourselves to." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-3xl border bg-card p-6">
              <h3 className="font-display text-xl font-medium">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <SectionHeading onDark eyebrow="Roadmap" title="From credibility to a talent marketplace." />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {ROADMAP.map((r, i) => (
            <div key={r.phase} className={i === 0 ? "rounded-3xl bg-gold p-7 text-gold-foreground" : "rounded-3xl border border-white/10 p-7"}>
              <p className="font-mono text-xs opacity-70">
                {r.phase} · {r.window}
              </p>
              <h3 className="font-display mt-3 text-2xl font-medium">{r.title}</h3>
              <ul className={i === 0 ? "mt-4 grid gap-1.5 text-sm" : "mt-4 grid gap-1.5 text-sm text-white/70"}>
                {r.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {i === 0 && <p className="mt-5 inline-block rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold">We are here</p>}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
