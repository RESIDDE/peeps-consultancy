import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/section";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/consent";
import { COMPANY } from "@/lib/content";

export const metadata: Metadata = { title: "Privacy" };

const SECTIONS = [
  { h: "Who we are", p: `${COMPANY.name} ("PEEPs") is the data controller for personal data collected through this website and the PEEPs platform.` },
  { h: "What we collect", p: "Candidates: identity and contact details, education, qualifications, employment history, skills, assessment results, references, salary expectations and documents you upload. Employers: organisation and contact details, vacancy information and placement feedback." },
  { h: "Why we use it", p: "We use it to assess candidate suitability, match candidates to vacancies, share shortlisted profiles with prospective employers, deliver services you request, and meet legal obligations. Our lawful basis is your consent and the performance of a contract." },
  { h: "Who we share it with", p: "We share shortlisted candidate profiles with employers recruiting for a specific vacancy. Contact details are released only when an interview is agreed. We never sell personal data." },
  { h: "How long we keep it", p: "We keep candidate profiles while you remain registered, and for up to 24 months after your last activity, unless you ask us to delete them sooner." },
  { h: "Your rights", p: "Under the Nigeria Data Protection Act 2023, you can access, correct, port or delete your data, object to processing, and withdraw consent at any time. Contact us to exercise these rights." },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy notice" lead="How PEEPs collects, uses and protects personal data." />
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
            Draft for legal review. This notice is a working template and has not yet been approved by counsel.
          </p>
          <div className="mt-10 grid gap-8">
            {SECTIONS.map((s) => (
              <div key={s.h}>
                <h2 className="font-display text-2xl font-medium">{s.h}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-muted p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Candidate consent ({CONSENT_VERSION})</p>
              <p className="mt-2 text-sm">{CONSENT_TEXT}</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
