import type { Metadata } from "next";
import { CtaLine } from "@/components/site/studio/cta-line";
import { Block, IndexRows, MoreLinks, PageOpening, Panel, Tone } from "@/components/site/studio/page-kit";

export const metadata: Metadata = { title: "Terms" };

const SECTIONS = [
  {
    title: "Services",
    body: "PEEPs provides recruitment, assessment, training, professional and workforce services under the terms of a written proposal or agreement for each engagement.",
  },
  {
    title: "Fees",
    body: "Employers pay for recruitment services as agreed in writing. PEEPs never charges candidates placement fees. Optional career-development services for individuals are priced separately and are never a condition of being put forward for a role.",
  },
  {
    title: "Candidate information",
    body: "PEEPs verifies and assesses candidates as described in our published methodology, and records the evidence for each label it assigns. Employers remain responsible for their own hiring decisions.",
  },
  {
    title: "Accounts",
    body: "You are responsible for keeping your login credentials confidential and for the accuracy of the information you provide.",
  },
  {
    title: "Liability",
    body: "To the extent permitted by law, PEEPs' liability is limited to the fees paid for the relevant engagement.",
  },
];

export default function TermsPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Legal"
          title="Terms of service."
          lede="The terms under which PEEPs provides recruitment, assessment, training and workforce services."
          actions={<CtaLine href="/contact">Ask a question</CtaLine>}
        >
          <Panel className="mt-auto border-primary">
            <p className="label text-primary">Draft for legal review</p>
            <p className="mt-4 max-w-[60ch] text-[0.95rem] leading-snug text-muted-foreground">
              These terms are a working template and have not yet been approved by counsel.
            </p>
          </Panel>
        </PageOpening>
      </Tone>

      <Tone tone="light">
        <Block>
          <IndexRows items={SECTIONS} />
        </Block>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/privacy", label: "Privacy", note: "How we handle personal data" },
            { href: "/how-we-select", label: "Method", note: "What we check, and how" },
            { href: "/contact", label: "Contact", note: "Talk to a consultant" },
          ]}
        />
      </Tone>
    </>
  );
}
