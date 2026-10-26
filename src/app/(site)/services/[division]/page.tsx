import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnquiryForm } from "@/components/site/forms";
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
import { DIVISIONS } from "@/lib/content";

export function generateStaticParams() {
  return DIVISIONS.map((d) => ({ division: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ division: string }> }): Promise<Metadata> {
  const { division } = await params;
  const d = DIVISIONS.find((x) => x.slug === division);
  return d ? { title: d.name, description: d.summary } : {};
}

const ENQUIRY_TYPE = { talent: "contact", academy: "academy", professional: "professional", workforce: "contact" } as const;

const pad = (n: number) => String(n).padStart(2, "0");

export default async function DivisionPage({ params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const d = DIVISIONS.find((x) => x.slug === division);
  if (!d) notFound();
  const others = DIVISIONS.filter((x) => x.slug !== d.slug);

  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label={d.kicker}
          title={d.name}
          lede={d.summary}
          actions={
            <>
              <CtaLine href="/employers#request">Request talent</CtaLine>
              <CtaLine href="/how-we-select">See how we select</CtaLine>
            </>
          }
          facts={d.outcomes.map((o, i) => ({ value: pad(i + 1), label: o }))}
        />

        <Pronouncement foot={<CtaLine href="/contact">Talk to a consultant</CtaLine>}>{d.lead}</Pronouncement>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="What's included"
            title={`Inside ${d.name}.`}
            lede={`${d.services.length} services, delivered under the same methodology as everything else PEEPs does.`}
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <IndexRows className="mt-6" items={d.services.map((s) => ({ title: s.title, body: s.body }))} />
        </Block>

        <FormBlock
          id="enquire"
          label="Get in touch"
          title={`Talk to us about ${d.name}.`}
          lede="A consultant will respond within one working day."
          aside={
            d.slug === "talent" ? (
              <CtaLine href="/employers#request" className="mt-12">
                Or submit a talent request
              </CtaLine>
            ) : undefined
          }
        >
          <EnquiryForm type={ENQUIRY_TYPE[d.slug]} subjectPlaceholder={d.services[0].title} />
        </FormBlock>

        <MoreLinks
          label="Across the ecosystem"
          items={others.map((o) => ({ href: `/services/${o.slug}`, label: o.name, note: o.kicker }))}
        />
      </Tone>
    </>
  );
}
