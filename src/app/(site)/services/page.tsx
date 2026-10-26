import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CtaLine } from "@/components/site/studio/cta-line";
import { Block, MarkRule, MoreLinks, PageOpening, SectionHead, Tone } from "@/components/site/studio/page-kit";
import { WordMarquee } from "@/components/site/studio/word-marquee";
import { DIVISIONS, VERTICALS } from "@/lib/content";

export const metadata: Metadata = { title: "Services", description: "PEEPs Talent, Academy, Professional and Workforce." };

const pad = (n: number) => String(n).padStart(2, "0");
const SERVICE_COUNT = DIVISIONS.reduce((n, d) => n + d.services.length, 0);

export default function ServicesPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Services"
          title="Four divisions. One talent ecosystem."
          lede="Whenever you need people, training or professional support, PEEPs should be one of the first calls you make."
          actions={
            <>
              <CtaLine href="/employers#request">Request talent</CtaLine>
              <CtaLine href="/contact">Talk to a consultant</CtaLine>
            </>
          }
          facts={[
            { value: pad(DIVISIONS.length), label: "Divisions, held to one standard of evidence" },
            { value: pad(SERVICE_COUNT), label: "Services between them, from search to payroll" },
            { value: "One", label: "Point of contact, whichever of them you need" },
          ]}
        />

        <WordMarquee
          words={DIVISIONS.map((d) => d.name.replace(/^PEEPs\s+/, ""))}
          lead={
            <>
              One partner,
              <br />
              four divisions.
            </>
          }
          foot="✦ Hire, train, advise, deploy."
        />
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="What we do"
            title="Pick the division you need."
            lede="They share a registry, a methodology and a single point of contact. Most engagements start in one and grow into another."
          />

          <MarkRule className="mt-20 w-[60%] md:mt-24" />

          <ul className="shell mt-6">
            {DIVISIONS.map((d, i) => (
              <li key={d.slug} className="hairline last:border-b">
                <Link href={`/services/${d.slug}`} className="group block py-10 md:py-14">
                  <div className="grid gap-y-7 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.2fr)] md:gap-x-10">
                    <span className="label text-muted-foreground">{pad(i + 1)}</span>

                    <div>
                      <p className="label text-muted-foreground">{d.kicker}</p>
                      <h3 className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[0.95] tracking-[-0.06em] transition-opacity duration-300 group-hover:opacity-55">
                        {d.name}
                        <ArrowUpRight
                          aria-hidden
                          className="ml-3 inline size-[0.45em] align-middle transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                        />
                      </h3>
                      <p className="mt-6 max-w-[26ch] text-[0.95rem] leading-snug">{d.lead}</p>
                    </div>

                    <div>
                      <p className="text-[0.95rem] leading-snug text-muted-foreground">{d.summary}</p>
                      <ul className="mt-7 flex flex-wrap gap-2">
                        {d.services.map((s) => (
                          <li key={s.title} className="label border border-border px-3.5 py-2 text-muted-foreground">
                            {s.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Block>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/sectors", label: "Sectors", note: `${VERTICALS.length} talent pools` },
            { href: "/how-we-select", label: "Method", note: "How we select" },
            { href: "/employers", label: "Employers", note: "Request a shortlist" },
          ]}
        />
      </Tone>
    </>
  );
}
