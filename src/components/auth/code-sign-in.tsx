"use client";

import { useActionState, useState } from "react";
import { initialActionState, type FormAction } from "@/lib/action-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

/**
 * Two-step sign-in: an email address, then the 6-digit code sent to it.
 *
 * Shared by the website and the staff console; each passes its own pair of server actions.
 * `request` emails the code and answers ok for any well-formed address, so this form never
 * reveals whether an account exists. `verify` checks the code and redirects on success,
 * so it only ever comes back here with an error.
 */
export function CodeSignIn({
  request,
  verify,
  next,
  minutes,
}: {
  request: FormAction;
  verify: FormAction;
  /** Where to go after signing in, if the visitor was sent here from a protected page. */
  next?: string;
  /** How long a code lasts, to say so on screen. */
  minutes: number;
}) {
  const [sent, sendAction] = useActionState(request, initialActionState);
  const [checked, verifyAction] = useActionState(verify, initialActionState);
  // Set by "Use a different email"; cleared whenever a code is requested again.
  const [editing, setEditing] = useState(false);

  // The address the server actually sent to, normalised. Taken from its reply rather than
  // from the input, which autofill and password managers can fill without change events.
  const email = sent.value ?? "";
  const onCodeStep = sent.ok && !!email && !editing;

  if (!onCodeStep) {
    return (
      <form action={sendAction} onSubmit={() => setEditing(false)} className="grid gap-4">
        <Field label="Email" name="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            // Keeps the address when coming back via "Use a different email".
            defaultValue={sent.value}
          />
        </Field>
        <Problem message={!sent.ok ? sent.message : undefined} at={sent.at} />
        <SubmitButton size="lg" className="mt-2 w-full" pendingText="Sending code…">
          Email me a code
        </SubmitButton>
        <p className="text-xs leading-relaxed text-muted-foreground">
          We&apos;ll email you a 6-digit code. No password needed.
        </p>
      </form>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-[0.95rem] leading-snug">
        We sent a 6-digit code to <strong className="font-medium">{email}</strong>. It expires in {minutes} minutes.
      </p>

      <form action={verifyAction} className="grid gap-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next ?? ""} />
        <Field label="Code" name="code">
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            placeholder="123456"
            className="font-mono text-lg tracking-[0.4em]"
          />
        </Field>
        <Problem message={checked.message} at={checked.at} />
        <SubmitButton size="lg" className="mt-2 w-full" pendingText="Signing in…">
          Sign in
        </SubmitButton>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <form action={sendAction}>
          <input type="hidden" name="email" value={email} />
          <button type="submit" className="underline-offset-4 hover:text-foreground hover:underline">
            Didn&apos;t get it? Send a new code
          </button>
        </form>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}

function Problem({ message, at }: { message?: string; at?: number }) {
  if (!message || !at) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
