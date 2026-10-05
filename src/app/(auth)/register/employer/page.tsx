import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { registerEmployer } from "@/server/actions/auth";
import { INDUSTRIES } from "@/lib/pipeline";

export const metadata: Metadata = { title: "Employer account" };

export default function RegisterEmployerPage() {
  return (
    <div>
      <p className="eyebrow">For employers</p>
      <h1 className="font-display mt-2 text-4xl font-medium">Create an employer account</h1>
      <p className="mt-2 text-muted-foreground">Post vacancies, review evidence-based shortlists and track every hire in one place.</p>
      <ActionForm action={registerEmployer} className="mt-8 grid gap-4 sm:grid-cols-2">
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
        <Field label="Password" name="password" required hint="At least 8 characters" className="sm:col-span-2">
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <div className="sm:col-span-2">
          <FormMessage />
        </div>
        <SubmitButton size="lg" className="w-full sm:col-span-2" pendingText="Creating account…">
          Create employer account
        </SubmitButton>
      </ActionForm>
      <p className="mt-6 text-sm text-muted-foreground">
        Prefer to talk first?{" "}
        <Link href="/employers#request" className="font-medium text-primary hover:underline">Submit a talent request</Link> instead.
      </p>
    </div>
  );
}
