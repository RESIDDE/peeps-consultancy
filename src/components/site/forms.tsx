import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestTalent, submitEnquiry } from "@/server/actions/public";
import { SECTORS, NIGERIAN_CITIES, EMPLOYMENT_TYPES } from "@/lib/taxonomy";
import { INDUSTRIES, PACKAGES } from "@/lib/pipeline";

/** Hidden honeypot — bots fill every field; people never see this one. */
function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function RequestTalentForm({ defaultPackage = "professional" }: { defaultPackage?: string }) {
  return (
    <ActionForm action={requestTalent} resetOnSuccess className="relative grid gap-8">
      <Honeypot />
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your organisation</legend>
        <Field label="Company name" name="company" required>
          <Input id="company" name="company" autoComplete="organization" required />
        </Field>
        <Field label="Industry" name="industry">
          <Select id="industry" name="industry" defaultValue="">
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </Select>
        </Field>
        <Field label="Contact name" name="contactName" required>
          <Input id="contactName" name="contactName" autoComplete="name" required />
        </Field>
        <Field label="Your role" name="contactRole">
          <Input id="contactRole" name="contactRole" placeholder="e.g. HR Manager" />
        </Field>
        <Field label="Work email" name="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Phone / WhatsApp" name="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234" />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">The role</legend>
        <Field label="Position" name="title" required>
          <Input id="title" name="title" placeholder="e.g. Accountant" required />
        </Field>
        <Field label="Talent category" name="sectorCode" required>
          <Select id="sectorCode" name="sectorCode" defaultValue="" required>
            <option value="" disabled>
              Select category
            </option>
            {SECTORS.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Number required" name="headcount">
          <Input id="headcount" name="headcount" type="number" min={1} max={500} defaultValue={1} />
        </Field>
        <Field label="Location" name="city" required>
          <Input id="city" name="city" list="cities" placeholder="e.g. Abuja" required />
          <datalist id="cities">
            {NIGERIAN_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Monthly salary from (₦)" name="salaryMin">
          <Input id="salaryMin" name="salaryMin" inputMode="numeric" placeholder="250,000" />
        </Field>
        <Field label="Monthly salary to (₦)" name="salaryMax">
          <Input id="salaryMax" name="salaryMax" inputMode="numeric" placeholder="400,000" />
        </Field>
        <Field label="Minimum experience (years)" name="experienceMin">
          <Input id="experienceMin" name="experienceMin" type="number" min={0} max={40} defaultValue={2} />
        </Field>
        <Field label="Employment type" name="employmentType">
          <Select id="employmentType" name="employmentType" defaultValue="full_time">
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Key skills" name="requiredSkills" hint="Comma-separated, e.g. Excel, IFRS, Sage" className="sm:col-span-2">
          <Input id="requiredSkills" name="requiredSkills" />
        </Field>
        <Field label="Qualifications" name="qualifications">
          <Input id="qualifications" name="qualifications" placeholder="e.g. B.Sc Accounting; ICAN" />
        </Field>
        <Field label="Hiring deadline" name="deadline">
          <Input id="deadline" name="deadline" type="date" />
        </Field>
        <Field label="Service" name="package" className="sm:col-span-2">
          <Select id="package" name="package" defaultValue={defaultPackage}>
            {PACKAGES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="What does success look like in this role?"
          name="description"
          className="sm:col-span-2"
          hint="Responsibilities, team, culture: anything that helps us understand who will thrive."
        >
          <Textarea id="description" name="description" rows={5} />
        </Field>
      </fieldset>

      <FormMessage />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">We respond within one working day. No obligation.</p>
        <SubmitButton size="lg" pendingText="Sending…">
          Submit talent request
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export function EnquiryForm({
  type = "contact",
  subjectPlaceholder = "How can we help?",
  showOrganisation = true,
  submitLabel = "Send message",
}: {
  type?: "contact" | "partner" | "career_service" | "academy" | "professional" | "pilot";
  subjectPlaceholder?: string;
  showOrganisation?: boolean;
  submitLabel?: string;
}) {
  return (
    <ActionForm action={submitEnquiry} resetOnSuccess className="relative grid gap-4 sm:grid-cols-2">
      <Honeypot />
      <input type="hidden" name="type" value={type} />
      <Field label="Full name" name="name" required>
        <Input id={`${type}-name`} name="name" autoComplete="name" required />
      </Field>
      <Field label="Email" name="email" required>
        <Input id={`${type}-email`} name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Phone / WhatsApp" name="phone">
        <Input id={`${type}-phone`} name="phone" type="tel" autoComplete="tel" placeholder="+234" />
      </Field>
      {showOrganisation ? (
        <Field label="Organisation" name="organisation">
          <Input id={`${type}-org`} name="organisation" autoComplete="organization" />
        </Field>
      ) : (
        <div className="hidden sm:block" />
      )}
      <Field label="Subject" name="subject" className="sm:col-span-2">
        <Input id={`${type}-subject`} name="subject" placeholder={subjectPlaceholder} />
      </Field>
      <Field label="Message" name="message" required className="sm:col-span-2">
        <Textarea id={`${type}-message`} name="message" rows={5} required />
      </Field>
      <div className="sm:col-span-2">
        <FormMessage />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Sending…">{submitLabel}</SubmitButton>
      </div>
    </ActionForm>
  );
}
