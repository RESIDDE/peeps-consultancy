import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLadder, AuthShell } from "@/components/site/auth-shell";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { getSession, STAFF } from "@/lib/permissions";
import { STAGES, STAGE_META } from "@/lib/quality";
import type { Role } from "@/db/schema";
import { staffSignIn } from "./actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function StaffSignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (session && STAFF.includes(session.user.role as Role)) redirect("/console");
  const { next } = await searchParams;

  return (
    <AuthShell
      // The console is a second app on its own origin, so the wordmark points back out at
      // the public site rather than at this app's root, which only redirects to /console.
      homeHref={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}
      orbits
      statement="The work behind every shortlist happens here."
      aside={<AuthLadder rungs={STAGES.map((s) => STAGE_META[s].short)} />}
      footnote="Staff access only."
    >
      <p className="label text-muted-foreground">PEEPs Console</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">Staff sign in.</h1>
      <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-snug text-muted-foreground">
        For PEEPs admins and recruiters. Employers and candidates sign in on the main site.
      </p>
      <ActionForm action={staffSignIn} className="mt-12 grid gap-4">
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
        <div className="mt-12 rounded-[7px] border border-dashed border-border p-5 text-[0.85rem] leading-snug text-muted-foreground">
          <p className="label text-foreground">Demo staff accounts — development only</p>
          <p className="mt-3">admin@peeps.local · recruiter@peeps.local</p>
          <p>
            Password: <code className="font-mono">peeps-demo-2026</code>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
