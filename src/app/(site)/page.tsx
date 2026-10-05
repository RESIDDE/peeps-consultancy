import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calculator,
  Check,
  GraduationCap,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { TalentProfileCard } from "@/components/site/talent-profile-card";
import { Lifecycle } from "@/components/site/lifecycle";
import { QualityLadder } from "@/components/site/quality-ladder";
import { CvFunnel } from "@/components/site/cv-funnel";
import { BridgeDiagram } from "@/components/site/bridge-diagram";
import { Faq } from "@/components/site/faq";
import { DIVISIONS, FAQS, VERTICALS } from "@/lib/content";
import { cn } from "@/lib/utils";

const DIVISION_ICONS = { talent: Users, academy: GraduationCap, professional: Calculator, workforce: Briefcase } as const;

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="grain relative overflow-hidden">
        <div className="dotgrid absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_65%)]" />
        <div className="container-page grid gap-16 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12 lg:pb-28">
          <div>
            <p className="eyebrow">Talent · Academy · Professional · Workforce</p>
            <h1 className="font-display mt-5 text-balance text-[2.6rem] font-medium leading-[1.02] sm:text-6xl lg:text-[4.4rem]">
              Talent that has been identified, screened, assessed and{" "}
              <em className="relative whitespace-nowrap font-normal italic text-primary">
                prepared
                <svg aria-hidden viewBox="0 0 200 12" className="absolute -bottom-1 left-0 h-3 w-full text-gold" preserveAspectRatio="none">
                  <path d="M2 9 C 50 2, 150 2, 198 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </em>
              .
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              PEEPs.HR Partners gives Nigerian employers a short list of verified, assessed professionals, with the evidence behind
              each one, instead of a pile of unsorted CVs.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/employers#request" className={buttonVariants({ size: "lg" })}>
                Request talent <ArrowRight />
              </Link>
              <Link href="/register/candidate" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Join the talent registry
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Evidence-based shortlists", "Sector-specific assessments", "Candidates never pay placement fees"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="size-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <TalentProfileCard className="mx-auto w-full max-w-md lg:ml-auto" />
        </div>
      </section>

      {/* ---------------- Proposition: 100 → 5 ---------------- */}
      <Section tone="muted">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="The PEEPs difference"
              title={
                <>
                  A job board gives you volume. <span className="text-primary">PEEPs gives you a decision.</span>
                </>
              }
              lead="Job boards hold millions of CVs and leave the screening to you. We do the identifying, screening, verifying and assessing first. Your shortlist is about five people, and each one comes with a report that explains why."
            />
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t pt-8">
              {[
                ["7", "evidence-gated quality stages"],
                ["9", "verification checks per candidate"],
                ["~5", "candidates per shortlist"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-4xl font-medium text-primary sm:text-5xl">{n}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.1} className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>100 applications</span>
              <span className="text-[color-mix(in_oklab,var(--gold)_60%,var(--foreground))]">5 evidenced candidates</span>
            </div>
            <CvFunnel />
          </Reveal>
        </div>
      </Section>

      {/* ---------------- Lifecycle ---------------- */}
      <Section tone="ink">
        <SectionHeading
          onDark
          eyebrow="The PEEPs model"
          title="Train → Assess → Prepare → Match → Deploy → Develop"
          lead="This isn't a recruitment agency bolted onto a database. It's a single loop that develops talent, proves it, places it, and uses employer feedback to improve the next cohort."
        />
        <div className="mt-14">
          <Lifecycle />
        </div>
      </Section>

      {/* ---------------- Quality ladder ---------------- */}
      <Section>
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="PEEPs Quality & Credibility Framework"
            title="Every badge has a record behind it."
            lead="Candidates move up the ladder only when the evidence is recorded. Here is exactly what each stage requires."
          />
          <Link href="/how-we-select" className={cn(buttonVariants({ variant: "outline" }), "self-start lg:self-auto")}>
            Read our methodology <ArrowUpRight />
          </Link>
        </div>
        <QualityLadder />
      </Section>

      {/* ---------------- Divisions ---------------- */}
      <Section tone="muted">
        <SectionHeading
          eyebrow="One partner, four divisions"
          title="Recruitment, training, professional services and workforce, all connected."
          lead="A recruitment client today might be a training client next quarter and an advisory client next year. Each division strengthens the others."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {DIVISIONS.map((d, i) => {
            const Icon = DIVISION_ICONS[d.slug];
            return (
              <Reveal key={d.slug} delay={i * 0.06}>
                <Link
                  href={`/services/${d.slug}`}
                  className="group flex h-full flex-col rounded-3xl border bg-card p-7 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg sm:p-8"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <Icon className="size-6" />
                    </span>
                    <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{d.kicker}</p>
                  <h3 className="font-display mt-1 text-2xl font-medium sm:text-3xl">{d.name}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{d.summary}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ---------------- Verticals ---------------- */}
      <Section>
        <SectionHeading
          eyebrow="Where we start"
          title="Three launch verticals where we have a genuine advantage."
          lead="Rather than recruit everyone for everyone, we go deep where our training ecosystem and business networks give us access and insight."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {VERTICALS.filter((v) => v.launch).map((v, i) => (
            <Reveal key={v.slug} delay={i * 0.08}>
              <Link
                href={`/sectors/${v.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-7"
              >
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                <h3 className="font-display mt-4 text-2xl font-medium">{v.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.blurb}</p>
                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {v.roles.slice(0, 5).map((r) => (
                    <li key={r} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                      {r}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-1 pt-8 text-sm font-medium text-primary">
                  Explore the talent pool <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Also growing: <Link href="/sectors/technology" className="font-medium text-foreground underline-offset-4 hover:underline">Technology</Link> and{" "}
          <Link href="/sectors/hospitality" className="font-medium text-foreground underline-offset-4 hover:underline">Hospitality</Link> talent pools through partner academies.
        </p>
      </Section>

      {/* ---------------- Bridge ---------------- */}
      <Section tone="ink">
        <SectionHeading
          onDark
          eyebrow="The employment bridge"
          title="We don't compete with training centres. We connect them to employers."
          lead="Training centres develop professionals. PEEPs proves their readiness and connects them with employers, then uses what employers tell us to shape what gets taught next."
        />
        <div className="mt-14">
          <BridgeDiagram />
        </div>
      </Section>

      {/* ---------------- Pilot + split CTA ---------------- */}
      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grain relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">For employers</p>
            <h3 className="font-display mt-3 text-3xl font-medium sm:text-4xl">Start with a pilot recruitment engagement.</h3>
            <p className="mt-4 max-w-md leading-relaxed text-white/80">
              Give us one vacancy. We&apos;ll run the full PEEPs process: sourcing, screening, assessment, an evidence-based shortlist
              and interview coordination. You decide whether it was worth it.
            </p>
            <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
              {["Vacancy", "Sourced", "Screened", "Interviewed", "Shortlisted", "Hired"].map((s, i, a) => (
                <li key={s} className="inline-flex items-center gap-2">
                  {s}
                  {i < a.length - 1 && <ArrowRight className="size-3.5 text-gold" />}
                </li>
              ))}
            </ol>
            <Link href="/employers#request" className={cn(buttonVariants({ variant: "gold", size: "lg" }), "mt-8")}>
              Request a pilot <ArrowRight />
            </Link>
          </div>
          <div className="rounded-3xl border bg-card p-8 sm:p-10">
            <p className="eyebrow">For professionals</p>
            <h3 className="font-display mt-3 text-3xl font-medium sm:text-4xl">Get assessed. Get prepared. Get seen by serious employers.</h3>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Join the PEEPs Talent Registry free of charge. Move up the quality ladder, and get put forward for roles that match your
              skills, experience and salary expectations.
            </p>
            <ul className="mt-6 grid gap-2 text-sm">
              {["No placement fees for candidates, ever", "Honest CV feedback and interview preparation", "Track your verification progress online"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/register/candidate" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
              Register your profile <ArrowRight />
            </Link>
          </div>
        </div>
      </Section>

      {/* ---------------- FAQ ---------------- */}
      <Section tone="muted">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="Questions" title="What employers and candidates ask us." />
          <Faq items={FAQS} />
        </div>
      </Section>
    </>
  );
}
