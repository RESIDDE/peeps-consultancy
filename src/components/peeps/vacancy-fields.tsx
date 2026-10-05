import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { EMPLOYMENT_TYPES, NIGERIAN_CITIES, SECTORS } from "@/lib/taxonomy";
import { PACKAGES } from "@/lib/pipeline";

/** Vacancy fields (roadmap §7). Wrapped by the console and the employer portal. */
export function VacancyFields() {
  return (
    <>
      <Field label="Position" name="title" required><Input id="v-title" name="title" required placeholder="e.g. Accountant" /></Field>
      <Field label="Talent category" name="sectorCode" required>
        <Select id="v-sector" name="sectorCode" defaultValue="" required>
          <option value="" disabled>Select category</option>
          {SECTORS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </Select>
      </Field>
      <Field label="Number required" name="headcount"><Input id="v-headcount" name="headcount" type="number" min={1} defaultValue={1} /></Field>
      <Field label="Location" name="city">
        <Input id="v-city" name="city" list="v-cities" />
        <datalist id="v-cities">{NIGERIAN_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
      </Field>
      <Field label="Salary from (₦/month)" name="salaryMin"><Input id="v-smin" name="salaryMin" inputMode="numeric" /></Field>
      <Field label="Salary to (₦/month)" name="salaryMax"><Input id="v-smax" name="salaryMax" inputMode="numeric" /></Field>
      <Field label="Minimum experience (years)" name="experienceMin"><Input id="v-exp" name="experienceMin" type="number" min={0} defaultValue={0} /></Field>
      <Field label="Employment type" name="employmentType">
        <Select id="v-type" name="employmentType" defaultValue="full_time">
          {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </Field>
      <Field label="Required skills" name="requiredSkills" hint="Comma-separated, used for matching" className="sm:col-span-2"><Input id="v-skills" name="requiredSkills" /></Field>
      <Field label="Qualifications" name="qualifications"><Input id="v-quals" name="qualifications" /></Field>
      <Field label="Deadline" name="deadline"><Input id="v-deadline" name="deadline" type="date" /></Field>
      <Field label="Service" name="package" className="sm:col-span-2">
        <Select id="v-package" name="package" defaultValue="professional">
          {PACKAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
      </Field>
      <Field label="Job description" name="description" className="sm:col-span-2"><Textarea id="v-desc" name="description" rows={4} /></Field>
    </>
  );
}
