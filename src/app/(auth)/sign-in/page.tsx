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
      <p className="label text-muted-foreground">Sign in</p>
      <h1 className="headline mt-5 text-[clamp(2rem,3.2vw,2.8rem)]">Welcome back.</h1>
      <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-snug text-muted-foreground">
        Sign in to your PEEPs account.
      </p>
      <ActionForm action={signIn} className="mt-12 grid gap-4">
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
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-8 rounded-[7px] border border-dashed border-border p-5 text-[0.85rem] leading-snug text-muted-foreground">
          <p className="label text-foreground">Demo accounts — development only</p>
          <p className="mt-3">employer@peeps.local · candidate@peeps.local</p>
          <p>
            Password: <code className="font-mono">peeps-demo-2026</code>
          </p>
          <p className="mt-1">Staff accounts sign in to the admin console (npm run dev:admin, port 3001).</p>
        </div>
      )}
    </div>
  );
}
