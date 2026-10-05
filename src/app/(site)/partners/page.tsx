import type { Metadata } from "next";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { BridgeDiagram } from "@/components/site/bridge-diagram";
import { EnquiryForm } from "@/components/site/forms";
import { PARTNER_TYPES_COPY } from "@/lib/content";

export const metadata: Metadata = {
  title: "Partner with PEEPs",
  description: "Training institutions, universities, associations and international partners.",
};

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partnerships"
        title={
          <>
            You train professionals. <span className="italic text-primary">We connect them to employers.</span>
          </>
        }
        lead="PEEPs doesn't try to train everyone. We build an ecosystem that can identify, prepare and deploy talent, and our partners are at the centre of it."
      />
      <Section tone="ink">
        <BridgeDiagram />
      </Section>
      <Section>
        <SectionHeading eyebrow="Who we partner with" title="An ecosystem, not a single channel." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNER_TYPES_COPY.map((p) => (
            <div key={p.title} className="rounded-3xl border bg-card p-6">
              <h3 className="font-display text-xl font-medium">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            eyebrow="What partners get"
            title="Employment outcomes for your learners, and market intelligence for your curriculum."
            lead="Your graduates get assessed and placed. You get structured employer feedback on which skills are strong and which are missing, so each cohort is better prepared than the last."
          />
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <EnquiryForm type="partner" subjectPlaceholder="e.g. Graduate pipeline partnership" submitLabel="Start a conversation" />
          </div>
        </div>
      </Section>
    </>
  );
}
