import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { EmptyState } from "@/components/peeps/blocks";
import { TalentReport } from "@/components/peeps/talent-report";
import { loadShortlist, ShortlistHeader } from "@/components/peeps/shortlist-report";
import { PrintButton } from "@/components/print-button";
import { respondToCandidate } from "@/server/actions/portal";
import { currentEmployer } from "@/server/portal";
import { VACANCY_STATUSES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export const metadata = { title: "Vacancy" };

const TRACK = VACANCY_STATUSES.filter((s) => s.value !== "closed");

export default async function EmployerVacancy({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ posted?: string }> }) {
  const [{ id }, { posted }] = await Promise.all([params, searchParams]);
  const { employer } = await currentEmployer();
  const data = await loadShortlist(id);
  // Employers only ever see their own vacancies.
  if (!data || data.v.employerId !== employer.id) notFound();
  const idx = TRACK.findIndex((s) => s.value === data.v.status);

  return (
    <>
      {posted && (
        <div className="no-print mb-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-secondary/60 p-4 text-sm">
          <CheckCircle2 className="size-5 text-primary" />
          Request {data.v.ref} received. Your PEEPs consultant will be in touch within one working day.
        </div>
      )}

      <ol className="no-print mb-8 flex gap-1 overflow-x-auto" aria-label="Vacancy progress">
        {TRACK.map((s, i) => (
          <li key={s.value} className="min-w-24 flex-1">
            <span className={cn("block h-1.5 rounded-full", i <= idx ? "bg-primary" : "bg-muted")} />
            <span className={cn("mt-1.5 block text-[11px]", i === idx ? "font-semibold text-foreground" : "text-muted-foreground")}>{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="print-sheet rounded-3xl border bg-background p-5 sm:p-8">
        <ShortlistHeader v={data.v} employer={data.employer} />
        <div className="no-print mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Shortlisted candidates ({data.entries.length})</h2>
          {data.entries.length > 0 && <PrintButton label="Print shortlist" />}
        </div>
        {data.entries.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Your shortlist is being prepared"
            body="We're sourcing, verifying and assessing candidates against your brief. They'll appear here with the evidence behind each one."
          />
        ) : (
          <div className="grid gap-8">
            {data.entries.map((e) => (
              <div key={e.app.id}>
                <TalentReport
                  candidate={e.c}
                  checks={e.checks}
                  assessments={e.assessments}
                  showContact={e.showContact}
                  summary={e.app.shortlistSummary}
                  matchScore={e.app.matchScore}
                />
                <div className="no-print mt-3 flex flex-wrap items-center gap-2">
                  {e.app.employerDecision ? (
                    <p className="rounded-lg bg-muted px-3 py-2 text-sm">Your response: {e.app.employerDecision}</p>
                  ) : e.app.stage === "shortlisted" ? (
                    <>
                      <Dialog trigger="Request interview" triggerVariant="default" triggerSize="default" title={`Interview ${e.c.firstName}?`} description="We'll release full contact details and coordinate scheduling.">
                        <ActionForm action={respondToCandidate} className="grid gap-3">
                          <input type="hidden" name="applicationId" value={e.app.id} />
                          <input type="hidden" name="decision" value="interview" />
                          <Field label="Preferred dates or notes" name="note"><Textarea id={`n-${e.app.id}`} name="note" rows={3} /></Field>
                          <FormMessage />
                          <div><SubmitButton pendingText="Sending…">Request interview</SubmitButton></div>
                        </ActionForm>
                      </Dialog>
                      <Dialog trigger="Not a fit" triggerVariant="ghost" triggerSize="default" title="Decline this candidate" description="Your reason helps us refine the shortlist.">
                        <ActionForm action={respondToCandidate} className="grid gap-3">
                          <input type="hidden" name="applicationId" value={e.app.id} />
                          <input type="hidden" name="decision" value="decline" />
                          <Field label="Reason" name="note"><Textarea id={`d-${e.app.id}`} name="note" rows={3} /></Field>
                          <FormMessage />
                          <div><SubmitButton variant="outline" pendingText="Sending…">Send</SubmitButton></div>
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
