import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChartColumnIncreasing, HeartHandshake, UserPlus } from "lucide-react";
import { HeroFacts, PageHero, Section, SectionHeading } from "@/components/site/section";
import { QualityLadder } from "@/components/site/quality-ladder";
import { EnquiryForm } from "@/components/site/forms";
import { buttonVariants } from "@/components/ui/button";
import { CAREER_SERVICES, SELECTION_STEPS } from "@/lib/content";
import { STAGES } from "@/lib/quality";

export const metadata: Metadata = {
  title: "For Talent",
  description: "Join the PEEPs Talent Registry: get verified, assessed and put forward to serious employers, free of charge.",
};

export default function CandidatesPage() {
  return (
    <>
      <PageHero
        eyebrow="For professionals"
        title={
          <>
            Get assessed. Get prepared. <span className="italic text-primary">Get seen.</span>
          </>
        }
        lead="Join the PEEPs Talent Registry free of charge. We verify your credentials and assess your skills, then put you forward for roles where you're a genuine fit. Employers see the evidence, so they see you at your best."
        aside={
          <HeroFacts
            items={[
              { icon: UserPlus, value: "Free to join", label: "Registration, verification and being put forward" },
              { icon: ChartColumnIncreasing, value: `${STAGES.length} stages`, label: "On the PEEPs quality ladder, tracked in your dashboard" },
              { icon: HeartHandshake, value: "No placement fees", label: "Employers pay for recruitment, never you" },
            ]}
          />
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/register/candidate" className={buttonVariants({ size: "lg" })}>
            Register your profile <ArrowRight />
          </Link>
          <Link href="/sign-in" className={buttonVariants({ size: "lg", variant: "outline" })}>
            I already have an account
          </Link>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-6 rounded-3xl border border-primary/30 bg-secondary/60 p-7 sm:grid-cols-[auto_1fr] sm:items-center sm:p-9">
          <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HeartHandshake className="size-7" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-medium sm:text-3xl">Employers pay for recruitment. You never pay to be placed.</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Registering, verification, assessment for a vacancy and being put forward to employers are all free. We also offer
              optional career-development services, but you never need them to be considered for a role.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="Your journey"
          title="Climb the PEEPs quality ladder."
          lead="Each stage you complete makes your profile more credible to employers. You can track your progress in your candidate dashboard."
        />
        <div className="mt-14">
          <QualityLadder />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="What to expect" title="How we get to know you." />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {SELECTION_STEPS.slice(0, 8).map((s, i) => (
            <li key={s.title} className="border-t pt-5">
              <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="ink">
        <SectionHeading
          onDark
          eyebrow="Optional career services"
          title="Invest in yourself, if and when you choose."
          lead="These services are paid and entirely optional. They are career development, not a fee for being placed."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {CAREER_SERVICES.map((c) => (
            <div key={c.title} className="bg-ink p-6">
              <BadgeCheck className="size-5 text-gold" />
              <h3 className="font-display mt-4 text-xl font-medium">{c.title}</h3>
              <p className="mt-2 text-sm text-white/70">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="career-services">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            eyebrow="Book a career service"
            title="Tell us what you're working towards."
            lead="A PEEPs consultant will reply with options and availability."
          />
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <EnquiryForm
              type="career_service"
              showOrganisation={false}
              subjectPlaceholder="e.g. CV development, interview preparation"
              submitLabel="Send request"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
