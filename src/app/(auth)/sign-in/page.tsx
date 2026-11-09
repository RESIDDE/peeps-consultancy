import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthLinks } from "@/components/auth/auth-links";
import { getSession, homeFor } from "@/lib/permissions";
import { AUDIENCES, SIGN_IN, audienceFor, signInHref } from "@/lib/sign-in";

export const metadata: Metadata = { title: "Sign in" };

/**
 * The first screen of signing in: which kind of account. Employers and candidates each go on
 * to a sign-in page that names them, so nobody types their email wondering whether they're
 * in the right place. Anyone sent here from a dashboard skips the question: that page
 * already says which sign-in it needs.
 */
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (session) redirect(homeFor(session.user.role));
  const { next } = await searchParams;
  const known = audienceFor(next);
  if (known) redirect(signInHref(known, next));

  const staffUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  return (
    <div className="anim-step">
      <p className="label text-muted-foreground">Sign in</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">Welcome back.</h1>
      <p className="mt-5 max-w-[36ch] text-[0.95rem] leading-snug text-muted-foreground">
        Choose your account type to continue. Each one opens its own dashboard.
      </p>

      <ul className="mt-12 grid gap-3">
        {AUDIENCES.map((audience) => {
          const copy = SIGN_IN[audience];
          return (
            <li key={audience}>
              <Link
                href={signInHref(audience, next)}
                className="group flex items-center justify-between gap-6 rounded-[7px] border border-border p-5 transition-[border-color,background-color,transform] duration-200 hover:border-foreground/40 hover:bg-foreground/[0.03] active:scale-[0.99] sm:p-6"
              >
                <span className="grid gap-2">
                  <span className="label text-muted-foreground">{copy.name}</span>
                  <span className="subhead">{copy.choice}</span>
                  <span className="text-sm leading-snug text-muted-foreground">{copy.blurb}</span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Not sure which? Use the email you registered with. You&apos;ll always land on your own dashboard.
      </p>

      <AuthLinks
        title="New to PEEPs?"
        items={[
          { href: SIGN_IN.candidate.register.href, label: SIGN_IN.candidate.register.label, note: "Free, for professionals" },
          { href: SIGN_IN.employer.register.href, label: SIGN_IN.employer.register.label, note: "For hiring organisations" },
        ]}
      />

      {staffUrl && (
        <p className="mt-8 text-xs text-muted-foreground">
          PEEPs staff?{" "}
          <a href={`${staffUrl}/sign-in`} className="text-foreground underline underline-offset-4 hover:opacity-60">
            Sign in to the console
          </a>
        </p>
      )}
    </div>
  );
}
