"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { ActionStateProvider } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ActionState, FormAction } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import { SentTo, StepHeader } from "./steps";

type Stage = "details" | "code";
interface State extends ActionState {
  stage: Stage;
}

/**
 * A form that is confirmed by an emailed code: registration.
 *
 * The same server action is submitted twice. The first time, with the details only, it
 * checks them and emails a code (answering ok, with the address in `value`). The second
 * time, with the same details plus `code`, it does the real work.
 *
 * It submits by hand rather than through `<form action>`, because React clears a form's
 * fields after an action submit, which would throw away everything typed in step one. The
 * details form stays mounted, only hidden, during the code step, so "Change details" goes
 * back to exactly what was entered.
 *
 * `children` are the fields, a `FormMessage` and the submit button, as inside ActionForm.
 */
export function ConfirmByCodeForm({
  action,
  className,
  children,
  minutes,
  confirmLabel,
}: {
  action: FormAction;
  className?: string;
  children: React.ReactNode;
  /** How long a code lasts, to say so on screen. */
  minutes: number;
  /** The button that redeems the code, e.g. "Create my account". */
  confirmLabel: string;
}) {
  const details = useRef<FormData | null>(null);
  const [editing, setEditing] = useState(false);

  const [state, run, pending] = useActionState<State, FormData>(
    async (prev, fd) => {
      const result = await action(prev, fd);
      // A code went out: move to (or stay on) the code step. Otherwise stay where we were,
      // so a wrong code or a "wait a minute" keeps you on the code step with the message.
      const stage: Stage = result.ok && result.value ? "code" : prev.stage;
      // Keep the address on screen: a refusal ("wrong code") carries no value of its own.
      return { ...result, value: result.value ?? prev.value, stage };
    },
    { ok: false, stage: "details" },
  );

  const onCodeStep = state.stage === "code" && !editing;

  function submitDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    details.current = fd;
    setEditing(false);
    startTransition(() => run(fd));
  }

  /** Resubmit the saved details, with the code or without it (to send a fresh one). */
  function resubmit(code?: string) {
    if (!details.current) return;
    const fd = new FormData();
    for (const [k, v] of details.current.entries()) fd.append(k, v);
    if (code) fd.set("code", code);
    startTransition(() => run(fd));
  }

  return (
    <ActionStateProvider value={state}>
      {/* Coming back from the code step replays the entrance: the form leaves display:none. */}
      <form onSubmit={submitDetails} className={cn(className, editing && "anim-step")} hidden={onCodeStep}>
        <StepHeader step={1} title="Your details" className="col-span-full" />
        {/* Disabled while the request runs: the submit button can't show its own pending
            text here, because this form doesn't go through a form action. */}
        <fieldset disabled={pending} className="contents">
          {children}
        </fieldset>
        {pending && !onCodeStep && (
          <p className="text-xs text-muted-foreground sm:col-span-2" aria-live="polite">
            Sending your code…
          </p>
        )}
      </form>

      {onCodeStep && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resubmit(String(new FormData(e.currentTarget).get("code") ?? ""));
          }}
          className="anim-step mt-12 grid gap-5"
        >
          <StepHeader step={2} title="Confirm your email" />
          <SentTo email={state.value ?? ""} onChange={() => setEditing(true)} changeLabel="Change details" />
          <Field label="6-digit code" name="code" hint={`Enter it to finish. The code expires in ${minutes} minutes.`}>
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
          {state.message && !state.ok && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.message}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Checking…" : confirmLabel}
          </Button>
          <div className="grid gap-2 text-xs leading-relaxed text-muted-foreground">
            <button
              type="button"
              disabled={pending}
              onClick={() => resubmit()}
              className="w-fit underline underline-offset-4 transition-opacity duration-200 hover:opacity-60"
            >
              Didn&apos;t get it? Send a new code
            </button>
            <p>Can&apos;t find the email? Check your spam or promotions folder.</p>
          </div>
        </form>
      )}
    </ActionStateProvider>
  );
}
