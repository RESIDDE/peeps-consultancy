import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero, Section } from "@/components/site/section";
import { EnquiryForm } from "@/components/site/forms";
import { COMPANY } from "@/lib/content";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with PEEPs.HR Partners." };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's talk about your people." lead="Whether you're hiring, training, partnering or building your career, a PEEPs consultant will respond within one working day." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div className="grid content-start gap-4">
            {[
              { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
              { icon: Phone, label: "Phone / WhatsApp", value: COMPANY.phone, href: `tel:${COMPANY.phone.replace(/\s/g, "")}` },
              { icon: MapPin, label: "Office", value: COMPANY.city },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                <c.icon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="font-medium hover:text-primary">{c.value}</a>
                  ) : (
                    <p className="font-medium">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
            <p className="mt-2 text-sm text-muted-foreground">
              Hiring? The fastest route is a{" "}
              <Link href="/employers#request" className="font-medium text-primary underline-offset-4 hover:underline">
                talent request
              </Link>
              .
            </p>
          </div>
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <EnquiryForm type="contact" />
          </div>
        </div>
      </Section>
    </>
  );
}
