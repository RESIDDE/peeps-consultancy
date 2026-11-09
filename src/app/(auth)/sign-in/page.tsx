import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CodeSignIn } from "@/components/auth/code-sign-in";
import { requestSignInCode, verifySignInCode } from "@/server/actions/auth";
import { OTP_MINUTES } from "@/lib/auth";
import { getSession, homeFor } from "@/lib/permissions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (session) redirect(homeFor(session.user.role));
  const { next } = await searchParams;

  return (
    <div>
      <p className="label text-muted-foreground">Sign in</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">Welcome back.</h1>
      <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-snug text-muted-foreground">
        Sign in to your PEEPs account with a code sent to your email.
      </p>
      <div className="mt-12">
        <CodeSignIn request={requestSignInCode} verify={verifySignInCode} next={next} minutes={OTP_MINUTES} />
      </div>
      <div className="mt-12 border-t border-border pt-7">
        <p className="label text-muted-foreground">New to PEEPs?</p>
        <ul className="mt-5">
          {[
            { href: "/register/candidate", label: "Join the talent registry", note: "Free, for professionals" },
            { href: "/register/employer", label: "Create an employer account", note: "For hiring organisations" },
          ].map((item) => (
            <li key={item.href} className="hairline last:border-b">
              <Link href={item.href} className="group flex items-baseline justify-between gap-6 py-4">
                <span className="text-[1.05rem] transition-opacity duration-300 group-hover:opacity-60">{item.label}</span>
                <span className="label shrink-0 text-muted-foreground">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
