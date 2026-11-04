import type { Metadata } from "next";
import { BadgeCheck, FileText } from "lucide-react";
import { AutoCheckBookingForm, AutoCheckProvider, PackageCards } from "@/components/site/services/auto-check";
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
import { AUTO_CHECK, COMPLIANCE, PAYROLL } from "@/lib/services";

export const metadata: Metadata = {
  title: "Car inspection before buying in Nigeria",
  description:
    "Book a PEEPs-certified mechanic to inspect a car at the dealership before you pay, and get a clear written report by email and WhatsApp.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function AutoCheckPage() {
  return (
    <AutoCheckProvider>
      <Tone tone="dark">
        <PageOpening
          label={AUTO_CHECK.kicker}
          title={AUTO_CHECK.headline}
          lede="You are about to spend more than you spend on anything except a house, on a car you have seen for twenty minutes. Send a mechanic first."
          actions={
            <>
              <CtaLine href="#book">Book an inspection</CtaLine>
              <CtaLine href="#packages">See the packages</CtaLine>
            </>
          }
          facts={AUTO_CHECK.outcomes.map((o, i) => ({ value: pad(i + 1), label: o }))}
        />

        <Pronouncement foot={<CtaLine href="#book">Book an inspection</CtaLine>}>{AUTO_CHECK.lead}</Pronouncement>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="How it works"
            title="Four steps, start to report."
            lede="You book. We turn up. You get it in writing before you pay for anything."
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <ol className="shell mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AUTO_CHECK.steps.map((step, i) => (
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

        <Block id="packages">
          <SectionHead
            label="Inspection packages"
            title="Choose how deep we go."
            lede="Pick one here and it carries down to the booking form. You can change it there."
          />
          <PackageCards />
        </Block>

        <Mechanics />
        <SampleReport />
        <Reviews />

        <FormBlock
          id="book"
          label="Book an inspection"
          title="Where is the car?"
          lede="Tell us the vehicle, the dealership and when you want to be there. We confirm on WhatsApp within 24 hours."
        >
          <AutoCheckBookingForm />
        </FormBlock>

        <Block>
          <SectionHead label="Questions" title="Before you ask." />
          <Faqs className="mt-16" items={AUTO_CHECK.faqs} />
        </Block>

        <MoreLinks
          label="Other PEEPs services"
          items={[
            { href: PAYROLL.href, label: PAYROLL.name, note: PAYROLL.kicker },
            { href: COMPLIANCE.href, label: COMPLIANCE.name, note: COMPLIANCE.kicker },
            { href: "/sectors/automotive-technical", label: "Automotive & Technical", note: "The talent pool behind it" },
          ]}
        />
      </Tone>
    </AutoCheckProvider>
  );
}

/**
 * The mechanics who do the inspections. PEEPs is supplying the names, photographs and
 * certifications; nothing on this page is invented, so until they arrive the section does
 * not render. Add them to AUTO_CHECK.mechanics in src/lib/services.ts.
 */
function Mechanics() {
  if (AUTO_CHECK.mechanics.length === 0) return null;
  return (
    <Block>
      <SectionHead
        label="Our mechanics"
        title="The people who do the looking."
        lede="Every one of them is assessed by PEEPs in the workshop, not just on paper."
      />
      <ul className="shell mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AUTO_CHECK.mechanics.map((m) => (
          <li key={m.name}>
            <Panel className="h-full">
              <div className="flex items-start justify-between gap-4">
                <h3 className="subhead">{m.name}</h3>
                <span className="label flex shrink-0 items-center gap-1.5 text-primary">
                  <BadgeCheck className="size-4" aria-hidden />
                  PEEPs Certified
                </span>
              </div>
              <p className="mt-5 text-[0.95rem] leading-snug text-muted-foreground">{m.certification}</p>
              <p className="label mt-6 text-muted-foreground">
                {m.years} years · {m.base}
              </p>
            </Panel>
          </li>
        ))}
      </ul>
    </Block>
  );
}

/** The example report, once PEEPs supplies the PDF. */
function SampleReport() {
  if (!AUTO_CHECK.sampleReport) return null;
  return (
    <Block>
      <div className="shell grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="label text-muted-foreground">Sample report</p>
          <h2 className="headline mt-7 text-[clamp(2rem,3.6vw,3.2rem)]">See what you get before you book.</h2>
          <p className="mt-8 max-w-[40ch] text-[0.95rem] leading-snug text-muted-foreground">
            A real inspection report, with the vehicle details removed. This is what reaches your email and WhatsApp.
          </p>
        </div>
        <a
          href={AUTO_CHECK.sampleReport}
          download
          className="label inline-flex items-center gap-3 border border-border px-6 py-4 transition-colors duration-300 hover:bg-foreground hover:text-background"
        >
          <FileText className="size-4" aria-hidden />
          Download the sample report
        </a>
      </div>
    </Block>
  );
}

/** Customer reviews. Real ones only — empty until PEEPs supplies them. */
function Reviews() {
  if (AUTO_CHECK.reviews.length === 0) return null;
  return (
    <Block>
      <SectionHead label="Reviews" title="From people who didn't buy blind." />
      <ul className="shell mt-16 grid gap-5 md:grid-cols-3">
        {AUTO_CHECK.reviews.map((r) => (
          <li key={r.quote}>
            <Panel className="h-full">
              <p className="subhead text-[clamp(1.15rem,1.7vw,1.45rem)]">&ldquo;{r.quote}&rdquo;</p>
              <p className="label mt-8 text-muted-foreground">
                {r.name} · {r.vehicle}
              </p>
            </Panel>
          </li>
        ))}
      </ul>
    </Block>
  );
}
