import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Crown, Layers, ShieldCheck, Users } from "lucide-react";
import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { RequestTalentForm } from "@/components/site/forms";
import { buttonVariants } from "@/components/ui/button";
import { EMPLOYER_PROCESS } from "@/lib/content";
import { PACKAGES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "For Employers",
  description: "Recruitment solutions, executive search, contract staffing and employer membership from PEEPs.HR Partners.",
};

const PACKAGE_ICONS = { basic: Layers, professional: ShieldCheck, executive: Crown, contract: Users } as const;

const MEMBERSHIP = [
  "Vacancy posting and priority sourcing",
  "Access to PEEPs Ready talent pools",
  "Candidate screening and interview support",
  "Discounts on Academy training",
  "HR advisory hours",
  "Quarterly workforce reports",
];

export default function EmployersPage() {
  return (
    <>
      <PageHero
        eyebrow="For employers"
        title={
          <>
            A recruitment solution, <span className="italic text-primary">not a CV service.</span>
          </>
        }
        lead="Tell us the role. We'll work out who will actually succeed in your organisation, then find, verify and assess them. You get a short list where every candidate comes with evidence."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#request" className={buttonVariants({ size: "lg" })}>
            Request talent <ArrowRight />
          </a>
          <Link href="/register/employer" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Create an employer account
          </Link>
        </div>
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="How it works"
          title="Eight steps from vacancy to onboarding."
          lead="We analyse the vacancy before we look at a single CV."
        />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {EMPLOYER_PROCESS.map((s, i) => (
            <li key={s.title} className="bg-card p-6">
              <span className="font-mono text-xs text-primary">Step {String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display mt-3 text-xl font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="muted" id="packages">
        <SectionHeading
          eyebrow="Recruitment packages"
          title="Choose the depth of support you need."
          lead="Fees depend on role, seniority and volume, and every engagement starts with a proposal. Permanent placements are success-based, with retained options for executive search."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PACKAGES.map((p, i) => {
            const Icon = PACKAGE_ICONS[p.value];
            const featured = p.value === "professional";
            return (
              <Reveal key={p.value}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-3xl border p-7",
                    featured ? "border-primary bg-ink text-ink-foreground shadow-xl" : "bg-card",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("inline-flex size-11 items-center justify-center rounded-2xl", featured ? "bg-gold text-gold-foreground" : "bg-secondary text-primary")}>
                      <Icon className="size-5" />
                    </span>
                    {featured && <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-gold">Most chosen</span>}
                  </div>
                  <p className={cn("mt-6 font-mono text-xs", featured ? "text-white/50" : "text-muted-foreground")}>0{i + 1}</p>
                  <h3 className="font-display mt-1 text-2xl font-medium">{p.short}</h3>
                  <p className={cn("mt-2 text-sm", featured ? "text-white/70" : "text-muted-foreground")}>{p.tagline}</p>
                  <ul className="mt-6 grid gap-2.5 text-sm">
                    {p.includes.map((inc) => (
                      <li key={inc} className="flex gap-2">
                        <Check className={cn("mt-0.5 size-4 shrink-0", featured ? "text-gold" : "text-primary")} />
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <a href="#request" className={buttonVariants({ variant: featured ? "gold" : "outline" })}>
                      Request a proposal
                    </a>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Contract & workforce"
              title="Need twenty accountants for six months?"
              lead="PEEPs Workforce recruits the team, deploys them to you and manages the arrangement under one contract with one monthly invoice. You pay the employee cost plus a transparent PEEPs service margin."
            />
            <Link href="/services/workforce" className={cn(buttonVariants({ variant: "link" }), "mt-6")}>
              Explore PEEPs Workforce <ArrowRight />
            </Link>
          </div>
          <div className="rounded-3xl border bg-card p-7 sm:p-9">
            <p className="eyebrow">PEEPs Employer Membership</p>
            <h3 className="font-display mt-3 text-3xl font-medium">Recruitment support on subscription.</h3>
            <p className="mt-3 text-muted-foreground">
              If you hire regularly, pay a monthly or annual subscription instead of paying for each vacancy.
            </p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {MEMBERSHIP.map((m) => (
                <li key={m} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="muted" id="request">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              eyebrow="Request talent"
              title="Tell us who you need."
              lead="Your request goes straight to a PEEPs consultant, who will contact you to start the vacancy analysis. If this is your first time working with us, ask for a pilot engagement."
            />
            <div className="mt-8 rounded-2xl border bg-card p-5 text-sm">
              <p className="font-medium">What happens next</p>
              <ol className="mt-3 grid gap-2 text-muted-foreground">
                <li>1. A consultant calls within one working day</li>
                <li>2. Vacancy analysis: we agree what success looks like</li>
                <li>3. You receive a proposal and timeline</li>
                <li>4. We begin sourcing from the PEEPs registry and partners</li>
              </ol>
            </div>
          </div>
          <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-9">
            <RequestTalentForm />
          </div>
        </div>
      </Section>
    </>
  );
}
