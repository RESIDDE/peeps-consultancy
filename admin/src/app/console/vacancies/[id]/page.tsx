import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, ne } from "drizzle-orm";
import { FileText, Sparkles } from "lucide-react";
import { db } from "@/db";
import { applications, candidates, employers, vacancies } from "@/db/schema";
import { KeyValue, PageHeader, Panel } from "@/components/peeps/blocks";
import { NotesPanel, TimelinePanel } from "@/components/console/panels";
import { PipelineCard, type PipelineItem } from "@/components/console/pipeline-card";
import { StageBadge } from "@/components/peeps/stage";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { addToPipeline, updateVacancy } from "@/server/actions/console";
import { scoreMatch } from "@/lib/matching";
import { APPLICATION_STAGES, BOARD_COLUMNS, PACKAGES, VACANCY_STATUSES } from "@/lib/pipeline";
import { EMPLOYMENT_TYPES, labelOf, sectorName } from "@/lib/taxonomy";
import { formatDate, salaryRange } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [v] = await db.select({ t: vacancies.title, r: vacancies.ref }).from(vacancies).where(eq(vacancies.id, id));
  return { title: v ? `${v.r} ${v.t}` : "Vacancy" };
}

export default async function VacancyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({ v: vacancies, employer: employers.name, employerId: employers.id })
    .from(vacancies)
    .innerJoin(employers, eq(employers.id, vacancies.employerId))
    .where(eq(vacancies.id, id));
  if (!row) notFound();
  const { v } = row;

  const [apps, pool] = await Promise.all([
    db
      .select({
        id: applications.id,
        stage: applications.stage,
        origin: applications.origin,
        matchScore: applications.matchScore,
        shortlistSummary: applications.shortlistSummary,
        employerDecision: applications.employerDecision,
        candidateId: candidates.id,
        first: candidates.firstName,
        last: candidates.lastName,
        pepId: candidates.pepId,
        qualityStage: candidates.stage,
        salaryMin: candidates.salaryMin,
      })
      .from(applications)
      .innerJoin(candidates, eq(candidates.id, applications.candidateId))
      .where(eq(applications.vacancyId, id)),
    db.select().from(candidates).where(ne(candidates.stage, "placed")),
  ]);

  const items: PipelineItem[] = apps.map((a) => ({ ...a, name: `${a.first} ${a.last}` }));
  const inPipeline = new Set(items.map((i) => i.candidateId));
  const suggestions = pool
    .filter((c) => !inPipeline.has(c.id))
    .map((c) => ({ c, match: scoreMatch(c, v) }))
    .filter((s) => s.match.total >= 45)
    .sort((a, b) => b.match.total - a.match.total)
    .slice(0, 8);
  const salaryMid = v.salaryMin != null && v.salaryMax != null ? Math.round((v.salaryMin + v.salaryMax) / 2) : v.salaryMax ?? v.salaryMin;
  const rejected = items.filter((i) => i.stage === "rejected");
  const shortlistCount = items.filter((i) => ["shortlisted", "client_interview", "offer", "placed"].includes(i.stage)).length;

  return (
    <>
      <PageHeader
        back={{ href: "/console/vacancies", label: "Vacancies" }}
        eyebrow={
          <span>
            {v.ref} · <Link href={`/console/employers/${row.employerId}`} className="hover:underline">{row.employer}</Link>
          </span>
        }
        title={
          <>
            {v.title} {v.headcount > 1 && <span className="text-muted-foreground">× {v.headcount}</span>}
          </>
        }
        actions={
          <>
            <Badge variant={v.status === "filled" ? "solid" : "outline"} className="h-8 px-3 text-sm">{VACANCY_STATUSES.find((s) => s.value === v.status)?.label}</Badge>
            <Link href={`/console/vacancies/${v.id}/report`} className={buttonVariants({ size: "sm", variant: shortlistCount ? "default" : "outline" })}>
              <FileText /> Shortlist report {shortlistCount > 0 && `(${shortlistCount})`}
            </Link>
            <Dialog trigger="Edit vacancy" title="Edit vacancy" description="Status, analysis and matching criteria">
              <ActionForm action={updateVacancy} className="grid gap-4 sm:grid-cols-2">
                <input type="hidden" name="vacancyId" value={v.id} />
                <Field label="Status" name="status">
                  <Select id="status" name="status" defaultValue={v.status}>{VACANCY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
                </Field>
                <Field label="Headcount" name="headcount"><Input id="headcount" name="headcount" type="number" min={1} defaultValue={v.headcount} /></Field>
                <Field label="Salary from (₦/mo)" name="salaryMin"><Input id="salaryMin" name="salaryMin" inputMode="numeric" defaultValue={v.salaryMin ?? ""} /></Field>
                <Field label="Salary to (₦/mo)" name="salaryMax"><Input id="salaryMax" name="salaryMax" inputMode="numeric" defaultValue={v.salaryMax ?? ""} /></Field>
                <Field label="Min. experience" name="experienceMin"><Input id="experienceMin" name="experienceMin" type="number" min={0} defaultValue={v.experienceMin} /></Field>
                <Field label="City" name="city"><Input id="city" name="city" defaultValue={v.city ?? ""} /></Field>
                <Field label="Required skills" name="requiredSkills" className="sm:col-span-2"><Input id="requiredSkills" name="requiredSkills" defaultValue={v.requiredSkills.join(", ")} /></Field>
                <Field label="Vacancy analysis" name="analysisNotes" className="sm:col-span-2" hint="What kind of person will actually succeed here?">
                  <Textarea id="analysisNotes" name="analysisNotes" rows={4} defaultValue={v.analysisNotes ?? ""} />
                </Field>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <Checkbox name="published" defaultChecked={v.published} /> Publish on the candidate job board
                </label>
                <div className="sm:col-span-2"><FormMessage /></div>
                <div><SubmitButton pendingText="Saving…">Save vacancy</SubmitButton></div>
              </ActionForm>
            </Dialog>
          </>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel title="The brief">
          <KeyValue
            items={[
              ["Category", sectorName(v.sectorCode)],
              ["Service", PACKAGES.find((p) => p.value === v.package)?.short ?? v.package],
              ["Budget /mo", salaryRange(v.salaryMin, v.salaryMax)],
              ["Experience", `${v.experienceMin}+ years`],
              ["Location", v.city ?? "—"],
              ["Type", labelOf(EMPLOYMENT_TYPES, v.employmentType)],
              ["Deadline", formatDate(v.deadline)],
              ["Job board", v.published ? "Published" : "Not published"],
            ]}
          />
          {v.requiredSkills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1 border-t pt-4">
              {v.requiredSkills.map((s) => <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs">{s}</span>)}
            </div>
          )}
          {v.qualifications && <p className="mt-3 text-sm text-muted-foreground">Qualifications: {v.qualifications}</p>}
        </Panel>
        <Panel title="Vacancy analysis" description="Before any CVs: what will success look like here?">
          {v.analysisNotes ? (
            <p className="whitespace-pre-line text-sm leading-relaxed">{v.analysisNotes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No analysis recorded yet. Use &ldquo;Edit vacancy&rdquo; after the discovery call.</p>
          )}
          {v.description && <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{v.description}</p>}
        </Panel>
      </div>

      {/* Pipeline board */}
      <section aria-label="Pipeline" className="mb-6">
        <h2 className="mb-3 font-semibold">Pipeline</h2>
        <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex min-w-max gap-3">
            {BOARD_COLUMNS.map((col) => {
              const colItems = items.filter((i) => i.stage === col || (col === "sourced" && i.stage === "applied"));
              return (
                <div key={col} className="w-56 shrink-0 rounded-2xl bg-muted/60 p-2.5">
                  <div className="flex items-center justify-between px-1.5 pb-2">
                    <h3 className="text-sm font-semibold">{col === "sourced" ? "Sourced / applied" : APPLICATION_STAGES.find((s) => s.value === col)?.label}</h3>
                    <span className="rounded-full bg-card px-2 py-0.5 text-xs tabular-nums">{colItems.length}</span>
                  </div>
                  <ul className="grid gap-2">
                    {colItems.map((it) => <PipelineCard key={it.id} item={it} salaryMid={salaryMid ?? null} />)}
                    {colItems.length === 0 && <li className="rounded-xl border border-dashed py-5 text-center text-xs text-muted-foreground">—</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        {rejected.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Not progressed: {rejected.map((r) => r.name).join(", ")}
          </p>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-gold" /> Suggested matches
            </span>
          }
          description="Ranked by a transparent rule-based score. Open a row to see why. A ranking aid, not a decision."
          bodyClassName="p-0"
        >
          {suggestions.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No further candidates score above 45% for this brief.</p>
          ) : (
            <ul className="divide-y">
              {suggestions.map(({ c, match }) => (
                <li key={c.id} className="flex items-start">
                  <details className="group min-w-0 flex-1">
                    <summary className="flex cursor-pointer list-none items-center gap-3 py-3 pl-5 pr-2 hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
                      <span className="w-12 shrink-0 text-lg font-semibold tabular-nums">{match.total}%</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{c.firstName} {c.lastName} <span className="font-mono text-[11px] font-normal text-muted-foreground">{c.pepId}</span></span>
                        <span className="block truncate text-xs text-muted-foreground">{c.profession} · {c.yearsExperience} yrs · {c.city}</span>
                      </span>
                      <StageBadge stage={c.stage} className="hidden sm:inline-flex" />
                    </summary>
                    <div className="grid gap-2 bg-muted/30 px-5 py-4 sm:grid-cols-2">
                      {match.factors.map((f) => (
                        <div key={f.key} className="text-xs">
                          <div className="flex justify-between">
                            <span className="font-medium">{f.label}</span>
                            <span className="tabular-nums text-muted-foreground">{f.score}/{f.max}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-muted">
                            <div className="h-full rounded-full" style={{ width: `${(f.score / f.max) * 100}%`, background: "var(--chart-1)" }} />
                          </div>
                          <p className="mt-0.5 text-muted-foreground">{f.note}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                  <ActionForm action={addToPipeline} className="py-3 pl-2 pr-5">
                    <input type="hidden" name="vacancyId" value={v.id} />
                    <input type="hidden" name="candidateId" value={c.id} />
                    <SubmitButton size="sm" variant="outline" pendingText="Adding…">Add</SubmitButton>
                  </ActionForm>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <div className="grid content-start gap-6">
          <NotesPanel entity="vacancy" entityId={v.id} />
          <TimelinePanel entity="vacancy" entityId={v.id} />
        </div>
      </div>
    </>
  );
}
