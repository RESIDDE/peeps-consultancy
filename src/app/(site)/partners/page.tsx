import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/forms";
import { Bridge } from "@/components/site/studio/bridge";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  FormBlock,
  IndexRows,
  MarkRule,
  MoreLinks,
  PageOpening,
  Pronouncement,
  SectionHead,
  Tone,
} from "@/components/site/studio/page-kit";
import { PARTNER_TYPES_COPY, VERTICALS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Partner with PEEPs",
  description: "Training institutions, universities, associations and international partners.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function PartnersPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Partnerships"
          title="You train professionals. We connect them to employers."
          lede="PEEPs doesn't try to train everyone. We build an ecosystem that can identify, prepare and deploy talent, and our partners are at the centre of it."
          actions={
            <>
              <CtaLine href="#enquire">Start a conversation</CtaLine>
              <CtaLine href="/about">How the model works</CtaLine>
            </>
          }
          facts={[
            { value: pad(PARTNER_TYPES_COPY.length), label: "Kinds of partner in the ecosystem" },
            { value: pad(VERTICALS.length), label: "Talent pools your graduates can enter" },
            { value: "Every", label: "Placement sends feedback back to the curriculum" },
          ]}
        />

        <Block className="pt-0">
          <SectionHead label="The bridge" title="Education on one side, employment on the other." />
          <div className="shell mt-16">
            <Bridge />
          </div>
        </Block>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="Who we partner with"
            title="An ecosystem, not a single channel."
            lede="Six kinds of partner, each reaching talent we could not reach alone."
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <IndexRows className="mt-6" items={PARTNER_TYPES_COPY.map((p) => ({ title: p.title, body: p.body }))} />
        </Block>

        <Pronouncement
          foot={
            <p className="text-[0.95rem] leading-snug text-muted-foreground">
              Your graduates get assessed and placed. You get structured employer feedback on which skills are strong and
              which are missing, so each cohort is better prepared than the last.
            </p>
          }
        >
          Employment outcomes for your learners. Market intelligence for your curriculum.
        </Pronouncement>

        <FormBlock
          id="enquire"
          label="Partner with us"
          title="Tell us who you train."
          lede="A consultant will reply within one working day to talk through pipelines, assessment and placement."
        >
          <EnquiryForm type="partner" subjectPlaceholder="e.g. Graduate pipeline partnership" submitLabel="Start a conversation" />
        </FormBlock>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/academy", label: "Academy", note: "Training that ends in a job" },
            { href: "/how-we-select", label: "Method", note: "What your graduates will face" },
            { href: "/about", label: "About", note: "The model, in full" },
          ]}
        />
      </Tone>
    </>
  );
}
