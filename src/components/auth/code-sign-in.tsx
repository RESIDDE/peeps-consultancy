"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { initialActionState, type ActionState, type FormAction } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { SentTo, StepHeader } from "./steps";

interface SendState extends ActionState {
  stage: "email" | "code";
  /** The last request was "send a new code" and it went through. */
  resent?: boolean;
}

/**
 * Two-step sign-in: an email address, then the 6-digit code sent to it.
 *
 * Shared by the website and the staff console; each passes its own pair of server actions.
 * `request` emails the code and answers ok for any well-formed address, so this form never
 * reveals whether an account exists. `verify` checks the code and redirects on success,
 * so it only ever comes back here with an error.
 *
 * Each step says which it is, and the code step leads with the address and the way back to
 * change it. A failed resend keeps the visitor on the code step with the reason; a failed
 * first request keeps what they typed.
 */
export function CodeSignIn({
  request,
  verify,
  next,
  minutes,
  resendSeconds,
  emailLabel = "Email",
  emailHint,
}: {
  request: FormAction;
  verify: FormAction;
  /** Where to go after signing in, if the visitor was sent here from a protected page. */
  next?: string;
  /** How long a code lasts, to say so on screen. */
  minutes: number;
  /** How long before the server will send another code to the same address. */
  resendSeconds: number;
  emailLabel?: string;
  /** Which address to use, under the field. */
  emailHint?: string;
}) {
  const [sent, sendAction] = useActionState<SendState, FormData>(
    async (prev, fd) => {
      const resend = fd.get("intent") === "resend";
      const result = await request(prev, fd);
      return {
        ...result,
        // The address the server actually sent to, normalised, taken from its reply rather
        // than from the input, which autofill can fill without change events. On a refusal,
        // keep what was typed (first step) or the address already in use (resend).
        value: result.value ?? (resend ? prev.value : String(fd.get("email") ?? "")),
        stage: result.ok && result.value ? "code" : resend ? prev.stage : "email",
        resent: resend && result.ok,
      };
    },
    { ...initialActionState, stage: "email" },
  );
  const [checked, verifyAction] = useActionState(verify, initialActionState);
  // Set by "Change email"; cleared whenever a code is requested again.
  const [editing, setEditing] = useState(false);

  const email = sent.value ?? "";
  const onCodeStep = sent.stage === "code" && !!email && !editing;
  // A wrong-code message belongs to the code it was about; a fresh code clears it.
  const codeError = checked.at && (!sent.at || checked.at > sent.at) ? checked.message : undefined;

  if (!onCodeStep) {
    return (
      <form action={sendAction} onSubmit={() => setEditing(false)} className={cn("grid gap-5", editing && "anim-step")}>
        <StepHeader step={1} title="Your email" />
        <Field label={emailLabel} name="email" hint={emailHint}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            // Keeps the address when coming back via "Change email", or after a refusal.
            defaultValue={sent.value}
          />
        </Field>
        <Problem message={!sent.ok ? sent.message : undefined} at={sent.at} />
        <SubmitButton size="lg" className="mt-1 w-full" pendingText="Sending code…">
          Email me a code
        </SubmitButton>
        <p className="text-xs leading-relaxed text-muted-foreground">
          We&apos;ll email you a 6-digit code. No password needed.
        </p>
      </form>
    );
  }

  return (
    <div className="anim-step grid gap-5">
      <StepHeader step={2} title="Enter your code" />
      <SentTo email={email} onChange={() => setEditing(true)} changeLabel="Change email" />

      <form action={verifyAction} className="grid gap-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next ?? ""} />
        <Field label="6-digit code" name="code" hint={`Check your inbox. The code expires in ${minutes} minutes.`}>
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
        <Problem message={codeError} at={checked.at} />
        <Problem message={!sent.ok ? sent.message : undefined} at={sent.at} />
        <SubmitButton size="lg" className="mt-1 w-full" pendingText="Signing you in…">
          Sign in
        </SubmitButton>
      </form>

      <div className="grid gap-2 text-xs leading-relaxed text-muted-foreground">
        <form action={sendAction}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="intent" value="resend" />
          {/* Remounted by each code that goes out, which restarts its countdown. */}
          <ResendButton key={sent.at} seconds={resendSeconds} />
        </form>
        <p>Can&apos;t find the email? Check your spam or promotions folder.</p>
        <p aria-live="polite" className="text-foreground">
          {sent.resent ? "A new code is on its way. Use the most recent one." : ""}
        </p>
      </div>
    </div>
  );
}

/**
 * "Send a new code", held back until the server would really send one. Inside the minute it
 * would quietly answer "sent" without sending, so offering the button then would mislead.
 */
function ResendButton({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  if (pending) return <span>Sending a new code…</span>;
  if (left > 0) {
    return (
      <span>
        Didn&apos;t get it? You can ask for a new code in <span className="tabular-nums">{left}s</span>.
      </span>
    );
  }
  return (
    <button type="submit" className="underline underline-offset-4 transition-opacity duration-200 hover:opacity-60">
      Didn&apos;t get it? Send a new code
    </button>
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
