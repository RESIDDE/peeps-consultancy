import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { ArrowRight, ArrowUpRight, Briefcase, CheckCircle2, Plus, Star, Users } from "lucide-react";
import { db } from "@/db";
import { applications, candidates, placements, vacancies } from "@/db/schema";
import {
  PortalMarkRule,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
  PortalTag,
} from "@/components/portal/portal-kit";
import { PlacementFeedbackForm } from "@/components/portal/feedback-form";
import { currentEmployer } from "@/server/portal";
import { OPEN_VACANCY_STATUSES, SHORTLISTED_OR_LATER, VACANCY_STATUSES } from "@/lib/pipeline";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Overview" };

export default async function EmployerDashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { employer, contact } = await currentEmployer();

  const vacs = await db
    .select()
    .from(vacancies)
    .where(eq(vacancies.employerId, employer.id))
    .orderBy(desc(vacancies.createdAt));

  const ids = vacs.map((v) => v.id);

  const [shortlisted, pls] = await Promise.all([
    ids.length
      ? db
          .select({ vacancyId: applications.vacancyId, stage: applications.stage })
          .from(applications)
          .where(inArray(applications.vacancyId, ids))
      : Promise.resolve([] as { vacancyId: string; stage: string }[]),
    db
      .select({ p: placements, first: candidates.firstName, last: candidates.lastName, title: vacancies.title })
      .from(placements)
      .innerJoin(candidates, eq(candidates.id, placements.candidateId))
      .innerJoin(vacancies, eq(vacancies.id, placements.vacancyId))
      .where(eq(placements.employerId, employer.id))
      .orderBy(desc(placements.startDate)),
  ]);

  const shortlistBy = (vid: string) =>
    shortlisted.filter((s) => s.vacancyId === vid && SHORTLISTED_OR_LATER.includes(s.stage as never)).length;

  const open = vacs.filter((v) => OPEN_VACANCY_STATUSES.includes(v.status));
  const awaitingFeedback = pls.filter((p) => !p.p.feedback);
  const totalShortlisted = vacs.reduce((s, v) => s + shortlistBy(v.id), 0);

  return (
    <>
      {welcome && (
        <div className="mb-8 flex items-start gap-4 rounded-[7px] border border-primary/30 bg-primary/5 p-5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              Welcome to PEEPs, {contact.name.split(" ")[0]}.
            </p>
            <p className="mt-1 text-muted-foreground">
              Your employer workspace is configured for {employer.name}. Request talent whenever you need a verified shortlist.
            </p>
          </div>
        </div>
      )}

      {/* Studio Header Opening */}
      <PortalPageHeader
        label={`ORGANIZATION: ${employer.name.toUpperCase()} // TALENT PIPELINE`}
        title="Your Talent Pipeline"
        lede="Vetted talent cohorts matched to your brief. Every candidate arrives with verified credentials, identity checks, and recorded assessments."
        actions={
          <Link
            href="/portal/employer/vacancies/new"
            className="group inline-flex items-center gap-2 rounded-[7px] bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-background transition-opacity hover:opacity-90"
          >
            <Plus className="size-3.5" />
            <span>Request Talent</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        }
      />

      {/* Studio Metric Cards Grid (Key Facts Inspired) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <PortalStatCard
          index={1}
          label="Open Mandates"
          value={String(open.length).padStart(2, "0")}
          note="Active roles currently sourcing or under review."
          tone="default"
        />

        <PortalStatCard
          index={2}
          label="Shortlisted Profiles"
          value={String(totalShortlisted).padStart(2, "0")}
          note="~5 assessed candidates per role, backed by evidence."
          tone={totalShortlisted > 0 ? "accent" : "default"}
        />

        <PortalStatCard
          index={3}
          label="Verified Hires"
          value={String(pls.length).padStart(2, "0")}
          note="Candidates successfully onboarded through PEEPs."
          tone="default"
        />

        <PortalStatCard
          index={4}
          label="Membership Tier"
          value={
            <span className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-display">
              {employer.membershipTier === "corporate" ? "Corporate" : "Standard"}
            </span>
          }
          note="Dedicated consultant review & SLA response time."
          tone="default"
        />
      </div>

      {/* Feedback Request Panel (High priority §30 loop) */}
      {awaitingFeedback.length > 0 && (
        <div className="mb-10 rounded-[7px] border border-gold/40 bg-gold-soft/30 p-6 md:p-7 backdrop-blur-xs">
          <div className="border-b border-gold/30 pb-4">
            <p className="label text-[0.75rem] text-gold-foreground dark:text-gold">Post-Placement Evaluation</p>
            <h2 className="font-display text-xl font-normal tracking-[-0.03em] mt-0.5 text-foreground">
              How are your recent PEEPs hires performing?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Two minutes of structured feedback improves how we assess and prepare future cohorts for your team.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {awaitingFeedback.map(({ p, first, last, title }) => (
              <div key={p.id} className="rounded-[5px] border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4 font-mono text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{first} {last}</span>
                  <span>·</span>
                  <span>{title}</span>
                  <span>·</span>
                  <span>Started {formatDate(p.startDate)}</span>
                </div>
                <PlacementFeedbackForm placementId={p.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Vacancies List */}
      <div className="space-y-8">
        <PortalPanel
          label="MANDATE TRACKER"
          title="Active & Historical Vacancies"
          description="Track pipeline progression, shortlisted dossiers, and consultant status across all roles."
          actions={
            <Link
              href="/portal/employer/vacancies/new"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-primary hover:text-foreground transition-colors"
            >
              <Plus className="size-3.5" />
              <span>New Mandate</span>
            </Link>
          }
          bodyClassName="p-0"
        >
          {vacs.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-[5px] border border-dashed border-border text-muted-foreground mb-4">
                <Briefcase className="size-5" />
              </div>
              <h3 className="font-display text-lg text-foreground">No vacancies submitted yet</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-[42ch] mx-auto">
                Submit a talent request to begin. A consultant will conduct a vacancy analysis to define exact competency benchmarks.
              </p>
              <div className="mt-6">
                <Link
                  href="/portal/employer/vacancies/new"
                  className="inline-flex items-center gap-2 rounded-[7px] bg-foreground px-4 py-2 font-mono text-xs uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
                >
                  <Plus className="size-3.5" />
                  <span>Request Talent</span>
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {vacs.map((v, i) => {
                const n = shortlistBy(v.id);
                const statusMeta = VACANCY_STATUSES.find((s) => s.value === v.status);

                return (
                  <li key={v.id}>
                    <Link
                      href={`/portal/employer/vacancies/${v.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-xs text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                            {v.title}
                            {v.headcount > 1 && (
                              <span className="ml-2 font-mono text-xs text-muted-foreground">
                                × {v.headcount}
                              </span>
                            )}
                          </h3>
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          REF: {v.ref} · Opened {formatDate(v.createdAt)} · {v.city || "Nigeria"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {n > 0 ? (
                          <PortalTag variant="accent">
                            <Users className="size-3 mr-0.5" />
                            {n} Shortlisted
                          </PortalTag>
                        ) : (
                          <span className="font-mono text-[0.72rem] text-muted-foreground/70">
                            Sourcing active
                          </span>
                        )}

                        <PortalTag
                          variant={v.status === "filled" ? "solid" : v.status === "shortlisted" ? "primary" : "default"}
                        >
                          {statusMeta?.label ?? v.status}
                        </PortalTag>

                        <ArrowUpRight
                          aria-hidden
                          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </PortalPanel>

        {/* Hired Cohort Showcase */}
        {pls.some((p) => p.p.feedback) && (
          <PortalPanel
            label="VERIFIED PLACEMENTS"
            title="Placed Talent & Performance Ratings"
            description="Historical hires through PEEPs with recorded satisfaction ratings."
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {pls
                .filter((p) => p.p.feedback)
                .map(({ p, first, last, title }) => (
                  <li
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base font-medium text-foreground">
                        {first} {last}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-xs text-muted-foreground">{title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-[4px] border border-gold/40 bg-gold-soft/30 px-2.5 py-1 font-mono text-xs font-semibold text-gold-foreground dark:text-gold">
                        <Star className="size-3 fill-gold text-gold" />
                        <span>{p.feedback!.rating}/5</span>
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </PortalPanel>
        )}
      </div>

      <PortalMarkRule className="mt-16 w-3/4" mark="cross" />
    </>
  );
}
