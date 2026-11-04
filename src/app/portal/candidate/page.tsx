import Link from "next/link";
import { and, count, eq } from "drizzle-orm";
import { ArrowRight, ArrowUpRight, BadgeCheck, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { db } from "@/db";
import { applications, documents, employers, vacancies, verificationChecks } from "@/db/schema";
import {
  PortalCandidateLadder,
  PortalMarkRule,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
  PortalTag,
} from "@/components/portal/portal-kit";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestCareerService } from "@/server/actions/portal";
import { currentCandidate } from "@/server/portal";
import { nextStep, STAGE_META, type CheckRecord, type Stage } from "@/lib/quality";
import { SHORTLISTED_OR_LATER } from "@/lib/pipeline";
import { GUIDANCE, profileCompleteness } from "@/lib/candidate-guidance";
import { CAREER_SERVICES } from "@/lib/content";
import { CLASSIFICATIONS, labelOf, sectorName } from "@/lib/taxonomy";
import { formatDate } from "@/lib/format";

/** Candidate-facing labels: honest, transparent status. */
const APP_STATUS: Record<string, { label: string; variant: "default" | "primary" | "accent" | "muted" | "solid" }> = {
  applied: { label: "Received", variant: "muted" },
  sourced: { label: "Under Review", variant: "muted" },
  screened: { label: "Screened", variant: "default" },
  interviewed: { label: "Assessed", variant: "default" },
  shortlisted: { label: "Shortlisted to Employer", variant: "accent" },
  client_interview: { label: "Employer Interview", variant: "primary" },
  offer: { label: "Offer Stage", variant: "primary" },
  placed: { label: "Hired & Placed", variant: "solid" },
  rejected: { label: "Not Progressed", variant: "muted" },
};

export default async function CandidateDashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { candidate: c } = await currentCandidate();

  const [checks, apps, [{ n: docCount }]] = await Promise.all([
    db
      .select({ type: verificationChecks.type, status: verificationChecks.status, notes: verificationChecks.notes })
      .from(verificationChecks)
      .where(eq(verificationChecks.candidateId, c.id)),
    db
      .select({
        id: applications.id,
        stage: applications.stage,
        createdAt: applications.createdAt,
        title: vacancies.title,
        employer: employers.name,
        city: vacancies.city,
      })
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
        <div className="mb-8 flex items-start gap-4 rounded-[7px] border border-primary/30 bg-primary/5 p-5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              Welcome to PEEPs, {c.firstName}. Your PEEPs ID is {c.pepId}.
            </p>
            <p className="mt-1 text-muted-foreground">
              Complete your profile and upload your CV. A consultant will review it and guide you through verification and assessment.
            </p>
          </div>
        </div>
      )}

      {/* Studio Opening Header */}
      <PortalPageHeader
        label={`CANDIDATE ID: ${c.pepId} // NIGERIAN TALENT REGISTRY`}
        title={`Hello, ${c.firstName}.`}
        lede={`${c.profession || "Candidate"} · ${sectorName(c.sectorCode)}. Your profile is evaluated against verified competencies, not unvetted assertions.`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/portal/candidate/profile"
              className="inline-flex items-center gap-2 rounded-[7px] border border-border bg-card px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-foreground/40"
            >
              <FileText className="size-3.5" />
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/portal/candidate/jobs"
              className="inline-flex items-center gap-2 rounded-[7px] bg-foreground px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90"
            >
              <span>Explore Roles</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        }
      />

      {/* Studio Metric & Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <PortalStatCard
          index={1}
          label="Current Quality Stage"
          value={
            <div className="flex flex-col">
              <span className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-display">
                {STAGE_META[c.stage as Stage]?.short ?? c.stage}
              </span>
              <span className="font-mono text-xs text-primary font-medium tracking-normal mt-1">
                {STAGE_META[c.stage as Stage]?.label}
              </span>
            </div>
          }
          note="Stage is backed by verified documentary evidence."
          tone="default"
        />

        <PortalStatCard
          index={2}
          label="Talent Classification"
          value={
            <div className="flex flex-col">
              <span className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-display">
                {c.classification ? `Tier ${c.classification.toUpperCase()}` : "Pending"}
              </span>
              <span className="font-mono text-xs text-muted-foreground tracking-normal mt-1">
                {c.classification ? labelOf(CLASSIFICATIONS, c.classification) : "Awaiting review"}
              </span>
            </div>
          }
          note="Evaluated on years of verified practice & output."
          tone="default"
        />

        <PortalStatCard
          index={3}
          label="Profile Completeness"
          value={`${completeness.percent}%`}
          note={completeness.percent < 100 ? `${completeness.missing.length} item(s) pending for full scoring.` : "Profile fully completed & evidenced."}
          tone={completeness.percent === 100 ? "accent" : "default"}
          href="/portal/candidate/profile"
        />

        <PortalStatCard
          index={4}
          label="Active Applications"
          value={String(apps.length).padStart(2, "0")}
          note={apps.length > 0 ? "Roles tracked with real-time status." : "No applications yet. Search open roles."}
          tone="default"
          href="/portal/candidate/jobs"
        />
      </div>

      {/* Advancement Next-Step Notification */}
      {next && missing.length > 0 && (
        <div className="mb-10 rounded-[7px] border border-border bg-card/40 p-6 md:p-7 backdrop-blur-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <p className="label text-[0.75rem] text-muted-foreground">Progression Roadmap</p>
              <h2 className="font-display text-xl font-normal tracking-[-0.03em] mt-0.5">
                Requirements to advance to <span className="text-primary">{STAGE_META[next].label}</span>
              </h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {missing.length} requirement{missing.length === 1 ? "" : "s"} remaining
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {missing.map((m) => (
              <div key={m.key} className="flex items-start gap-3 rounded-[5px] border border-border/60 bg-muted/20 p-3.5">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{GUIDANCE[m.key] ?? m.label}</p>
                  <p className="mt-0.5 font-mono text-[0.72rem] text-muted-foreground">{m.key}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {c.stage === "placed" && (
        <div className="mb-10 flex items-center gap-3 rounded-[7px] border border-primary/50 bg-primary/10 p-5 text-sm font-medium text-foreground">
          <BadgeCheck className="size-5 text-primary shrink-0" />
          <span>Congratulations on your verified placement! Your performance feedback loop is actively monitored.</span>
        </div>
      )}

      {/* Main Studio Two-Column Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.3fr] items-start">
        {/* Left Column: Interactive Quality Ladder */}
        <PortalPanel
          label="VERIFICATION RIGOUR"
          title="Your Quality Ladder"
          description="Every rung is earned through recorded identity, credentials, assessment, and reference checks."
        >
          <PortalCandidateLadder currentStage={c.stage} />
        </PortalPanel>

        {/* Right Column: Applications & Career Services */}
        <div className="space-y-8">
          {/* Applications list */}
          <PortalPanel
            label="OPPORTUNITIES PIPELINE"
            title="Applications & Submissions"
            description="Opportunities you have applied to or where PEEPs consultants have proposed your evidence profile."
            actions={
              <Link
                href="/portal/candidate/jobs"
                className="group flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary hover:text-foreground transition-colors"
              >
                <span>Browse Roles</span>
                <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            }
            bodyClassName="p-0"
          >
            {apps.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-display text-lg text-foreground">No applications currently active</p>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-[40ch] mx-auto">
                  When you apply to open roles or our consultants shortlist you to vetted employers, they will appear here.
                </p>
                <div className="mt-5">
                  <Link
                    href="/portal/candidate/jobs"
                    className="inline-flex items-center gap-2 rounded-[7px] border border-border bg-card px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
                  >
                    <span>View Open Opportunities</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {apps.map((a, i) => {
                  const statusInfo = APP_STATUS[a.stage] ?? { label: a.stage, variant: "default" as const };
                  const isShortlisted = SHORTLISTED_OR_LATER.includes(a.stage as never);

                  return (
                    <li key={a.id} className="p-5 transition-colors hover:bg-muted/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[0.7rem] text-muted-foreground">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <h3 className="font-display text-base font-medium truncate text-foreground">
                              {a.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {isShortlisted ? (
                              <span className="font-medium text-foreground">{a.employer}</span>
                            ) : (
                              <span>Employer disclosed upon shortlist</span>
                            )}{" "}
                            · {a.city} · Applied {formatDate(a.createdAt)}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <PortalTag variant={statusInfo.variant}>
                            {statusInfo.label}
                          </PortalTag>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </PortalPanel>

          {/* Profile Strength Checklist Panel */}
          <PortalPanel
            label="COMPLETION ENGINE"
            title="Profile Strength"
            description="A completed, evidenced profile increases your matching probability across client mandates."
            actions={
              <Link
                href="/portal/candidate/profile"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                {completeness.percent < 100 ? "Complete Now" : "Review"}
              </Link>
            }
          >
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl">{completeness.percent}%</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {docCount} document{docCount === 1 ? "" : "s"} uploaded
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${completeness.percent}%` }}
                />
              </div>

              {completeness.missing.length > 0 && (
                <div className="pt-2">
                  <p className="label text-[0.72rem] text-muted-foreground mb-2">Pending Elements:</p>
                  <ul className="flex flex-wrap gap-2">
                    {completeness.missing.map((m) => (
                      <li
                        key={m}
                        className="rounded-[4px] border border-dashed border-border px-2.5 py-1 font-mono text-[0.72rem] text-muted-foreground"
                      >
                        + {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </PortalPanel>

          {/* Career Services Request Panel */}
          <PortalPanel
            label="OPTIONAL ADVISORY"
            title={
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4 text-gold" />
                <span>Executive & Career Services</span>
              </span>
            }
            description="Optional executive coaching and technical refinement. You never need these to be put forward for client roles."
          >
            <ActionForm action={requestCareerService} resetOnSuccess className="space-y-4">
              <Field label="Service Selection" name="service">
                <Select id="service" name="service" defaultValue={CAREER_SERVICES[0].title} className="rounded-[5px]">
                  {CAREER_SERVICES.map((s) => (
                    <option key={s.title}>{s.title}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Objective / Career Focus" name="message">
                <Textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Outline your target sector, seniority, or specific skills you aim to strengthen..."
                  className="rounded-[5px]"
                />
              </Field>

              <FormMessage />

              <div className="pt-2">
                <SubmitButton
                  size="sm"
                  variant="outline"
                  pendingText="Submitting Request…"
                  className="rounded-[5px] font-mono text-xs uppercase tracking-wider"
                >
                  Submit Service Request
                </SubmitButton>
              </div>
            </ActionForm>
          </PortalPanel>
        </div>
      </div>

      <PortalMarkRule className="mt-16 w-3/4" mark="cross" />
    </>
  );
}
