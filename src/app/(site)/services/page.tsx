import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CtaLine } from "@/components/site/studio/cta-line";
import { Block, MarkRule, MoreLinks, PageOpening, SectionHead, Tone } from "@/components/site/studio/page-kit";
import { WordMarquee } from "@/components/site/studio/word-marquee";
import { DIVISIONS, LIVE_VERTICALS } from "@/lib/content";
import { NEW_SERVICES, OFFERINGS } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Recruitment, training, business advisory, workforce, payroll outsourcing, business compliance and Auto Check vehicle inspection.",
};

const pad = (n: number) => String(n).padStart(2, "0");
/** Each division's own services, plus the three that stand on their own. */
const SERVICE_COUNT = DIVISIONS.reduce((n, d) => n + d.services.length, 0) + NEW_SERVICES.length;

/** What a row shows beneath the name: a division's own services, or a service's own detail. */
const ROW_TAGS: Record<string, readonly string[]> = {
  ...Object.fromEntries(DIVISIONS.map((d) => [d.slug, d.services.map((x) => x.title)])),
  payroll: NEW_SERVICES[0].form.services,
  compliance: NEW_SERVICES[1].form.industries,
  "auto-check": NEW_SERVICES[2].packages.map((p) => `${p.name} inspection`),
};

export default function ServicesPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Services"
          title="People, payroll and peace of mind."
          lede="Whenever you need people, training, professional support, payroll, compliance or a mechanic who will tell you the truth about a car, PEEPs should be one of the first calls you make."
          actions={
            <>
              <CtaLine href="/employers#request">Request talent</CtaLine>
              <CtaLine href="/contact">Talk to a consultant</CtaLine>
            </>
          }
          facts={[
            { value: pad(OFFERINGS.length), label: "Services, held to one standard of evidence" },
            { value: pad(SERVICE_COUNT), label: "Things we do between them, from search to inspection" },
            { value: "One", label: "Point of contact, whichever of them you need" },
          ]}
        />

        <WordMarquee
          words={OFFERINGS.map((o) => o.short)}
          lead={
            <>
              One partner,
              <br />
              every service.
            </>
          }
          foot="✦ Hire, train, advise, deploy, pay, comply, inspect."
        />
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="What we do"
            title="Pick the service you need."
            lede="They share a registry, a methodology and a single point of contact. Most engagements start in one and grow into another."
          />

          <MarkRule className="mt-20 w-[60%] md:mt-24" />

          <ul className="shell mt-6">
            {OFFERINGS.map((o, i) => (
              <li key={o.slug} className="hairline last:border-b">
                <Link href={o.href} className="group block py-10 md:py-14">
                  <div className="grid gap-y-7 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.2fr)] md:gap-x-10">
                    <span className="label text-muted-foreground">{pad(i + 1)}</span>

                    <div>
                      <p className="label text-muted-foreground">{o.kicker}</p>
                      <h3 className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[0.95] tracking-[-0.06em] transition-opacity duration-300 group-hover:opacity-55">
                        {o.name}
                        <ArrowUpRight
                          aria-hidden
                          className="ml-3 inline size-[0.45em] align-middle transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                        />
                      </h3>
                      <p className="mt-6 max-w-[26ch] text-[0.95rem] leading-snug">{o.blurb}</p>
                    </div>

                    <div>
                      <p className="text-[0.95rem] leading-snug text-muted-foreground">{o.summary}</p>
                      <ul className="mt-7 flex flex-wrap gap-2">
                        {ROW_TAGS[o.slug].map((tag) => (
                          <li key={tag} className="label border border-border px-3.5 py-2 text-muted-foreground">
                            {tag}
                          </li>
                        ))}
                      </ul>
                      <p className="label mt-7 flex items-center gap-2">
                        {o.action.label}
                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </p>
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
            { href: "/sectors", label: "Sectors", note: `${LIVE_VERTICALS.length} live talent pools` },
            { href: "/how-we-select", label: "Method", note: "How we select" },
            { href: "/employers", label: "Employers", note: "Request a shortlist" },
          ]}
        />
      </Tone>
    </>
  );
}
