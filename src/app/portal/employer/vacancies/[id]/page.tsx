import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Users } from "lucide-react";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PortalPageHeader, PortalTag } from "@/components/portal/portal-kit";
import { TalentReport } from "@/components/peeps/talent-report";
import { loadShortlist, ShortlistHeader } from "@/components/peeps/shortlist-report";
import { PrintButton } from "@/components/print-button";
import { respondToCandidate } from "@/server/actions/portal";
import { currentEmployer } from "@/server/portal";
import { VACANCY_STATUSES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

export const metadata = { title: "Vacancy Shortlist" };

const TRACK = VACANCY_STATUSES.filter((s) => s.value !== "closed");
const pad = (n: number) => String(n).padStart(2, "0");

export default async function EmployerVacancy({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ posted?: string }>;
}) {
  const [{ id }, { posted }] = await Promise.all([params, searchParams]);
  const { employer } = await currentEmployer();
  const data = await loadShortlist(id);

  // Employers only ever see their own vacancies.
  if (!data || data.v.employerId !== employer.id) notFound();
  const idx = TRACK.findIndex((s) => s.value === data.v.status);

  return (
    <>
      <div className="no-print mb-6">
        <Link
          href="/portal/employer"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to talent pipeline</span>
        </Link>
      </div>

      <PortalPageHeader
        label={`MANDATE REF: ${data.v.ref} // SHORTLIST DOSSIER`}
        title={data.v.title}
        lede={`${data.v.city || "Nigeria"} · Sourcing for ${data.v.headcount} role${data.v.headcount > 1 ? "s" : ""}. Every shortlisted candidate profile includes verified competencies, identity checks, and recorded assessments.`}
        actions={
          data.entries.length > 0 ? (
            <div className="no-print">
              <PrintButton label="Print Shortlist" />
            </div>
          ) : undefined
        }
      />

      {posted && (
        <div className="no-print mb-8 flex items-center gap-3 rounded-[7px] border border-primary/40 bg-primary/10 p-5 text-sm text-foreground">
          <CheckCircle2 className="size-5 text-primary shrink-0" />
          <span>Request {data.v.ref} received. Your designated PEEPs consultant will contact you within one business day.</span>
        </div>
      )}

      {/* Studio Stepped Pipeline Progress Rail */}
      <div className="no-print mb-10 rounded-[7px] border border-border bg-card/60 p-6 backdrop-blur-xs">
        <p className="label text-[0.72rem] text-muted-foreground mb-4">Mandate Pipeline Progression</p>
        <ol className="flex gap-2 overflow-x-auto pb-1" aria-label="Vacancy progress">
          {TRACK.map((s, i) => {
            const completed = i <= idx;
            const current = i === idx;
            return (
              <li key={s.value} className="min-w-28 flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    current
                      ? "bg-primary shadow-xs"
                      : completed
                        ? "bg-foreground/80"
                        : "bg-muted",
                  )}
                />
                <div className="mt-2 flex items-center gap-1.5 font-mono">
                  <span className={cn("text-[10px]", completed ? "text-primary font-bold" : "text-muted-foreground/60")}>
                    {pad(i + 1)}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] truncate uppercase tracking-wider",
                      current ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Shortlist Content Area */}
      <div className="print-sheet rounded-[7px] border border-border bg-card/80 p-6 md:p-10 shadow-sm backdrop-blur-xs">
        <ShortlistHeader v={data.v} employer={data.employer} />

        <div className="no-print my-8 flex items-center justify-between border-y border-border py-4">
          <div>
            <span className="label text-[0.75rem] text-muted-foreground">Shortlist Dossier</span>
            <h2 className="font-display text-xl font-medium text-foreground">
              Evaluated Candidates ({data.entries.length})
            </h2>
          </div>
          <PortalTag variant="primary">
            {data.entries.length} Profile{data.entries.length === 1 ? "" : "s"} Available
          </PortalTag>
        </div>

        {data.entries.length === 0 ? (
          <div className="rounded-[7px] border border-dashed border-border p-12 text-center my-6">
            <Users className="mx-auto size-8 text-muted-foreground mb-3" />
            <h3 className="font-display text-lg text-foreground">Your shortlist is currently being assembled</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-[42ch] mx-auto">
              Our consultants are vetting, interviewing, and assessing candidates against your brief. Candidate profiles with recorded evidence will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {data.entries.map((e) => (
              <div key={e.app.id} className="rounded-[7px] border border-border/80 bg-background/50 p-6">
                <TalentReport
                  candidate={e.c}
                  checks={e.checks}
                  assessments={e.assessments}
                  showContact={e.showContact}
                  summary={e.app.shortlistSummary}
                  matchScore={e.app.matchScore}
                />

                <div className="no-print mt-6 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
                  {e.app.employerDecision ? (
                    <div className="rounded-[4px] border border-border bg-muted/50 px-3.5 py-2 font-mono text-xs">
                      Recorded Decision: <span className="font-semibold text-foreground uppercase">{e.app.employerDecision}</span>
                    </div>
                  ) : e.app.stage === "shortlisted" ? (
                    <>
                      <Dialog
                        trigger="Request interview"
                        triggerVariant="default"
                        triggerSize="default"
                        title={`Interview ${e.c.firstName}?`}
                        description="We'll coordinate schedules and release full contact credentials."
                      >
                        <ActionForm action={respondToCandidate} className="grid gap-3">
                          <input type="hidden" name="applicationId" value={e.app.id} />
                          <input type="hidden" name="decision" value="interview" />
                          <Field label="Preferred dates or notes" name="note">
                            <Textarea id={`n-${e.app.id}`} name="note" rows={3} className="rounded-[5px]" />
                          </Field>
                          <FormMessage />
                          <div>
                            <SubmitButton pendingText="Sending Request…" className="rounded-[5px] font-mono text-xs uppercase tracking-wider">
                              Confirm Interview Request
                            </SubmitButton>
                          </div>
                        </ActionForm>
                      </Dialog>

                      <Dialog
                        trigger="Not a fit"
                        triggerVariant="ghost"
                        triggerSize="default"
                        title="Decline this candidate"
                        description="Your structured feedback helps us refine replacement profiles on your shortlist."
                      >
                        <ActionForm action={respondToCandidate} className="grid gap-3">
                          <input type="hidden" name="applicationId" value={e.app.id} />
                          <input type="hidden" name="decision" value="decline" />
                          <Field label="Reason for decline" name="note">
                            <Textarea id={`d-${e.app.id}`} name="note" rows={3} className="rounded-[5px]" />
                          </Field>
                          <FormMessage />
                          <div>
                            <SubmitButton variant="outline" pendingText="Submitting…" className="rounded-[5px] font-mono text-xs uppercase tracking-wider">
                              Submit Feedback
                            </SubmitButton>
                          </div>
                        </ActionForm>
                      </Dialog>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
