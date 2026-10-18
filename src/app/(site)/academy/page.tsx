import type { Metadata } from "next";
import { ArrowRight, Check, GraduationCap, Handshake, Users } from "lucide-react";
import { HeroFacts, PageHero, Section, SectionHeading } from "@/components/site/section";
import { EnquiryForm } from "@/components/site/forms";

export const metadata: Metadata = {
  title: "PEEPs Academy",
  description: "Talent Ready programmes, employer-sponsored training and professional development.",
};

const TALENT_READY = [
  { name: "Talent Ready: Accounting", items: ["CV review", "Excel assessment", "Accounting assessment", "Interview", "Professional communication", "Workplace ethics", "Corporate etiquette"] },
  { name: "Talent Ready: Automotive", items: ["Practical workshop assessment", "Diagnostics refresher", "Customer communication", "Workshop safety", "Interview"] },
  { name: "Talent Ready: Administration", items: ["Office software", "Business writing", "Front-of-house standards", "Confidentiality", "Interview"] },
];

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="PEEPs Academy"
        title={
          <>
            If the market doesn&apos;t have the talent, <span className="italic text-primary">we help build it.</span>
          </>
        }
        lead="PEEPs Academy turns training into employment. Talent Ready programmes prepare candidates for work, and employer-sponsored training builds pipelines to your specification."
        aside={
          <HeroFacts
            items={[
              { icon: GraduationCap, value: `${TALENT_READY.length} Talent Ready programmes`, label: TALENT_READY.map((p) => p.name.replace("Talent Ready: ", "")).join(", ") },
              { icon: Handshake, value: "Employer-sponsored", label: "Graduates join with no debt to repay" },
              { icon: Users, value: "A PEEPs talent pool", label: "Where graduates go after their programme" },
            ]}
          />
        }
      />

      <Section>
        <SectionHeading
          eyebrow="Recruitment → Training → Placement"
          title="When you can't find competent juniors, we can train them for you."
          lead="Tell us the skills your organisation needs. We design a programme with our training partners, train the cohort and supply graduates who meet your requirements. The training is paid for by the employer, so graduates join with no debt to repay."
        />
        <ol className="mt-12 grid gap-3 md:grid-cols-4">
          {["You define the skills gap", "We design the programme", "Cohort trained & assessed", "PEEPs supplies the graduates"].map((s, i) => (
            <li key={s} className="flex items-center gap-3 rounded-2xl border bg-card p-5">
              <span className="font-display text-3xl font-medium text-primary">{i + 1}</span>
              <span className="text-sm font-medium">{s}</span>
              {i < 3 && <ArrowRight className="ml-auto hidden size-4 text-muted-foreground md:block" />}
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted">
        <SectionHeading eyebrow="Talent Ready programmes" title="Graduates join a PEEPs talent pool." />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {TALENT_READY.map((p) => (
            <div key={p.name} className="rounded-3xl border bg-card p-7">
              <h3 className="font-display text-2xl font-medium">{p.name}</h3>
              <ul className="mt-5 grid gap-2">
                {p.items.map((it) => (
                  <li key={it} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-primary" /> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          We also run Technology and Hospitality programmes with partner academies, and offer professional exam preparation (ACCA,
          ICAN, financial modelling) with our training-school partner.
        </p>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            eyebrow="Enquire"
            title="Sponsor a cohort or enrol your team."
            lead="Tell us about the roles, the headcount and the skills that are missing."
          />
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <EnquiryForm type="academy" subjectPlaceholder="e.g. Excel & IFRS bootcamp for 12 juniors" />
          </div>
        </div>
      </Section>
    </>
  );
}
