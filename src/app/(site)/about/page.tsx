import type { Metadata } from "next";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  IndexRows,
  MarkRule,
  MoreLinks,
  PageOpening,
  Panel,
  SectionHead,
  Tone,
} from "@/components/site/studio/page-kit";
import { WordMarquee } from "@/components/site/studio/word-marquee";
import { COMPANY, DIVISIONS, LIFECYCLE, ROADMAP, VALUES, VERTICALS } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "About", description: "Vision, mission, values and roadmap of PEEPs.HR Partners." };

const pad = (n: number) => String(n).padStart(2, "0");

export default function AboutPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="About PEEPs"
          title="A workforce partner, built on systems."
          lede={COMPANY.positioning}
          actions={
            <>
              <CtaLine href="/how-we-select">See how we select</CtaLine>
              <CtaLine href="/contact">Talk to a consultant</CtaLine>
            </>
          }
          facts={[
            { value: pad(DIVISIONS.length), label: "Divisions, from recruitment to payroll" },
            { value: pad(VERTICALS.length), label: "Talent pools, each with its own assessment" },
            { value: pad(LIFECYCLE.length), label: "Stages in the model, and the last one feeds the first" },
          ]}
        />

        <Block>
          <div className="shell grid gap-4 lg:grid-cols-2">
            <Panel className="border-foreground bg-foreground text-background">
              <p className="label opacity-60">Vision</p>
              <p className="subhead mt-10 max-w-[26ch]">
                When an organisation needs people, training or professional support, PEEPs is one of the first calls it
                makes. When a professional wants to grow, PEEPs is where they register.
              </p>
            </Panel>

            <Panel>
              <p className="label text-muted-foreground">Mission</p>
              <p className="subhead mt-10 max-w-[26ch]">
                To identify, screen, assess and prepare talent, and connect it with employers through a process that both
                sides can trust.
              </p>
            </Panel>
          </div>
        </Block>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="Our story"
            title="Experience turned into method."
            lede="PEEPs was founded by a finance and business leader whose career spans CFO responsibilities, HR, business development, internal audit, external-audit coordination and operations."
          />

          <div className="shell mt-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-x-16">
            <p className="label text-muted-foreground">
              That experience is a clear picture
              <br />
              of what employers actually need.
            </p>
            <div className="grid max-w-[52ch] gap-6 text-[1.05rem] leading-snug text-muted-foreground">
              <p>
                Rather than build a firm that depends on one person&apos;s judgement, we have turned that experience into
                systems: a published methodology, a quality framework, sector-specific assessments and a structured talent
                registry.
              </p>
              <p>
                Our advantage starts with access. Through a professional training school we reach a pipeline of developing
                talent, and through our business and automobile networks we reach the employers who need it. PEEPs builds
                the bridge between the two and holds it to a standard.
              </p>
            </div>
          </div>
        </Block>

        <Block className="pt-0">
          <SectionHead
            label="The PEEPs model"
            title="Train, assess, prepare, match, deploy, develop."
            lede="Not a recruitment agency bolted onto a database. One loop that develops talent, proves it, places it, and uses employer feedback to improve the next cohort."
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <IndexRows className="mt-6" items={LIFECYCLE.map((s) => ({ title: s.title, body: s.body, note: s.label }))} />
          <p className="label shell mt-10 text-muted-foreground">↺ And the sixth stage feeds the first.</p>
        </Block>
      </Tone>

      <Tone tone="dark">
        <WordMarquee
          words={LIFECYCLE.map((s) => s.label)}
          lead={
            <>
              One loop,
              <br />
              not a funnel.
            </>
          }
          foot="✦ Employer feedback becomes next year's curriculum."
        />

        <Block className="pt-0">
          <SectionHead label="Values" title="What we hold ourselves to." />
          <IndexRows className="mt-16" items={VALUES.map((v) => ({ title: v.title, body: v.body }))} />
        </Block>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="Roadmap"
            title="From credibility to a talent marketplace."
            lede="Three phases, in the open. We are at the start of the first."
          />

          <ol className="shell mt-20 grid gap-4 lg:grid-cols-3">
            {ROADMAP.map((r, i) => {
              const here = i === 0;
              return (
                <li
                  key={r.phase}
                  className={cn(
                    "flex flex-col rounded-[7px] border p-7",
                    here ? "border-foreground bg-foreground text-background" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className={cn("label", here ? "opacity-60" : "text-muted-foreground")}>
                      {r.phase} · {r.window}
                    </span>
                    {here && <span className="label border border-current px-3 py-1.5">We are here</span>}
                  </div>

                  <h3 className="subhead mt-12">{r.title}</h3>

                  <ul className="mt-8 grid">
                    {r.points.map((p) => (
                      <li
                        key={p}
                        className={cn(
                          "border-t py-3 text-[0.95rem] leading-snug last:border-b",
                          here ? "border-background/20" : "border-border text-muted-foreground",
                        )}
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </Block>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/how-we-select", label: "Method", note: "The process, published" },
            { href: "/partners", label: "Partners", note: "Who we build the pipeline with" },
            { href: "/services", label: "Services", note: `${DIVISIONS.length} divisions` },
          ]}
        />
      </Tone>
    </>
  );
}
