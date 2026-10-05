import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { submitPlacementFeedback } from "@/server/actions/portal";
import { cn } from "@/lib/utils";

function Choice({ name, options }: { name: string; options: { value: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input type="radio" name={name} value={o.value} className="peer sr-only" />
          <span className={cn("block rounded-lg border px-3 py-1.5 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring")}>
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}

/** The §30 employer feedback loop. */
export function PlacementFeedbackForm({ placementId }: { placementId: string }) {
  return (
    <ActionForm action={submitPlacementFeedback} className="grid gap-4">
      <input type="hidden" name="placementId" value={placementId} />
      <Field label="Was the candidate suitable?" name="suitable">
        <Choice name="suitable" options={[{ value: "yes", label: "Yes" }, { value: "partly", label: "Partly" }, { value: "no", label: "No" }]} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="What was strong?" name="strengths"><Textarea id={`s-${placementId}`} name="strengths" rows={2} /></Field>
        <Field label="What was weak?" name="weaknesses"><Textarea id={`w-${placementId}`} name="weaknesses" rows={2} /></Field>
      </div>
      <Field label="Which skills were missing?" name="missingSkills" hint="We share this with our training partners to strengthen the next cohort.">
        <Textarea id={`m-${placementId}`} name="missingSkills" rows={2} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Would you hire another candidate from PEEPs?" name="wouldHireAgain">
          <Choice name="wouldHireAgain" options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
        </Field>
        <Field label="Overall rating" name="rating">
          <Choice name="rating" options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}★` }))} />
        </Field>
      </div>
      <FormMessage />
      <div><SubmitButton pendingText="Sending…">Send feedback</SubmitButton></div>
    </ActionForm>
  );
}
