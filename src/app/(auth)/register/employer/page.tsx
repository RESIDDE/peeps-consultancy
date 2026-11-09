import type { Metadata } from "next";
import Link from "next/link";
import { FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { ConfirmByCodeForm } from "@/components/auth/confirm-by-code-form";
import { OTP_MINUTES } from "@/lib/auth";
import { registerEmployer } from "@/server/actions/auth";
import { INDUSTRIES } from "@/lib/pipeline";

export const metadata: Metadata = { title: "Employer account" };

export default function RegisterEmployerPage() {
  return (
    <div>
      <p className="label text-muted-foreground">For employers</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">Create an employer account.</h1>
      <p className="mt-5 max-w-[38ch] text-[0.95rem] leading-snug text-muted-foreground">
        Post vacancies, review evidence-based shortlists and track every hire in one place.
      </p>
      <ConfirmByCodeForm action={registerEmployer} minutes={OTP_MINUTES} confirmLabel="Create my employer account" className="mt-12 grid gap-4 sm:grid-cols-2">
        <Field label="Company name" name="company" required className="sm:col-span-2">
          <Input id="company" name="company" autoComplete="organization" required />
        </Field>
        <Field label="Industry" name="industry">
          <Select id="industry" name="industry" defaultValue="">
            <option value="">Select industry</option>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </Select>
        </Field>
        <Field label="City" name="city" required>
          <Input id="city" name="city" required />
        </Field>
        <Field label="Your name" name="name" required>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Your role" name="role">
          <Input id="role" name="role" placeholder="e.g. HR Manager" />
        </Field>
        <Field label="Work email" name="email" required>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Phone" name="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234" />
        </Field>
        <div className="sm:col-span-2">
          <FormMessage />
        </div>
        <SubmitButton size="lg" className="w-full sm:col-span-2">
          Email me a code to continue
        </SubmitButton>
      </ConfirmByCodeForm>
      <p className="label mt-10 border-t border-border pt-7 text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
      <p className="label mt-4 text-muted-foreground">
        Prefer to talk first?{" "}
        <Link href="/employers#request" className="text-foreground underline-offset-4 hover:underline">
          Submit a talent request
        </Link>{" "}
        instead.
      </p>
    </div>
  );
}
