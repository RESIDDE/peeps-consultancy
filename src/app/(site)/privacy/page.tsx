import type { Metadata } from "next";
import { CtaLine } from "@/components/site/studio/cta-line";
import { Block, IndexRows, MoreLinks, PageOpening, Panel, Tone } from "@/components/site/studio/page-kit";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/consent";
import { COMPANY } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS = [
  {
    title: "Who we are",
    body: `${COMPANY.name} ("PEEPs") is the data controller for personal data collected through this website and the PEEPs platform.`,
  },
  {
    title: "What we collect",
    body: "Candidates: identity and contact details, education, qualifications, employment history, skills, assessment results, references, salary expectations and documents you upload. Employers: organisation and contact details, vacancy information and placement feedback.",
  },
  {
    title: "Why we use it",
    body: "We use it to assess candidate suitability, match candidates to vacancies, share shortlisted profiles with prospective employers, deliver services you request, and meet legal obligations. Our lawful basis is your consent and the performance of a contract.",
  },
  {
    title: "Who we share it with",
    body: "We share shortlisted candidate profiles with employers recruiting for a specific vacancy. Contact details are released only when an interview is agreed. We never sell personal data.",
  },
  {
    title: "How long we keep it",
    body: "We keep candidate profiles while you remain registered, and for up to 24 months after your last activity, unless you ask us to delete them sooner.",
  },
  {
    title: "Your rights",
    body: "Under the Nigeria Data Protection Act 2023, you can access, correct, port or delete your data, object to processing, and withdraw consent at any time. Contact us to exercise these rights.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Legal"
          title="Privacy notice."
          lede="How PEEPs collects, uses and protects personal data."
          actions={<CtaLine href="/contact">Exercise your rights</CtaLine>}
        >
          <Panel className="mt-auto border-primary">
            <p className="label text-primary">Draft for legal review</p>
            <p className="mt-4 max-w-[60ch] text-[0.95rem] leading-snug text-muted-foreground">
              This notice is a working template and has not yet been approved by counsel.
            </p>
          </Panel>
        </PageOpening>
      </Tone>

      <Tone tone="light">
        <Block>
          <IndexRows items={SECTIONS} />

          <div className="shell mt-16">
            <Panel>
              <p className="label text-muted-foreground">Candidate consent ({CONSENT_VERSION})</p>
              <p className="mt-6 max-w-[70ch] text-[1.05rem] leading-snug">{CONSENT_TEXT}</p>
            </Panel>
          </div>
        </Block>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/terms", label: "Terms", note: "Terms of service" },
            { href: "/how-we-select", label: "Method", note: "What we record, and why" },
            { href: "/contact", label: "Contact", note: "Ask us anything" },
          ]}
        />
      </Tone>
    </>
  );
}
