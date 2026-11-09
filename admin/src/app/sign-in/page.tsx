import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLadder, AuthShell } from "@/components/site/auth-shell";
import { CodeSignIn } from "@/components/auth/code-sign-in";
import { OTP_MINUTES } from "@/lib/auth";
import { getSession, STAFF } from "@/lib/permissions";
import { STAGES, STAGE_META } from "@/lib/quality";
import type { Role } from "@/db/schema";
import { requestStaffCode, verifyStaffCode } from "./actions";
import { adminExists } from "../setup/admin-exists";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign in" };

export default async function StaffSignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (session && STAFF.includes(session.user.role as Role)) redirect("/console");
  const { next } = await searchParams;
  // Until the first admin exists, nobody can sign in here: point to setting one up.
  const needsSetup = !(await adminExists());

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
        For PEEPs admins and recruiters. We&apos;ll email you a code. Employers and candidates sign in on the main site.
      </p>
      <div className="mt-12">
        <CodeSignIn request={requestStaffCode} verify={verifyStaffCode} next={next} minutes={OTP_MINUTES} />
      </div>
      {needsSetup && (
        <p className="mt-10 border-t border-border pt-7 text-sm text-muted-foreground">
          No admin account yet?{" "}
          <Link href="/setup" className="text-foreground underline-offset-4 hover:underline">
            Create the admin account
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
