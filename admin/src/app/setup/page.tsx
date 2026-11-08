import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthLadder, AuthShell } from "@/components/site/auth-shell";
import { ConfirmByCodeForm } from "@/components/auth/confirm-by-code-form";
import { FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { OTP_MINUTES } from "@/lib/auth";
import { getSession, STAFF } from "@/lib/permissions";
import { STAGES, STAGE_META } from "@/lib/quality";
import type { Role } from "@/db/schema";
import { adminExists } from "./admin-exists";
import { createFirstAdmin } from "./actions";

export const metadata: Metadata = { title: "Create admin account" };

/**
 * Creates the console's first admin. Open only while the console has no admin at all;
 * after that it says so and points to sign-in, and new staff are added from inside.
 */
export default async function SetupPage() {
  const session = await getSession();
  if (session && STAFF.includes(session.user.role as Role)) redirect("/console");
  const closed = await adminExists();

  return (
    <AuthShell
      orbits
      homeHref={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}
      statement="Set up the console for your team."
      aside={<AuthLadder rungs={STAGES.map((s) => STAGE_META[s].short)} />}
      footnote="Staff access only."
    >
      <p className="label text-muted-foreground">PEEPs Console</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">
        {closed ? "Admin account already set up." : "Create the admin account."}
      </h1>

      {closed ? (
        <>
          <p className="mt-5 max-w-[38ch] text-[0.95rem] leading-snug text-muted-foreground">
            This console already has an admin. Sign in with your email, or ask an admin to add you as staff.
          </p>
          <Link
            href="/sign-in"
            className="mt-10 inline-flex h-11 items-center rounded-[7px] bg-primary px-6 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to sign in
          </Link>
        </>
      ) : (
        <>
          <p className="mt-5 max-w-[38ch] text-[0.95rem] leading-snug text-muted-foreground">
            The first admin runs the console and adds everyone else. Use an email you can open: we&apos;ll send a code
            to confirm it, then sign you straight in.
          </p>
          <ConfirmByCodeForm
            action={createFirstAdmin}
            minutes={OTP_MINUTES}
            confirmLabel="Create admin account"
            className="mt-12 grid gap-4"
          >
            <Field label="Your name" name="name" required>
              <Input id="name" name="name" autoComplete="name" required autoFocus />
            </Field>
            <Field label="Email" name="email" required>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <FormMessage />
            <SubmitButton size="lg" className="mt-2 w-full">
              Email me a code to continue
            </SubmitButton>
          </ConfirmByCodeForm>
          <p className="mt-10 border-t border-border pt-7 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
