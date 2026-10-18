import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { getSession, STAFF } from "@/lib/permissions";
import type { Role } from "@/db/schema";
import { staffSignIn } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function StaffSignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (session && STAFF.includes(session.user.role as Role)) redirect("/console");
  const { next } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center justify-between p-4 sm:p-6">
        <Logo compact />
        <ThemeToggle />
      </div>
      <main id="main" className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:px-6">
        <div className="w-full max-w-md">
          <p className="eyebrow">PEEPs Console</p>
          <h1 className="font-display mt-2 text-4xl font-medium">Staff sign in</h1>
          <p className="mt-2 text-muted-foreground">For PEEPs admins and recruiters.</p>
          <ActionForm action={staffSignIn} className="mt-8 grid gap-4">
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
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-6 rounded-2xl border border-dashed p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Demo staff accounts (development only)</p>
              <p className="mt-1">admin@peeps.local · recruiter@peeps.local</p>
              <p>
                Password: <code className="font-mono">peeps-demo-2026</code>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
