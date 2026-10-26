import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/forms";
import { CtaLine } from "@/components/site/studio/cta-line";
import { LagosClock } from "@/components/site/studio/lagos-clock";
import { FormBlock, MoreLinks, PageOpening, Tone } from "@/components/site/studio/page-kit";

import { COMPANY } from "@/lib/content";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with PEEPs.HR Partners." };

const WAYS = [
  { label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { label: "Phone / WhatsApp", value: COMPANY.phone, href: `tel:${COMPANY.phone.replace(/\s/g, "")}` },
  { label: "Office", value: COMPANY.city },
];

export default function ContactPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Contact"
          title="Let's talk about your people."
          lede="Whether you're hiring, training, partnering or building your career, a PEEPs consultant will respond within one working day."
          actions={
            <>
              <CtaLine href="/employers#request">Request talent</CtaLine>
              <CtaLine href="#message">Send a message</CtaLine>
            </>
          }
        >
          <ul className="mt-auto pt-20">
            {WAYS.map((way) => (
              <li key={way.label} className="hairline last:border-b">
                <div className="grid items-baseline gap-x-10 gap-y-2 py-6 md:grid-cols-[12rem_minmax(0,1fr)]">
                  <span className="label text-muted-foreground">{way.label}</span>
                  {way.href ? (
                    <a href={way.href} className="subhead transition-opacity duration-300 hover:opacity-60">
                      {way.value}
                    </a>
                  ) : (
                    <span className="subhead">{way.value}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <p className="label mt-8 text-muted-foreground">
            Office hours, WAT → <LagosClock />
          </p>
        </PageOpening>
      </Tone>

      <Tone tone="light">
        <FormBlock
          id="message"
          label="Send a message"
          title="What can we help with?"
          lede="Hiring? The fastest route is a talent request — it goes straight to a consultant with the detail they need to start."
          aside={
            <CtaLine href="/employers#request" className="mt-12">
              Request talent instead
            </CtaLine>
          }
        >
          <EnquiryForm type="contact" />
        </FormBlock>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/employers", label: "Employers", note: "Request a shortlist" },
            { href: "/candidates", label: "Talent", note: "Join the registry" },
            { href: "/partners", label: "Partners", note: "Train with us" },
          ]}
        />
      </Tone>
    </>
  );
}
