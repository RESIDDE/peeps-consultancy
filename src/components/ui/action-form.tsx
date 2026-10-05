"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { initialActionState, type ActionState, type FormAction } from "@/lib/action-state";
import { useDialogClose } from "./dialog";

const StateCtx = React.createContext<ActionState>(initialActionState);

export function useActionFormState() {
  return React.useContext(StateCtx);
}

/**
 * Form bound to a server action via useActionState. Shows a toast with the
 * action's message, exposes field errors to <FieldError>, can reset itself
 * and close an enclosing <Dialog> on success.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  closeOnSuccess = true,
  silent = false,
  id,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  closeOnSuccess?: boolean;
  silent?: boolean;
  id?: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeDialog = useDialogClose();

  React.useEffect(() => {
    if (!state.at) return;
    if (state.ok) {
      if (!silent && state.message) toast.success(state.message);
      if (resetOnSuccess) formRef.current?.reset();
      if (closeOnSuccess) closeDialog?.();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, silent, resetOnSuccess, closeOnSuccess, closeDialog]);

  return (
    <StateCtx.Provider value={state}>
      <form ref={formRef} action={formAction} className={className} id={id} noValidate={false}>
        {children}
      </form>
    </StateCtx.Provider>
  );
}

export function FieldError({ name }: { name: string }) {
  const state = useActionFormState();
  const err = state.errors?.[name]?.[0];
  if (!err) return null;
  return <p className="text-xs text-destructive">{err}</p>;
}

export function FormMessage() {
  const state = useActionFormState();
  if (!state.at || !state.message || state.ok) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {state.message}
    </p>
  );
}
