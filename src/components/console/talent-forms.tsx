import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { recordAssessment, setCheck, setClassification } from "@/server/actions/console";
import { CHECK_META, type CheckType } from "@/lib/quality";
import { CLASSIFICATIONS, RUBRIC_LEVELS, type AssessmentTemplate } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "passed", label: "Passed", cls: "peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary" },
  { value: "pending", label: "Pending", cls: "peer-checked:bg-warning peer-checked:text-white peer-checked:border-warning" },
  { value: "failed", label: "Failed", cls: "peer-checked:bg-destructive peer-checked:text-white peer-checked:border-destructive" },
  { value: "not_applicable", label: "N/A", cls: "peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground" },
];

export function CheckDialog({
  candidateId,
  type,
  status,
  notes,
}: {
  candidateId: string;
  type: CheckType;
  status?: string | null;
  notes?: string | null;
}) {
  const meta = CHECK_META[type];
  const options = STATUS_OPTIONS.filter((o) => o.value !== "not_applicable" || meta.allowNA);
  return (
    <Dialog trigger={status ? "Update" : "Record"} triggerVariant={status ? "ghost" : "outline"} title={meta.label} description={meta.description}>
      <ActionForm action={setCheck} className="grid gap-4">
        <input type="hidden" name="candidateId" value={candidateId} />
        <input type="hidden" name="type" value={type} />
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Result</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {options.map((o) => (
              <label key={o.value} className="cursor-pointer">
                <input type="radio" name="status" value={o.value} defaultChecked={(status ?? "passed") === o.value} className="peer sr-only" />
                <span className={cn("block rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring", o.cls)}>
                  {o.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Evidence / notes" name="notes" hint="What was checked, how, and with whom. Required for N/A or Failed.">
          <Textarea id={`notes-${type}`} name="notes" defaultValue={notes ?? ""} rows={4} />
        </Field>
        <FormMessage />
        <SubmitButton pendingText="Saving…">Save check</SubmitButton>
      </ActionForm>
    </Dialog>
  );
}

function RubricFields({ template }: { template: AssessmentTemplate }) {
  return (
    <div className="grid gap-4">
      {template.criteria.map((c) => (
        <fieldset key={c.key}>
          <legend className="text-sm font-medium">
            {c.label} <span className="font-normal text-muted-foreground">· {c.focus}</span>
          </legend>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {RUBRIC_LEVELS.map((l) => (
              <label key={l.value} className="cursor-pointer" title={l.hint}>
                <input type="radio" name={`score_${c.key}`} value={l.value} required className="peer sr-only" />
                <span className="block rounded-lg border px-1 py-1.5 text-center text-[11px] leading-tight transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  <span className="block text-sm font-semibold">{l.value}</span>
                  {l.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

export function AssessmentDialog({
  candidateId,
  kind,
  template,
}: {
  candidateId: string;
  kind: "interview" | "technical";
  template: AssessmentTemplate;
}) {
  return (
    <Dialog
      trigger={kind === "interview" ? "Record interview" : "Record technical assessment"}
      triggerVariant={kind === "interview" ? "outline" : "default"}
      title={template.name}
      description="Score each criterion against the rubric and record the evidence. The outcome updates the matching ladder check."
    >
      <ActionForm action={recordAssessment} className="grid gap-5">
        <input type="hidden" name="candidateId" value={candidateId} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="template" value={template.key} />
        <RubricFields template={template} />
        <Field label="Evidence" name="evidence" required hint="Concrete observations, test results and examples given.">
          <Textarea id={`evidence-${kind}`} name="evidence" rows={4} required />
        </Field>
        <Field label="Outcome" name="outcome" required>
          <Select id={`outcome-${kind}`} name="outcome" defaultValue="recommend">
            <option value="recommend">Recommend: meets the PEEPs standard</option>
            <option value="develop">Develop: needs training before re-assessment</option>
            <option value="not_suitable">Not suitable for this role family</option>
          </Select>
        </Field>
        <FormMessage />
        <SubmitButton pendingText="Saving…">Save assessment</SubmitButton>
      </ActionForm>
    </Dialog>
  );
}

export function ClassificationForm({
  candidateId,
  classification,
  rationale,
}: {
  candidateId: string;
  classification: string | null;
  rationale: string | null;
}) {
  return (
    <ActionForm action={setClassification} className="grid gap-3">
      <input type="hidden" name="candidateId" value={candidateId} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CLASSIFICATIONS.map((c) => (
          <label key={c.value} className="cursor-pointer" title={c.description}>
            <input type="radio" name="classification" value={c.value} defaultChecked={classification === c.value} className="peer sr-only" />
            <span className="block rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors peer-checked:border-gold peer-checked:bg-gold peer-checked:text-gold-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
              {c.label}
            </span>
          </label>
        ))}
      </div>
      <Field label="Rationale" name="rationale" hint="Shown to employers in shortlist reports. Cite the evidence, not opinions.">
        <Textarea id="rationale" name="rationale" defaultValue={rationale ?? ""} rows={3} />
      </Field>
      <FormMessage />
      <div>
        <SubmitButton size="sm" pendingText="Saving…">Save classification</SubmitButton>
      </div>
    </ActionForm>
  );
}
