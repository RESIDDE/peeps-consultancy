export interface ActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Changes on every completed submission so effects can react to repeats. */
  at?: number;
  /** A value the action hands back to the form, e.g. the normalised email a code went to. */
  value?: string;
  /** Where this request belongs instead, offered with `message` as a one-click link. */
  suggest?: { href: string; label: string };
}

export const initialActionState: ActionState = { ok: false };

export type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function ok(message?: string, value?: string): ActionState {
  return { ok: true, message, value, at: Date.now() };
}

export function fail(message: string, errors?: ActionState["errors"]): ActionState {
  return { ok: false, message, errors, at: Date.now() };
}
