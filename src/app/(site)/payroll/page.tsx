import type { Metadata } from "next";
import { PayrollQuoteForm } from "@/components/site/services/payroll-form";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  Boxes,
  Faqs,
  FormBlock,
  IndexRows,
  MarkRule,
  MoreLinks,
  PageOpening,
  Panel,
  Pronouncement,
  SectionHead,
  Tone,
} from "@/components/site/studio/page-kit";
import { AUTO_CHECK, COMPLIANCE, PAYROLL, naira } from "@/lib/services";

export const metadata: Metadata = {
  title: "Payroll outsourcing in Nigeria",
  description:
    "PEEPs runs payroll for businesses in Nigeria — salaries, payslips, PAYE, pension, NHF, NSITF and ITF — every month, on time.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function PayrollPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label={PAYROLL.kicker}
          title={PAYROLL.headline}
          lede={PAYROLL.summary}
          actions={
            <>
              <CtaLine href="#quote">Request a quote</CtaLine>
              <CtaLine href="/contact">Talk to a consultant</CtaLine>
            </>
          }
          facts={PAYROLL.outcomes.map((o, i) => ({ value: pad(i + 1), label: o }))}
        />

        <Pronouncement foot={<CtaLine href="#quote">Request a quote</CtaLine>}>{PAYROLL.lead}</Pronouncement>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="What we handle"
            title="The whole run, not the easy half."
            lede="Calculating the payroll is the part that does not carry penalties. We do both parts."
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <IndexRows className="mt-6" items={PAYROLL.handles.map((h) => ({ title: h.title, body: h.body }))} />
        </Block>

        <Block>
          <SectionHead label="How it works" title="Three steps, every month." />
          <ol className="shell mt-16 grid gap-5 md:grid-cols-3">
            {PAYROLL.steps.map((step, i) => (
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

        <Block>
          <SectionHead
            label="Who it is for"
            title="Anyone who pays staff in Nigeria."
            lede="The run is the same whether there are four people on it or four hundred. Only the price changes."
          />
          <ul className="shell mt-16 grid gap-5 md:grid-cols-3">
            {PAYROLL.audiences.map((a) => (
              <li key={a.title}>
                <Panel className="h-full">
                  <h3 className="subhead">{a.title}</h3>
                  <p className="mt-5 text-[0.95rem] leading-snug text-muted-foreground">{a.body}</p>
                </Panel>
              </li>
            ))}
          </ul>
        </Block>

        <Block>
          <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-x-16">
            <div>
              <p className="label text-muted-foreground">Pricing</p>
              <p className="headline mt-7 text-[clamp(2rem,3.6vw,3.2rem)]">
                {PAYROLL.pricePerEmployee === null ? (
                  "Priced on your headcount."
                ) : (
                  <>
                    From {naira(PAYROLL.pricePerEmployee)}
                    <span className="text-muted-foreground"> per employee, per month.</span>
                  </>
                )}
              </p>
              <p className="mt-8 max-w-[38ch] text-[0.95rem] leading-snug text-muted-foreground">{PAYROLL.pricingNote}</p>
              <CtaLine href="#quote" className="mt-12">
                Request a quote
              </CtaLine>
            </div>
            <Panel>
              <p className="label text-muted-foreground">Every quote covers</p>
              <Boxes className="mt-6" items={PAYROLL.form.services} />
            </Panel>
          </div>
        </Block>

        <FormBlock
          id="quote"
          label="Request a quote"
          title="Tell us about your payroll."
          lede="Six questions. We come back within 24 hours with a price per employee and what it covers."
        >
          <PayrollQuoteForm />
        </FormBlock>

        <Block>
          <SectionHead label="Questions" title="Before you ask." />
          <Faqs className="mt-16" items={PAYROLL.faqs} />
        </Block>

        <MoreLinks
          label="Other PEEPs services"
          items={[
            { href: COMPLIANCE.href, label: COMPLIANCE.name, note: COMPLIANCE.kicker },
            { href: AUTO_CHECK.href, label: AUTO_CHECK.name, note: AUTO_CHECK.kicker },
            { href: "/services/workforce", label: "PEEPs Workforce", note: "Staffing & outsourcing" },
          ]}
        />
      </Tone>
    </>
  );
}
