import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/forms";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  FormBlock,
  MarkRule,
  MoreLinks,
  PageOpening,
  Pronouncement,
  SectionHead,
  Tone,
} from "@/components/site/studio/page-kit";
import { WordMarquee } from "@/components/site/studio/word-marquee";

export const metadata: Metadata = {
  title: "PEEPs Academy",
  description: "Talent Ready programmes, employer-sponsored training and professional development.",
};

const pad = (n: number) => String(n).padStart(2, "0");

const TALENT_READY = [
  {
    name: "Talent Ready: Accounting",
    items: ["CV review", "Excel assessment", "Accounting assessment", "Interview", "Professional communication", "Workplace ethics", "Corporate etiquette"],
  },
  {
    name: "Talent Ready: Automotive",
    items: ["Practical workshop assessment", "Diagnostics refresher", "Customer communication", "Workshop safety", "Interview"],
  },
  {
    name: "Talent Ready: Administration",
    items: ["Office software", "Business writing", "Front-of-house standards", "Confidentiality", "Interview"],
  },
];

const PIPELINE = [
  "You define the skills gap",
  "We design the programme",
  "The cohort is trained and assessed",
  "PEEPs supplies the graduates",
];

export default function AcademyPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="PEEPs Academy"
          title="If the market doesn't have the talent, we help build it."
          lede="PEEPs Academy turns training into employment. Talent Ready programmes prepare candidates for work, and employer-sponsored training builds pipelines to your specification."
          actions={
            <>
              <CtaLine href="#enquire">Sponsor a cohort</CtaLine>
              <CtaLine href="/register/candidate">Join the registry</CtaLine>
            </>
          }
          facts={[
            { value: pad(TALENT_READY.length), label: TALENT_READY.map((p) => p.name.replace("Talent Ready: ", "")).join(", ") },
            { value: "00", label: "Debt for graduates: the employer pays for sponsored training" },
            { value: "One", label: "Place every graduate lands — a PEEPs talent pool" },
          ]}
        />

        <WordMarquee
          words={["Train", "Assess", "Prepare", "Place"]}
          lead={
            <>
              Training that
              <br />
              ends in a job.
            </>
          }
          foot="✦ Recruitment, training and placement in one loop."
        />
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="Recruitment → Training → Placement"
            title="When you can't find competent juniors, we can train them for you."
            lede="Tell us the skills your organisation needs. We design a programme with our training partners, train the cohort and supply graduates who meet your requirements."
          />

          <ol className="shell mt-20 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <li key={step} className="flex min-h-[13rem] flex-col justify-between rounded-[7px] border border-border p-7">
                <span className="font-display text-[clamp(2.5rem,4vw,3.5rem)] leading-none tracking-[-0.06em] text-muted-foreground">
                  {pad(i + 1)}
                </span>
                <p className="mt-10 text-[1.05rem] leading-snug">{step}</p>
              </li>
            ))}
          </ol>

          <p className="shell mt-10 max-w-[60ch] text-[0.95rem] leading-snug text-muted-foreground">
            The training is paid for by the employer, so graduates join with no debt to repay.
          </p>
        </Block>
      </Tone>

      <Tone tone="dark">
        <Block>
          <SectionHead
            label="Talent Ready programmes"
            title="Graduates join a PEEPs talent pool."
            lede="Each programme ends in the same place: an assessed profile, on the registry, visible to employers who are hiring."
          />

          <ul className="shell mt-20 grid gap-4 lg:grid-cols-3">
            {TALENT_READY.map((p, i) => (
              <li key={p.name} className="flex flex-col rounded-[7px] border border-border p-7">
                <span className="label text-muted-foreground">{pad(i + 1)}</span>
                <h3 className="subhead mt-10">{p.name}</h3>
                <ul className="mt-8 grid">
                  {p.items.map((it) => (
                    <li key={it} className="border-t border-border py-3 text-[0.95rem] leading-snug text-muted-foreground last:border-b">
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <p className="shell mt-10 max-w-[70ch] text-[0.95rem] leading-snug text-muted-foreground">
            We also run Technology and Hospitality programmes with partner academies, and offer professional exam
            preparation — ACCA, ICAN and financial modelling — with our training-school partner.
          </p>

          <MarkRule className="mt-24 w-[80%]" mark="cross" />
        </Block>
      </Tone>

      <Tone tone="light">
        <Pronouncement
          foot={
            <p className="text-[0.95rem] leading-snug text-muted-foreground">
              Employer feedback after every placement tells our training partners which skills were strong and which were
              missing. The next cohort is built on it.
            </p>
          }
        >
          The loop closes with you.
        </Pronouncement>

        <FormBlock
          id="enquire"
          label="Enquire"
          title="Sponsor a cohort or enrol your team."
          lede="Tell us about the roles, the headcount and the skills that are missing. A consultant will respond within one working day."
        >
          <EnquiryForm type="academy" subjectPlaceholder="e.g. Excel & IFRS bootcamp for 12 juniors" />
        </FormBlock>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/services/academy", label: "Academy services", note: "The full division" },
            { href: "/partners", label: "Partners", note: "Train with us" },
            { href: "/candidates", label: "Talent", note: "Join the registry" },
          ]}
        />
      </Tone>
    </>
  );
}
