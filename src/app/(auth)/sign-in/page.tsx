import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { signIn } from "@/server/actions/auth";
import { getSession, homeFor } from "@/lib/permissions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (session) redirect(homeFor(session.user.role));
  const { next } = await searchParams;

  return (
    <div>
      <h1 className="font-display text-4xl font-medium">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Sign in to your PEEPs account.</p>
      <ActionForm action={signIn} className="mt-8 grid gap-4">
        <input type="hidden" name="next" value={next ?? ""} />
        <Field label="Email" name="email">
          <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
        </Field>
        <Field label="Password" name="password">
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <FormMessage />
        <SubmitButton size="lg" className="mt-2 w-full" pendingText="Signing in…">
          Sign in
        </SubmitButton>
      </ActionForm>
      <div className="mt-8 grid gap-2 border-t pt-6 text-sm text-muted-foreground">
        <p>
          New to PEEPs?{" "}
          <Link href="/register/candidate" className="font-medium text-primary hover:underline">
            Join the talent registry
          </Link>{" "}
          or{" "}
          <Link href="/register/employer" className="font-medium text-primary hover:underline">
            create an employer account
          </Link>
          .
        </p>
      </div>
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 rounded-2xl border border-dashed p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo accounts (development only)</p>
          <p className="mt-1">
            admin@peeps.local · recruiter@peeps.local · employer@peeps.local · candidate@peeps.local
          </p>
          <p>
            Password: <code className="font-mono">peeps-demo-2026</code>
          </p>
        </div>
      )}
    </div>
  );
}
