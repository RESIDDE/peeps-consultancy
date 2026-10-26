import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  IndexRows,
  MarkRule,
  MoreLinks,
  PageOpening,
  Panel,
  Pronouncement,
  SectionHead,
  SpecRows,
  Tone,
} from "@/components/site/studio/page-kit";
import { StudioQualityLadder } from "@/components/site/studio/quality-ladder";
import { WordMarquee } from "@/components/site/studio/word-marquee";
import { QUALITY_FRAMEWORK, SELECTION_STEPS } from "@/lib/content";
import { CHECK_META, STAGES } from "@/lib/quality";
import { ASSESSMENT_TEMPLATES, CLASSIFICATIONS, INTERVIEW_TEMPLATE } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "How PEEPs Selects Talent",
  description: "Our published methodology: registration, CV review, verification, interview, assessment, references, classification and matching.",
};

const pad = (n: number) => String(n).padStart(2, "0");
const SHOWCASE = ["accounting", "mechanic", "driver", "chef"] as const;

export default function HowWeSelectPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Our methodology, published"
          title="How PEEPs selects talent, in full."
          lede="We publish our process because trust has to be earned. Here is exactly what happens before a candidate's name reaches you, and what each PEEPs label means."
          actions={
            <>
              <CtaLine href="/employers#request">Request talent</CtaLine>
              <CtaLine href="/register/candidate">Join the registry</CtaLine>
            </>
          }
          facts={[
            { value: pad(SELECTION_STEPS.length), label: "Steps from registration to recommendation" },
            { value: pad(Object.keys(CHECK_META).length), label: "Verification checks recorded per candidate" },
            { value: pad(STAGES.length), label: "Stages, each unlocked only by recorded evidence" },
          ]}
        />

        <WordMarquee
          words={["Reviewed", "Verified", "Interviewed", "Assessed", "Referenced", "Classified"]}
          lead={
            <>
              Six things
              <br />
              on the record.
            </>
          }
          foot="✦ Nothing on a PEEPs profile is taken on trust."
        />
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="Eight steps"
            title="From registration to recommendation."
            lede="The same order every time, whatever the role. A candidate who skips a step does not reach a shortlist."
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <IndexRows className="mt-6" items={SELECTION_STEPS.map((s) => ({ title: s.title, body: s.body }))} />
        </Block>
      </Tone>

      <Tone tone="dark">
        <Block>
          <SectionHead
            label="Candidate Quality Framework"
            title="The standard behind every shortlist."
            lede="We check all of the following for every candidate we recommend, and record the evidence in their file."
          />
          <SpecRows className="mt-16" items={QUALITY_FRAMEWORK.map((q) => ({ term: q.area, value: q.standard }))} />
        </Block>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="The quality ladder"
            title="Seven rungs, each gated by evidence."
            lede="A candidate reaches a rung only when the evidence for it, and for every rung below it, is on file."
          />
          <div className="shell mt-20">
            <StudioQualityLadder />
          </div>
        </Block>
      </Tone>

      <Tone tone="dark">
        <Block>
          <SectionHead
            label="Sector-specific assessment"
            title="An accountant's test looks nothing like a mechanic's."
            lede={`Every candidate takes the ${INTERVIEW_TEMPLATE.name.toLowerCase()}. They then take a technical assessment built for their profession.`}
          />

          <div className="shell mt-16">
            <Panel>
              <p className="label text-muted-foreground">{INTERVIEW_TEMPLATE.name} — everyone</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {INTERVIEW_TEMPLATE.criteria.map((c) => (
                  <li key={c.key} className="label border border-border px-3.5 py-2 text-muted-foreground">
                    {c.label}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <ul className="shell mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SHOWCASE.map((key, i) => {
              const t = ASSESSMENT_TEMPLATES[key];
              return (
                <li key={key} className="flex flex-col rounded-[7px] border border-border p-7">
                  <span className="label text-muted-foreground">{pad(i + 1)}</span>
                  <h3 className="subhead mt-10 text-[clamp(1.2rem,1.6vw,1.5rem)]">{t.name}</h3>
                  <ul className="mt-8 grid">
                    {t.criteria.map((c) => (
                      <li key={c.key} className="border-t border-border py-3.5 last:border-b">
                        <p className="text-[0.95rem] leading-snug">{c.label}</p>
                        <p className="mt-1 text-[0.85rem] leading-snug text-muted-foreground">{c.focus}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </Block>
      </Tone>

      <Tone tone="light">
        <Pronouncement
          foot={
            <p className="text-[0.95rem] leading-snug text-muted-foreground">
              We don&apos;t give employers simplistic numerical scores. Each candidate receives a classification with a
              written rationale, and the assessment report shows the evidence behind it.
            </p>
          }
        >
          Evidence, not a magic number.
        </Pronouncement>

        <Block className="pt-0">
          <div className="shell grid gap-4 lg:grid-cols-2">
            <Panel className="flex gap-5">
              <X aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.5} />
              <p className="text-[1.05rem] leading-snug text-muted-foreground">&ldquo;Candidate score: 87/100&rdquo;</p>
            </Panel>
            <Panel className="flex gap-5">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={1.5} />
              <p className="text-[1.05rem] leading-snug">
                &ldquo;Competent: verified 4-year history in comparable roles; Advanced on Excel, Proficient on IFRS
                reporting; two positive references.&rdquo;
              </p>
            </Panel>
          </div>

          <IndexRows
            className="mt-20"
            items={CLASSIFICATIONS.map((c) => ({ title: c.label, body: c.description }))}
          />
        </Block>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/employers", label: "Employers", note: "Request a shortlist" },
            { href: "/candidates", label: "Talent", note: "Join the registry" },
            { href: "/sectors", label: "Sectors", note: "What each pool is tested on" },
          ]}
        />
      </Tone>
    </>
  );
}
