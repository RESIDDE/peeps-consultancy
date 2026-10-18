import { db } from "@/db";
import { partners } from "@/db/schema";
import { PageHeader, Panel } from "@/components/peeps/blocks";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Checkbox, Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createCandidate } from "@/server/actions/console";
import { CANDIDATE_SOURCES, NIGERIAN_CITIES, SECTORS } from "@/lib/taxonomy";
import { CONSENT_TEXT } from "@/lib/consent";

export const metadata = { title: "Register candidate" };

export default async function NewCandidatePage() {
  const partnerRows = await db.select({ id: partners.id, name: partners.name }).from(partners).orderBy(partners.name);
  return (
    <>
      <PageHeader
        back={{ href: "/console/talent", label: "Talent Registry" }}
        title="Register a candidate"
        description="For intake days, training-school cohorts and referrals. A PEEPs ID is issued immediately; the profile starts at Registered."
      />
      <Panel className="max-w-3xl">
        <ActionForm action={createCandidate} className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" name="firstName" required><Input id="firstName" name="firstName" required /></Field>
          <Field label="Last name" name="lastName" required><Input id="lastName" name="lastName" required /></Field>
          <Field label="Email" name="email" required><Input id="email" name="email" type="email" required /></Field>
          <Field label="Phone" name="phone"><Input id="phone" name="phone" type="tel" placeholder="+234" /></Field>
          <Field label="Talent category" name="sectorCode" required>
            <Select id="sectorCode" name="sectorCode" defaultValue="" required>
              <option value="" disabled>Select category</option>
              {SECTORS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Profession" name="profession" required><Input id="profession" name="profession" required /></Field>
          <Field label="City" name="city" required>
            <Input id="city" name="city" list="intake-cities" required />
            <datalist id="intake-cities">{NIGERIAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Years of experience" name="yearsExperience">
            <Input id="yearsExperience" name="yearsExperience" type="number" min={0} defaultValue={0} />
          </Field>
          <Field label="Source" name="source">
            <Select id="source" name="source" defaultValue="training_school">
              {CANDIDATE_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Partner institution" name="partnerId">
            <Select id="partnerId" name="partnerId" defaultValue="">
              <option value="">None</option>
              {partnerRows.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <label className="flex gap-3 rounded-xl border bg-muted/40 p-4 text-sm sm:col-span-2">
            <Checkbox name="consent" className="mt-0.5" />
            <span>
              <span className="font-medium">Signed consent is on file.</span>{" "}
              <span className="text-muted-foreground">The candidate has agreed to: &ldquo;{CONSENT_TEXT}&rdquo;</span>
            </span>
          </label>
          <div className="sm:col-span-2"><FormMessage /></div>
          <div className="sm:col-span-2">
            <SubmitButton pendingText="Registering…">Register &amp; issue PEEPs ID</SubmitButton>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
