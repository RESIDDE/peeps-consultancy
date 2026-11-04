import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PAYROLL } from "@/lib/services";
import { requestPayrollQuote } from "@/server/actions/public";
import { CheckboxGroup, Consent, ContactFields, Honeypot, asOptions } from "./shared";

/** The payroll quote request, field for field as the brief sets it out. */
export function PayrollQuoteForm() {
  return (
    <ActionForm action={requestPayrollQuote} resetOnSuccess className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <ContactFields />

      <Field label="Number of employees" name="employees" required>
        <Select id="employees" name="employees" defaultValue="" required>
          <option value="" disabled>
            Select a range
          </option>
          {PAYROLL.form.employeeBands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </Select>
      </Field>

      <Field label="Pay frequency" name="payFrequency" required>
        <Select id="payFrequency" name="payFrequency" defaultValue={PAYROLL.form.payFrequencies[0]} required>
          {PAYROLL.form.payFrequencies.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </Select>
      </Field>

      <CheckboxGroup
        legend="Services needed"
        name="services"
        hint="Tick everything you want PEEPs to handle."
        options={asOptions(PAYROLL.form.services)}
      />

      <Field label="Current payroll method" name="currentMethod" required className="sm:col-span-2">
        <Select id="currentMethod" name="currentMethod" defaultValue="" required>
          <option value="" disabled>
            How is payroll run today?
          </option>
          {PAYROLL.form.currentMethods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Select>
      </Field>

      <Field label="Anything else we should know?" name="message" className="sm:col-span-2">
        <Textarea id="message" name="message" rows={4} placeholder="Pay dates, existing arrears, reporting you need…" />
      </Field>

      <Consent what="prepare your payroll quote and contact you about it" />

      <div className="sm:col-span-2">
        <FormMessage />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">We respond within 24 hours. No obligation.</p>
        <SubmitButton pendingText="Sending…">Request a quote</SubmitButton>
      </div>
    </ActionForm>
  );
}
