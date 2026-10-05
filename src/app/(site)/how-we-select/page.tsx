import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { QualityLadder } from "@/components/site/quality-ladder";
import { CLASSIFICATIONS, ASSESSMENT_TEMPLATES, INTERVIEW_TEMPLATE } from "@/lib/taxonomy";
import { QUALITY_FRAMEWORK, SELECTION_STEPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "How PEEPs Selects Talent",
  description: "Our published methodology: registration, CV review, verification, interview, assessment, references, classification and matching.",
};

const SHOWCASE = ["accounting", "mechanic", "driver", "chef"] as const;

export default function HowWeSelectPage() {
  return (
    <>
      <PageHero
        eyebrow="Our methodology, published"
        title={
          <>
            How PEEPs selects talent, <span className="italic text-primary">in full.</span>
          </>
        }
        lead="We publish our process because trust has to be earned. Here is exactly what happens before a candidate's name reaches you, and what each PEEPs label means."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHeading eyebrow="Eight steps" title="From registration to recommendation." />
          </div>
          <ol className="relative grid gap-0 border-l pl-8">
            {SELECTION_STEPS.map((s, i) => (
              <li key={s.title} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[2.85rem] flex size-7 items-center justify-center rounded-full border bg-background font-mono text-xs text-primary">
                  {i + 1}
                </span>
                <h3 className="font-display text-2xl font-medium">{s.title}</h3>
                <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Candidate Quality Framework"
          title="The standard behind every shortlist."
          lead="We check the following for every candidate we recommend, and record the evidence in their file."
        />
        <div className="mt-12 overflow-hidden rounded-3xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 font-medium sm:px-7">Area</th>
                <th className="px-5 py-3 font-medium sm:px-7">PEEPs standard</th>
              </tr>
            </thead>
            <tbody>
              {QUALITY_FRAMEWORK.map((q) => (
                <tr key={q.area} className="border-b last:border-0">
                  <td className="px-5 py-3.5 font-medium sm:px-7">{q.area}</td>
                  <td className="px-5 py-3.5 sm:px-7">
                    <span className="inline-flex items-center gap-1.5 text-primary">
                      <Check className="size-4" /> {q.standard}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="The quality ladder"
          title="Seven stages, each gated by evidence."
          lead="A candidate reaches a stage only when the evidence for it, and for every stage below it, is on file."
        />
        <div className="mt-14">
          <QualityLadder />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Sector-specific assessment"
          title="An accountant's test looks nothing like a mechanic's."
          lead={`Every candidate takes the ${INTERVIEW_TEMPLATE.name.toLowerCase()} (${INTERVIEW_TEMPLATE.criteria.map((c) => c.label.toLowerCase()).join(", ")}). They then take a technical assessment built for their profession.`}
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SHOWCASE.map((k) => {
            const t = ASSESSMENT_TEMPLATES[k];
            return (
              <div key={k} className="rounded-3xl border bg-card p-6">
                <h3 className="font-display text-xl font-medium">{t.name}</h3>
                <ul className="mt-4 grid gap-3">
                  {t.criteria.map((c) => (
                    <li key={c.key}>
                      <p className="text-sm font-medium">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.focus}</p>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Classification"
              title="Evidence, not a magic number."
              lead="We don't give employers simplistic numerical scores. Each candidate receives a classification with a written rationale, and the assessment report shows the evidence behind it."
            />
            <div className="mt-8 grid gap-3 rounded-3xl border bg-card p-6 text-sm">
              <p className="flex gap-2"><X className="size-4 shrink-0 text-destructive" /> &ldquo;Candidate score: 87/100&rdquo;</p>
              <p className="flex gap-2"><Check className="size-4 shrink-0 text-primary" /> &ldquo;Competent: verified 4-year history in comparable roles; Advanced on Excel, Proficient on IFRS reporting; two positive references.&rdquo;</p>
            </div>
          </div>
          <div className="grid gap-3">
            {CLASSIFICATIONS.map((c, i) => (
              <div key={c.value} className="flex gap-5 rounded-3xl border bg-card p-6">
                <span className="font-display text-4xl font-medium text-primary/30">{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl font-medium">{c.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
