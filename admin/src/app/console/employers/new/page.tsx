import { PageHeader, Panel } from "@/components/peeps/blocks";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createEmployer } from "@/server/actions/console";
import { COMPANY_SIZES, CRM_STAGES, INDUSTRIES } from "@/lib/pipeline";

export const metadata = { title: "Add employer" };

export default function NewEmployer() {
  return (
    <>
      <PageHeader back={{ href: "/console/employers", label: "Employer pipeline" }} title="Add an employer" description="Build the 100-company target list: company, decision-maker and next action." />
      <Panel className="max-w-3xl">
        <ActionForm action={createEmployer} className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" name="name" required className="sm:col-span-2"><Input id="name" name="name" required /></Field>
          <Field label="Industry" name="industry">
            <Select id="industry" name="industry" defaultValue=""><option value="">Select</option>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</Select>
          </Field>
          <Field label="City" name="city"><Input id="city" name="city" /></Field>
          <Field label="Size" name="size">
            <Select id="size" name="size" defaultValue=""><option value="">Unknown</option>{COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}</Select>
          </Field>
          <Field label="Website" name="website"><Input id="website" name="website" type="url" placeholder="https://" /></Field>
          <Field label="Pipeline stage" name="crmStage">
            <Select id="crmStage" name="crmStage" defaultValue="target">{CRM_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
          </Field>
          <Field label="Membership" name="membershipTier">
            <Select id="membershipTier" name="membershipTier" defaultValue="none"><option value="none">None</option><option value="corporate">Corporate member</option></Select>
          </Field>
          <fieldset className="grid gap-4 rounded-xl border p-4 sm:col-span-2 sm:grid-cols-2">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Decision-maker</legend>
            <Field label="Name" name="contactName"><Input id="contactName" name="contactName" placeholder="CEO / MD / HR / Finance" /></Field>
            <Field label="Role" name="contactRole"><Input id="contactRole" name="contactRole" /></Field>
            <Field label="Email" name="contactEmail"><Input id="contactEmail" name="contactEmail" type="email" /></Field>
            <Field label="Phone" name="contactPhone"><Input id="contactPhone" name="contactPhone" type="tel" /></Field>
          </fieldset>
          <Field label="Next action" name="nextAction"><Input id="nextAction" name="nextAction" placeholder="e.g. Intro call with HR Manager" /></Field>
          <Field label="Due" name="nextActionAt"><Input id="nextActionAt" name="nextActionAt" type="date" /></Field>
          <div className="sm:col-span-2"><FormMessage /></div>
          <div><SubmitButton pendingText="Adding…">Add employer</SubmitButton></div>
        </ActionForm>
      </Panel>
    </>
  );
}
