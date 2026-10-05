import Link from "next/link";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { AutoSubmitSelect } from "@/components/ui/auto-submit-select";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { StageBadge } from "@/components/peeps/stage";
import { moveApplication, recordPlacement, updateShortlistSummary } from "@/server/actions/console";
import { APPLICATION_STAGES, INVOICE_STATUSES, SHORTLISTED_OR_LATER, type ApplicationStage } from "@/lib/pipeline";

export interface PipelineItem {
  id: string;
  stage: string;
  origin: string;
  matchScore: number | null;
  shortlistSummary: string | null;
  employerDecision: string | null;
  candidateId: string;
  name: string;
  pepId: string;
  qualityStage: string;
  salaryMin: number | null;
}

export function PipelineCard({ item, salaryMid }: { item: PipelineItem; salaryMid: number | null }) {
  const placed = item.stage === "placed";
  const canPlace = SHORTLISTED_OR_LATER.includes(item.stage as ApplicationStage) && !placed;
  const suggestedAnnual = (salaryMid ?? item.salaryMin ?? 0) * 12;
  return (
    <li className="rounded-xl border bg-card p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/console/talent/${item.candidateId}`} className="block truncate text-sm font-semibold hover:text-primary">
            {item.name}
          </Link>
          <p className="font-mono text-[10px] text-muted-foreground">{item.pepId}</p>
        </div>
        {item.matchScore != null && (
          <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-secondary-foreground" title="Match score">
            {item.matchScore}%
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StageBadge stage={item.qualityStage} className="text-[10px]" />
        {item.origin === "applied" && <span className="text-[10px] text-muted-foreground">Applied</span>}
      </div>
      {item.employerDecision && <p className="mt-2 rounded-md bg-gold-soft px-2 py-1 text-[11px]">Client: {item.employerDecision}</p>}
      {!placed && (
        <div className="mt-2.5 grid gap-1.5">
          <ActionForm action={moveApplication}>
            <input type="hidden" name="applicationId" value={item.id} />
            <AutoSubmitSelect name="stage" defaultValue={item.stage} aria-label={`Move ${item.name}`} className="h-7 rounded-md px-2 pr-7 text-xs">
              {APPLICATION_STAGES.filter((s) => s.value !== "placed").map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </AutoSubmitSelect>
          </ActionForm>
          <div className="flex flex-wrap gap-1.5">
            <Dialog
              trigger={item.shortlistSummary ? "Edit summary" : "Write summary"}
              triggerVariant="ghost"
              triggerClassName="h-7 px-2 text-[11px]"
              title="Shortlist summary"
              description="Why this candidate fits this vacancy. Shown to the employer in the shortlist report."
            >
              <ActionForm action={updateShortlistSummary} className="grid gap-3">
                <input type="hidden" name="applicationId" value={item.id} />
                <Field label="Summary" name="summary">
                  <Textarea id={`sum-${item.id}`} name="summary" rows={5} defaultValue={item.shortlistSummary ?? ""} />
                </Field>
                <FormMessage />
                <div><SubmitButton size="sm" pendingText="Saving…">Save summary</SubmitButton></div>
              </ActionForm>
            </Dialog>
            {canPlace && (
              <Dialog trigger="Record placement" triggerVariant="gold" triggerClassName="h-7 px-2 text-[11px]" title={`Place ${item.name}`} description="Creates the placement, the recruitment revenue entry and starts retention tracking.">
                <ActionForm action={recordPlacement} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="applicationId" value={item.id} />
                  <Field label="Start date" name="startDate" required><Input id={`sd-${item.id}`} name="startDate" type="date" required /></Field>
                  <Field label="Annual salary (₦)" name="annualSalary"><Input id={`as-${item.id}`} name="annualSalary" inputMode="numeric" defaultValue={suggestedAnnual || ""} /></Field>
                  <Field label="Placement fee (₦)" name="fee" required hint="Per the agreed proposal"><Input id={`fee-${item.id}`} name="fee" inputMode="numeric" required defaultValue={suggestedAnnual ? Math.round((suggestedAnnual * 0.15) / 5000) * 5000 : ""} /></Field>
                  <Field label="Invoice" name="invoiceStatus">
                    <Select id={`inv-${item.id}`} name="invoiceStatus" defaultValue="draft">
                      {INVOICE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </Field>
                  <div className="sm:col-span-2"><FormMessage /></div>
                  <div><SubmitButton pendingText="Recording…">Record placement</SubmitButton></div>
                </ActionForm>
              </Dialog>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
