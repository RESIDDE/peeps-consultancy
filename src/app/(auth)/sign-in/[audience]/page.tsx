import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthLinks } from "@/components/auth/auth-links";
import { CodeSignIn } from "@/components/auth/code-sign-in";
import { requestSignInCode, verifySignInCode } from "@/server/actions/auth";
import { RESEND_AFTER_SECONDS } from "@/server/otp";
import { OTP_MINUTES } from "@/lib/auth";
import { getSession } from "@/lib/permissions";
import { AUDIENCES, SIGN_IN, SIGN_IN_EMAIL_COOKIE, destinationFor, isAudience, signInHref } from "@/lib/sign-in";

type Props = {
  params: Promise<{ audience: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { audience } = await params;
  return { title: isAudience(audience) ? `${SIGN_IN[audience].name} sign in` : "Sign in" };
}

/**
 * Sign in as an employer or as a candidate. The page names the account type throughout, and
 * offers the way back to the choice, the other sign-in, and registration.
 */
export default async function AudienceSignInPage({ params, searchParams }: Props) {
  const [{ audience }, { next }] = await Promise.all([params, searchParams]);
  // Any other address goes back to the choice rather than to a dead end.
  if (!isAudience(audience)) redirect(signInHref(null, next));
  const session = await getSession();
  // Already signed in as an employer or candidate: straight to that dashboard. Any other
  // account has nothing on this site, so it gets the form like anyone else.
  if (session && isAudience(session.user.role)) redirect(destinationFor(session.user.role, next));

  const copy = SIGN_IN[audience];
  const other = AUDIENCES.find((a) => a !== audience)!;
  // An address typed on the other sign-in page and sent here, so it needn't be typed again.
  const carried = (await cookies()).get(SIGN_IN_EMAIL_COOKIE)?.value;

  return (
    <div className="anim-step">
      <Link
        href={signInHref(null, next)}
        className="label -my-2 inline-flex items-center gap-2 py-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        All sign-in options
      </Link>

      <p className="label mt-10 text-muted-foreground">Sign in · {copy.name}</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">{copy.title}</h1>
      <p className="mt-5 max-w-[38ch] text-[0.95rem] leading-snug text-muted-foreground">{copy.lede}</p>

      <div className="mt-12">
        <CodeSignIn
          // A fresh form per page: nothing from the other sign-in carries over but the address.
          key={audience}
          request={requestSignInCode}
          verify={verifySignInCode}
          next={next}
          minutes={OTP_MINUTES}
          resendSeconds={RESEND_AFTER_SECONDS}
          emailLabel={copy.emailLabel}
          emailHint={copy.emailHint}
          audience={audience}
          defaultEmail={carried}
        />
      </div>

      <AuthLinks
        title="Not what you need?"
        items={[
          { href: copy.register.href, label: copy.register.label, note: "New to PEEPs" },
          { href: signInHref(other), label: `${SIGN_IN[other].name} sign in`, note: SIGN_IN[other].question },
        ]}
      />
    </div>
  );
}
