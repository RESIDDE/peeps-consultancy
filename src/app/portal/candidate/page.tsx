import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { ArrowRight, BadgeCheck, PartyPopper, Sparkles } from "lucide-react";
import { db } from "@/db";
import { applications, documents, employers, vacancies, verificationChecks } from "@/db/schema";
import { Panel } from "@/components/peeps/blocks";
import { ClassificationBadge, LadderSteps, StageBadge } from "@/components/peeps/stage";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requestCareerService } from "@/server/actions/portal";
import { currentCandidate } from "@/server/portal";
import { nextStep, STAGE_META, type CheckRecord } from "@/lib/quality";
import { SHORTLISTED_OR_LATER } from "@/lib/pipeline";
import { GUIDANCE, profileCompleteness } from "@/lib/candidate-guidance";
import { CAREER_SERVICES } from "@/lib/content";
import { sectorName } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";

/** Candidate-facing labels: honest, but without internal pipeline jargon. */
const APP_STATUS: Record<string, string> = {
  applied: "Received",
  sourced: "Under review",
  screened: "Under review",
  interviewed: "Assessed",
  shortlisted: "Shortlisted to employer",
  client_interview: "Employer interview",
  offer: "Offer stage",
  placed: "Hired",
  rejected: "Not progressed",
};

export default async function CandidateDashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { candidate: c } = await currentCandidate();
  const [checks, apps, [{ n: docCount }]] = await Promise.all([
    db.select({ type: verificationChecks.type, status: verificationChecks.status, notes: verificationChecks.notes }).from(verificationChecks).where(eq(verificationChecks.candidateId, c.id)),
    db
      .select({ id: applications.id, stage: applications.stage, createdAt: applications.createdAt, title: vacancies.title, employer: employers.name, city: vacancies.city })
      .from(applications)
      .innerJoin(vacancies, eq(vacancies.id, applications.vacancyId))
      .innerJoin(employers, eq(employers.id, vacancies.employerId))
      .where(eq(applications.candidateId, c.id)),
    db.select({ n: count() }).from(documents).where(and(eq(documents.candidateId, c.id))),
  ]);
  const ev = {
    consented: !!c.consentAt,
    checks: checks as CheckRecord[],
    classification: c.classification,
    shortlisted: apps.some((a) => SHORTLISTED_OR_LATER.includes(a.stage as never)),
    placed: c.stage === "placed",
  };
  const { next, missing } = nextStep(ev);
  const completeness = profileCompleteness(c, docCount);

  return (
    <>
      {welcome && (
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-gold/50 bg-gold-soft p-5">
          <PartyPopper className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Welcome to PEEPs, {c.firstName}. Your PEEPs ID is {c.pepId}.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your profile and upload your CV. A consultant will review it and contact you about verification and assessment.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="grain relative overflow-hidden rounded-3xl bg-ink p-6 text-ink-foreground sm:p-8">
          <p className="font-mono text-xs text-white/60">{c.pepId}</p>
          <h1 className="font-display mt-2 text-3xl font-medium sm:text-4xl">Hello, {c.firstName}.</h1>
          <p className="mt-1 text-white/70">
            {c.profession} · {sectorName(c.sectorCode)}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StageBadge stage={c.stage} className="border-white/20 bg-white/10 text-white" />
            <ClassificationBadge value={c.classification} />
          </div>
          {next && missing.length > 0 && (
            <div className="mt-6 rounded-2xl bg-white/[0.06] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">To reach {STAGE_META[next].label}</p>
              <ul className="mt-3 grid gap-2">
                {missing.map((m) => (
                  <li key={m.key} className="flex gap-2 text-sm text-white/85">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-gold" />
                    {GUIDANCE[m.key] ?? m.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {c.stage === "placed" && (
            <p className="mt-6 flex items-center gap-2 text-gold">
              <BadgeCheck className="size-5" /> Congratulations on your placement!
            </p>
          )}
        </section>

        <Panel title="Profile strength" description="A complete profile helps us match you faster">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-semibold">{completeness.percent}%</span>
            <Link href="/portal/candidate/profile" className={buttonVariants({ size: "sm", variant: completeness.percent < 100 ? "default" : "outline" })}>
              {completeness.percent < 100 ? "Complete profile" : "Edit profile"}
            </Link>
          </div>
          <Progress value={completeness.percent} className="mt-3" label="Profile completeness" />
          {completeness.missing.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {completeness.missing.map((m) => (
                <li key={m} className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground">{m}</li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Panel title="Your quality ladder" description="Each stage is earned with recorded evidence">
          <LadderSteps stage={c.stage} />
        </Panel>

        <div className="grid content-start gap-6">
          <Panel
            title="Applications"
            bodyClassName="p-0"
            actions={<Link href="/portal/candidate/jobs" className="text-xs font-medium text-primary hover:underline">Browse opportunities</Link>}
          >
            {apps.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">
                No applications yet. PEEPs consultants may also put you forward for roles that match your profile.
              </div>
            ) : (
              <ul className="divide-y">
                {apps.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {SHORTLISTED_OR_LATER.includes(a.stage as never) ? a.employer : "Employer disclosed at shortlist"} · {a.city} · {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <Badge variant={a.stage === "placed" ? "solid" : a.stage === "rejected" ? "muted" : SHORTLISTED_OR_LATER.includes(a.stage as never) ? "gold" : "outline"}>
                      {APP_STATUS[a.stage] ?? a.stage}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title={
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4 text-gold" /> Career services
              </span>
            }
            description="Optional and paid. You never need them to be put forward for a role."
          >
            <ActionForm action={requestCareerService} resetOnSuccess className="grid gap-3">
              <Field label="Service" name="service">
                <Select id="service" name="service" defaultValue={CAREER_SERVICES[0].title}>
                  {CAREER_SERVICES.map((s) => <option key={s.title}>{s.title}</option>)}
                </Select>
              </Field>
              <Field label="What are you working towards?" name="message">
                <Textarea id="message" name="message" rows={3} />
              </Field>
              <FormMessage />
              <div><SubmitButton size="sm" variant="outline" pendingText="Sending…">Request</SubmitButton></div>
            </ActionForm>
          </Panel>
        </div>
      </div>
    </>
  );
}
