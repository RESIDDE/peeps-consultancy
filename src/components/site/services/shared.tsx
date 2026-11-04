import { Field } from "@/components/ui/field";
import { Checkbox, Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/action-form";
import { cn } from "@/lib/utils";

/** Hidden honeypot — bots fill every field; people never see this one. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/**
 * The consent tick every public form carries, in line with the Nigeria Data Protection
 * Act 2023. The wording is service-specific because what we do with the data is.
 */
export function Consent({ what }: { what: string }) {
  return (
    <div className="sm:col-span-2">
      <label className="flex cursor-pointer items-start gap-3 text-[0.875rem] leading-snug">
        <Checkbox name="consent" required className="mt-0.5" />
        <span>
          I agree to PEEPs holding and using the details above to {what}, in line with the{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:no-underline">
            privacy notice
          </a>{" "}
          and the Nigeria Data Protection Act 2023. I can withdraw consent at any time.
        </span>
      </label>
      <FieldError name="consent" />
    </div>
  );
}

/** The four things every one of these forms asks first. */
export function ContactFields({ companyLabel = "Company name" }: { companyLabel?: string }) {
  return (
    <>
      <Field label={companyLabel} name="company" required>
        <Input id="company" name="company" autoComplete="organization" required />
      </Field>
      <Field label="Contact person" name="contactName" required>
        <Input id="contactName" name="contactName" autoComplete="name" required />
      </Field>
      <Field label="Email" name="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Phone / WhatsApp" name="phone" required>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234" required />
      </Field>
    </>
  );
}

/**
 * A set of checkboxes as a fieldset. `values` are what gets submitted; `labels` are what
 * is read. Ticked boxes come back under one name, which the server action reads with
 * `getAll`.
 */
export function CheckboxGroup({
  legend,
  name,
  options,
  checked,
  onToggle,
  hint,
  className,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  /** Controlled when given, so a card elsewhere on the page can tick a box. */
  checked?: readonly string[];
  onToggle?: (value: string) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <fieldset className={cn("sm:col-span-2", className)}>
      <legend className="text-sm font-medium leading-none">{legend}</legend>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2 text-[0.9rem]">
            <Checkbox
              name={name}
              value={o.value}
              checked={checked ? checked.includes(o.value) : undefined}
              onChange={onToggle ? () => onToggle(o.value) : undefined}
            />
            {o.label}
          </label>
        ))}
      </div>
      <div className="mt-1.5">
        <FieldError name={name} />
      </div>
    </fieldset>
  );
}

/** Turn a list of plain strings into the shape CheckboxGroup wants. */
export const asOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));
