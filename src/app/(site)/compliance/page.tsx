import type { Metadata } from "next";
import {
  ComplianceCards,
  ComplianceCheckForm,
  ComplianceCount,
  ComplianceProvider,
} from "@/components/site/services/compliance";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  Faqs,
  FormBlock,
  MarkRule,
  MoreLinks,
  PageOpening,
  Panel,
  Pronouncement,
  SectionHead,
  Tone,
} from "@/components/site/studio/page-kit";
import { AUTO_CHECK, COMPLIANCE, COMPLIANCE_AREAS, PAYROLL } from "@/lib/services";

export const metadata: Metadata = {
  title: "CAC and PenCom compliance in Nigeria",
  description:
    "PEEPs handles CAC, NSITF, ITF, PenCom, tax, oil & gas and tech registrations, filings and renewals. Book a free compliance check.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function CompliancePage() {
  return (
    <ComplianceProvider>
      <Tone tone="dark">
        <PageOpening
          label={COMPLIANCE.kicker}
          title={COMPLIANCE.headline}
          lede={COMPLIANCE.summary}
          actions={
            <>
              <CtaLine href="#check">Book a free check</CtaLine>
              <CtaLine href="/contact">Talk to a consultant</CtaLine>
            </>
          }
          facts={[
            { value: pad(COMPLIANCE_AREAS.length - 1), label: "Regulators we file with, from CAC to NCDMB" },
            { value: "Free", label: "The compliance check itself. No obligation after it" },
            { value: "24h", label: "To a written answer on where you stand" },
          ]}
        />

        <Pronouncement foot={<CtaLine href="#check">Book a free check</CtaLine>}>{COMPLIANCE.lead}</Pronouncement>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="What we handle"
            title="Pick what you need help with."
            lede="Press a card and it is added to your compliance check below. Choose as many as apply — or Other, if you would rather we worked it out."
          />
          <ComplianceCards />
        </Block>

        <Block>
          <SectionHead label="How it works" title="Three steps to current." />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <ol className="shell mt-16 grid gap-5 md:grid-cols-3">
            {COMPLIANCE.steps.map((step, i) => (
              <li key={step.title}>
                <Panel className="h-full">
                  <p className="font-display text-[clamp(2.5rem,4vw,3.25rem)] leading-none tracking-[-0.06em] text-muted-foreground">
                    {pad(i + 1)}
                  </p>
                  <h3 className="subhead mt-10">{step.title}</h3>
                  <p className="mt-4 text-[0.95rem] leading-snug text-muted-foreground">{step.body}</p>
                </Panel>
              </li>
            ))}
          </ol>
        </Block>

        <FormBlock
          id="check"
          label="Free compliance check"
          title="Tell us where you stand."
          lede="A consultant reviews what you hold against what your industry requires, and writes back within 24 hours. There is no charge for the check."
          aside={<ComplianceCount />}
        >
          <ComplianceCheckForm />
        </FormBlock>

        <Block>
          <SectionHead label="Questions" title="Before you ask." />
          <Faqs className="mt-16" items={COMPLIANCE.faqs} />
        </Block>

        <MoreLinks
          label="Other PEEPs services"
          items={[
            { href: PAYROLL.href, label: PAYROLL.name, note: PAYROLL.kicker },
            { href: AUTO_CHECK.href, label: AUTO_CHECK.name, note: AUTO_CHECK.kicker },
            { href: "/services/professional", label: "PEEPs Professional", note: "Finance & business advisory" },
          ]}
        />
      </Tone>
    </ComplianceProvider>
  );
}
