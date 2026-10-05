export interface ActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Changes on every completed submission so effects can react to repeats. */
  at?: number;
}

export const initialActionState: ActionState = { ok: false };

export type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function ok(message?: string): ActionState {
  return { ok: true, message, at: Date.now() };
}

export function fail(message: string, errors?: ActionState["errors"]): ActionState {
  return { ok: false, message, errors, at: Date.now() };
}
