import type { Metadata } from "next";
import { PageHero, Section } from "@/components/site/section";

export const metadata: Metadata = { title: "Terms" };

const SECTIONS = [
  { h: "Services", p: "PEEPs provides recruitment, assessment, training, professional and workforce services under the terms of a written proposal or agreement for each engagement." },
  { h: "Fees", p: "Employers pay for recruitment services as agreed in writing. PEEPs never charges candidates placement fees. Optional career-development services for individuals are priced separately and are never a condition of being put forward for a role." },
  { h: "Candidate information", p: "PEEPs verifies and assesses candidates as described in our published methodology, and records the evidence for each label it assigns. Employers remain responsible for their own hiring decisions." },
  { h: "Accounts", p: "You are responsible for keeping your login credentials confidential and for the accuracy of the information you provide." },
  { h: "Liability", p: "To the extent permitted by law, PEEPs' liability is limited to the fees paid for the relevant engagement." },
];

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of service" />
      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
            Draft for legal review. These terms are a working template and have not yet been approved by counsel.
          </p>
          <div className="mt-10 grid gap-8">
            {SECTIONS.map((s) => (
              <div key={s.h}>
                <h2 className="font-display text-2xl font-medium">{s.h}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
