import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, FieldError, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Checkbox, Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { registerCandidate } from "@/server/actions/auth";
import { CANDIDATE_SOURCES, NIGERIAN_CITIES, SECTORS } from "@/lib/taxonomy";
import { CONSENT_TEXT } from "@/lib/consent";

export const metadata: Metadata = { title: "Join the talent registry" };

export default function RegisterCandidatePage() {
  return (
    <div>
      <p className="label text-muted-foreground">PEEPs Talent Registry</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">Create your profile.</h1>
      <p className="mt-5 max-w-[38ch] text-[0.95rem] leading-snug text-muted-foreground">
        It&apos;s free. You&apos;ll get a PEEPs ID straight away and can complete your profile in your dashboard.
      </p>
      <ActionForm action={registerCandidate} className="mt-12 grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required>
          <Input id="firstName" name="firstName" autoComplete="given-name" required />
        </Field>
        <Field label="Last name" name="lastName" required>
          <Input id="lastName" name="lastName" autoComplete="family-name" required />
        </Field>
        <Field label="Email" name="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Phone / WhatsApp" name="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234" />
        </Field>
        <Field label="Talent category" name="sectorCode" required>
          <Select id="sectorCode" name="sectorCode" defaultValue="" required>
            <option value="" disabled>Select category</option>
            {SECTORS.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Profession" name="profession" required>
          <Input id="profession" name="profession" placeholder="e.g. Accountant" required />
        </Field>
        <Field label="City" name="city" required>
          <Input id="city" name="city" list="reg-cities" autoComplete="address-level2" required />
          <datalist id="reg-cities">
            {NIGERIAN_CITIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>
        <Field label="Years of experience" name="yearsExperience">
          <Input id="yearsExperience" name="yearsExperience" type="number" min={0} max={50} defaultValue={0} />
        </Field>
        <Field label="How did you hear about us?" name="source" className="sm:col-span-2">
          <Select id="source" name="source" defaultValue="website">
            {CANDIDATE_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Password" name="password" required hint="At least 8 characters" className="sm:col-span-2">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <div className="sm:col-span-2">
          <label className="flex gap-4 rounded-[7px] border border-border p-5 text-[0.9rem] leading-snug">
            <Checkbox name="consent" required className="mt-0.5" />
            <span>
              {CONSENT_TEXT}{" "}
              <Link href="/privacy" className="text-primary underline-offset-4 hover:underline" target="_blank">
                Privacy notice
              </Link>
            </span>
          </label>
          <FieldError name="consent" />
        </div>
        <div className="sm:col-span-2">
          <FormMessage />
        </div>
        <SubmitButton size="lg" className="w-full sm:col-span-2" pendingText="Creating your profile…">
          Create my PEEPs profile
        </SubmitButton>
      </ActionForm>
      <p className="label mt-10 border-t border-border pt-7 text-muted-foreground">
        Already registered?{" "}
        <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
