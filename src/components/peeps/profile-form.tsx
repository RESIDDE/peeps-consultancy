import type { Candidate } from "@/db/schema";
import type { FormAction } from "@/lib/action-state";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AVAILABILITY, EMPLOYMENT_STATUS, EMPLOYMENT_TYPES, NIGERIAN_CITIES, SECTORS } from "@/lib/taxonomy";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 border-t pt-6 first:border-0 first:pt-0 sm:grid-cols-2">
      <legend className="float-left mb-2 w-full text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:col-span-2">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

const join = (v: string[] | null | undefined) => (v ?? []).join(", ");

/** The structured PEEPs profile (roadmap §3). Shared by portal and console. */
export function ProfileForm({ candidate: c, action, hidden }: { candidate: Candidate; action: FormAction; hidden?: Record<string, string> }) {
  const edu = [...c.education, ...Array(Math.max(0, 2 - c.education.length)).fill(null)].slice(0, Math.max(2, c.education.length + 1));
  const exp = [...c.experience, ...Array(Math.max(0, 2 - c.experience.length)).fill(null)].slice(0, Math.max(2, c.experience.length + 1));
  return (
    <ActionForm action={action} className="grid gap-6">
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}

      <Section title="Personal">
        <Field label="First name" name="firstName" required><Input id="firstName" name="firstName" defaultValue={c.firstName} required /></Field>
        <Field label="Last name" name="lastName" required><Input id="lastName" name="lastName" defaultValue={c.lastName} required /></Field>
        <Field label="Phone / WhatsApp" name="phone"><Input id="phone" name="phone" type="tel" defaultValue={c.phone ?? ""} /></Field>
        <Field label="City" name="city" required>
          <Input id="city" name="city" list="pf-cities" defaultValue={c.city ?? ""} required />
          <datalist id="pf-cities">{NIGERIAN_CITIES.map((x) => <option key={x} value={x} />)}</datalist>
        </Field>
      </Section>

      <Section title="Professional">
        <Field label="Talent category" name="sectorCode" required>
          <Select id="sectorCode" name="sectorCode" defaultValue={c.sectorCode}>
            {SECTORS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Profession" name="profession" required><Input id="profession" name="profession" defaultValue={c.profession} required /></Field>
        <Field label="Headline" name="headline" className="sm:col-span-2"><Input id="headline" name="headline" defaultValue={c.headline ?? ""} placeholder="e.g. ICAN-track accountant with 4 years in audit firms" /></Field>
        <Field label="Professional summary" name="summary" className="sm:col-span-2"><Textarea id="summary" name="summary" defaultValue={c.summary ?? ""} rows={3} /></Field>
        <Field label="Years of experience" name="yearsExperience"><Input id="yearsExperience" name="yearsExperience" type="number" min={0} defaultValue={c.yearsExperience} /></Field>
        <Field label="Current employer" name="currentEmployer"><Input id="currentEmployer" name="currentEmployer" defaultValue={c.currentEmployer ?? ""} /></Field>
        <Field label="Professional qualifications" name="qualifications" hint="Comma-separated, e.g. ICAN (in progress), ACCA"><Input id="qualifications" name="qualifications" defaultValue={join(c.qualifications)} /></Field>
        <Field label="Training & certifications" name="training" hint="Comma-separated"><Input id="training" name="training" defaultValue={join(c.training)} /></Field>
      </Section>

      <Section title="Skills">
        <Field label="Technical skills" name="skills" hint="Comma-separated" className="sm:col-span-2"><Input id="skills" name="skills" defaultValue={join(c.skills)} /></Field>
        <Field label="Software & tools" name="software" hint="Comma-separated"><Input id="software" name="software" defaultValue={join(c.software)} /></Field>
        <Field label="Languages" name="languages" hint="Comma-separated"><Input id="languages" name="languages" defaultValue={join(c.languages)} /></Field>
      </Section>

      <Section title="Education">
        {edu.map((e, i) => (
          <div key={i} className="grid gap-3 rounded-xl border p-4 sm:col-span-2 sm:grid-cols-[1.4fr_1.2fr_1fr_0.6fr]">
            <Field label="Institution" htmlFor={`edu_institution_${i}`}><Input id={`edu_institution_${i}`} name={`edu_institution_${i}`} defaultValue={e?.institution ?? ""} /></Field>
            <Field label="Qualification" htmlFor={`edu_qualification_${i}`}><Input id={`edu_qualification_${i}`} name={`edu_qualification_${i}`} defaultValue={e?.qualification ?? ""} /></Field>
            <Field label="Field" htmlFor={`edu_field_${i}`}><Input id={`edu_field_${i}`} name={`edu_field_${i}`} defaultValue={e?.field ?? ""} /></Field>
            <Field label="Year" htmlFor={`edu_year_${i}`}><Input id={`edu_year_${i}`} name={`edu_year_${i}`} defaultValue={e?.year ?? ""} inputMode="numeric" /></Field>
          </div>
        ))}
      </Section>

      <Section title="Experience">
        {exp.map((e, i) => (
          <div key={i} className="grid gap-3 rounded-xl border p-4 sm:col-span-2 sm:grid-cols-4">
            <Field label="Employer" htmlFor={`exp_employer_${i}`} className="sm:col-span-2"><Input id={`exp_employer_${i}`} name={`exp_employer_${i}`} defaultValue={e?.employer ?? ""} /></Field>
            <Field label="Title" htmlFor={`exp_title_${i}`} className="sm:col-span-2"><Input id={`exp_title_${i}`} name={`exp_title_${i}`} defaultValue={e?.title ?? ""} /></Field>
            <Field label="From" htmlFor={`exp_start_${i}`}><Input id={`exp_start_${i}`} name={`exp_start_${i}`} defaultValue={e?.start ?? ""} placeholder="2021" /></Field>
            <Field label="To" htmlFor={`exp_end_${i}`}><Input id={`exp_end_${i}`} name={`exp_end_${i}`} defaultValue={e?.end ?? ""} placeholder="Present" /></Field>
            <Field label="Key responsibilities" htmlFor={`exp_summary_${i}`} className="sm:col-span-2"><Input id={`exp_summary_${i}`} name={`exp_summary_${i}`} defaultValue={e?.summary ?? ""} /></Field>
          </div>
        ))}
      </Section>

      <Section title="Preferences">
        <Field label="Availability" name="availability">
          <Select id="availability" name="availability" defaultValue={c.availability ?? ""}>
            <option value="">Not specified</option>
            {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </Select>
        </Field>
        <Field label="Employment status" name="employmentStatus">
          <Select id="employmentStatus" name="employmentStatus" defaultValue={c.employmentStatus ?? ""}>
            <option value="">Not specified</option>
            {EMPLOYMENT_STATUS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </Select>
        </Field>
        <Field label="Salary expectation from (₦/month)" name="salaryMin"><Input id="salaryMin" name="salaryMin" inputMode="numeric" defaultValue={c.salaryMin ?? ""} /></Field>
        <Field label="Salary expectation to (₦/month)" name="salaryMax"><Input id="salaryMax" name="salaryMax" inputMode="numeric" defaultValue={c.salaryMax ?? ""} /></Field>
        <Field label="Preferred locations" name="preferredLocations" hint="Comma-separated"><Input id="preferredLocations" name="preferredLocations" defaultValue={join(c.preferredLocations)} /></Field>
        <div className="grid content-start gap-2">
          <span className="text-sm font-medium">Employment types</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {EMPLOYMENT_TYPES.map((t) => (
              <label key={t.value} className="inline-flex items-center gap-2 text-sm">
                <Checkbox name="employmentTypes" value={t.value} defaultChecked={c.employmentTypes.includes(t.value)} /> {t.label}
              </label>
            ))}
          </div>
          <label className="mt-2 inline-flex items-center gap-2 text-sm">
            <Checkbox name="willingToRelocate" defaultChecked={c.willingToRelocate} /> Willing to relocate
          </label>
        </div>
      </Section>

      <FormMessage />
      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton size="lg" className="shadow-lg" pendingText="Saving…">Save profile</SubmitButton>
      </div>
    </ActionForm>
  );
}
