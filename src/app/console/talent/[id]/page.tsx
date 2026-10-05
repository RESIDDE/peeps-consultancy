import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { AlertTriangle, Pencil, Printer } from "lucide-react";
import { db } from "@/db";
import { applications, assessments, candidates, partners, user, vacancies, employers, verificationChecks } from "@/db/schema";
import { KeyValue, PageHeader, Panel } from "@/components/peeps/blocks";
import { CheckStatusBadge, ClassificationBadge, LadderBar, StageBadge } from "@/components/peeps/stage";
import { ScoreGrid } from "@/components/peeps/scores";
import { AssessmentDialog, CheckDialog, ClassificationForm } from "@/components/console/talent-forms";
import { DocumentsPanel, NotesPanel, TimelinePanel } from "@/components/console/panels";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CHECK_META, CHECK_TYPES, STAGE_META, blockingFailures, nextStep, type CheckRecord } from "@/lib/quality";
import { APPLICATION_STAGES, SHORTLISTED_OR_LATER } from "@/lib/pipeline";
import { ASSESSMENT_TEMPLATES, AVAILABILITY, CANDIDATE_SOURCES, EMPLOYMENT_STATUS, INTERVIEW_TEMPLATE, labelOf, sectorName, templateForSector, type TemplateKey } from "@/lib/taxonomy";
import { formatDate, salaryRange } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [c] = await db.select({ f: candidates.firstName, l: candidates.lastName }).from(candidates).where(eq(candidates.id, id));
  return { title: c ? `${c.f} ${c.l}` : "Candidate" };
}

export default async function CandidateRecord({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [c] = await db.select().from(candidates).where(eq(candidates.id, id));
  if (!c) notFound();

  const [checks, assessmentRows, apps, partner] = await Promise.all([
    db
      .select({ type: verificationChecks.type, status: verificationChecks.status, notes: verificationChecks.notes, verifiedAt: verificationChecks.verifiedAt, by: user.name })
      .from(verificationChecks)
      .leftJoin(user, eq(user.id, verificationChecks.verifiedById))
      .where(eq(verificationChecks.candidateId, id)),
    db
      .select({ a: assessments, by: user.name })
      .from(assessments)
      .leftJoin(user, eq(user.id, assessments.assessorId))
      .where(eq(assessments.candidateId, id))
      .orderBy(desc(assessments.assessedAt)),
    db
      .select({ id: applications.id, stage: applications.stage, matchScore: applications.matchScore, vacancyId: vacancies.id, ref: vacancies.ref, title: vacancies.title, employer: employers.name })
      .from(applications)
      .innerJoin(vacancies, eq(vacancies.id, applications.vacancyId))
      .innerJoin(employers, eq(employers.id, vacancies.employerId))
      .where(eq(applications.candidateId, id)),
    c.partnerId ? db.select({ name: partners.name }).from(partners).where(eq(partners.id, c.partnerId)) : Promise.resolve([]),
  ]);

  const evidence = {
    consented: !!c.consentAt,
    checks: checks as CheckRecord[],
    classification: c.classification,
    shortlisted: apps.some((a) => SHORTLISTED_OR_LATER.includes(a.stage as never)),
    placed: c.stage === "placed",
  };
  const { next, missing } = nextStep(evidence);
  const failures = blockingFailures(evidence.checks);
  const techTemplate = templateForSector(c.sectorCode);

  return (
    <>
      <PageHeader
        back={{ href: "/console/talent", label: "Talent Registry" }}
        eyebrow={<span className="font-mono">{c.pepId}</span>}
        title={`${c.firstName} ${c.lastName}`}
        description={`${c.profession} · ${sectorName(c.sectorCode)} · ${c.yearsExperience} years · ${c.city ?? "Location not set"}`}
        actions={
          <>
            <Link href={`/console/talent/${c.id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Pencil /> Edit profile
            </Link>
            <Link href={`/console/talent/${c.id}/cv`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Printer /> PEEPs CV
            </Link>
          </>
        }
      />

      {/* Ladder */}
      <section className="mb-6 rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StageBadge stage={c.stage} className="text-sm" />
            <ClassificationBadge value={c.classification} />
          </div>
          {next && (
            <p className="text-sm text-muted-foreground">
              Next: <span className="font-medium text-foreground">{STAGE_META[next].label}</span>
            </p>
          )}
        </div>
        <LadderBar stage={c.stage} showLabels className="mt-4" />
        {missing.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {missing.map((m) => (
              <span key={m.key} className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground">
                {m.label}
              </span>
            ))}
          </div>
        )}
        {failures.length > 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Blocked: {failures.map((f) => CHECK_META[f.type].label).join(", ")} failed. Resolve the issue before this candidate can progress.
          </p>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid content-start gap-6">
          <Panel title="Verification checks" description="Every stage is earned by these. Record what was checked and how." bodyClassName="p-0">
            <ul className="divide-y">
              {CHECK_TYPES.map((type) => {
                const ch = checks.find((x) => x.type === type);
                return (
                  <li key={type} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{CHECK_META[type].label}</p>
                        <CheckStatusBadge status={ch?.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ch?.notes ?? CHECK_META[type].description}</p>
                      {ch?.verifiedAt && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {ch.by ?? "Staff"} · {formatDate(ch.verifiedAt)}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <CheckDialog candidateId={c.id} type={type} status={ch?.status} notes={ch?.notes} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            title="Assessments"
            description="Rubric-scored. Recording one updates the interview or skills-assessment check."
            actions={
              <>
                <AssessmentDialog candidateId={c.id} kind="interview" template={INTERVIEW_TEMPLATE} />
                <AssessmentDialog candidateId={c.id} kind="technical" template={techTemplate} />
              </>
            }
          >
            {assessmentRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assessments recorded yet.</p>
            ) : (
              <div className="grid gap-5">
                {assessmentRows.map(({ a, by }) => {
                  const t = a.template === "interview" ? INTERVIEW_TEMPLATE : ASSESSMENT_TEMPLATES[a.template as TemplateKey];
                  return (
                    <article key={a.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{t?.name ?? a.template}</p>
                        <Badge variant={a.outcome === "recommend" ? "default" : a.outcome === "develop" ? "warning" : "destructive"}>
                          {a.outcome === "recommend" ? "Recommend" : a.outcome === "develop" ? "Develop" : "Not suitable"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {by ?? "Assessor"} · {formatDate(a.assessedAt)}
                      </p>
                      {t && <div className="mt-3"><ScoreGrid template={t} scores={a.scores} /></div>}
                      {a.evidence && <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">{a.evidence}</p>}
                    </article>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel title="Classification" description="Entry · Competent · Experienced · Specialist, with a written rationale">
            <ClassificationForm candidateId={c.id} classification={c.classification} rationale={c.classificationRationale} />
          </Panel>

          <Panel title="Vacancy pipelines" bodyClassName="p-0">
            {apps.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Not yet in any vacancy pipeline. Add them from a vacancy&apos;s suggested matches.</p>
            ) : (
              <ul className="divide-y">
                {apps.map((a) => (
                  <li key={a.id}>
                    <Link href={`/console/vacancies/${a.vacancyId}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.ref} · {a.employer}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {a.matchScore != null && <span className="text-xs tabular-nums text-muted-foreground">{a.matchScore}% match</span>}
                        <Badge variant="outline">{APPLICATION_STAGES.find((s) => s.value === a.stage)?.label}</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Profile">
            <KeyValue
              items={[
                ["Email", c.email],
                ["Phone", c.phone],
                ["Availability", labelOf(AVAILABILITY, c.availability)],
                ["Status", labelOf(EMPLOYMENT_STATUS, c.employmentStatus)],
                ["Expectation /mo", salaryRange(c.salaryMin, c.salaryMax)],
                ["Relocate", c.willingToRelocate ? "Yes" : "No"],
                ["Source", labelOf(CANDIDATE_SOURCES, c.source)],
                ["Partner", partner[0]?.name ?? "—"],
                ["Consent", c.consentAt ? `${formatDate(c.consentAt)}` : "Missing"],
                ["Consent version", c.consentVersion ?? "—"],
              ]}
            />
            {c.summary && <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{c.summary}</p>}
            <div className="mt-4 grid gap-3 border-t pt-4">
              {([
                ["Skills", c.skills],
                ["Software", c.software],
                ["Qualifications", c.qualifications],
                ["Training", c.training],
                ["Languages", c.languages],
              ] as const).map(([k, v]) =>
                v.length ? (
                  <div key={k}>
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {v.map((s) => <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs">{s}</span>)}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
            {(c.education.length > 0 || c.experience.length > 0) && (
              <div className="mt-4 grid gap-3 border-t pt-4 text-sm">
                {c.experience.map((e, i) => (
                  <div key={`x${i}`}>
                    <p className="font-medium">{e.title} · {e.employer}</p>
                    <p className="text-xs text-muted-foreground">{[e.start, e.end].filter(Boolean).join(" – ")}</p>
                  </div>
                ))}
                {c.education.map((e, i) => (
                  <div key={`e${i}`}>
                    <p className="font-medium">{e.qualification}</p>
                    <p className="text-xs text-muted-foreground">{e.institution}{e.year ? ` · ${e.year}` : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <DocumentsPanel candidateId={c.id} />
          <NotesPanel entity="candidate" entityId={c.id} />
          <TimelinePanel entity="candidate" entityId={c.id} />
        </div>
      </div>
    </>
  );
}
