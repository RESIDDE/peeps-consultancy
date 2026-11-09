import { and, desc, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { db } from "@/db";
import { user, verification } from "@/db/schema";
import { auth, OTP_MINUTES } from "@/lib/auth";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { sendEmail, signInCodeEmail } from "./email";
import { otpMessage } from "./otp-message";
import { str } from "./forms";

/**
 * Sign-in codes: the throttle, and issuing one to an address that has no account yet.
 *
 * Better Auth rate-limits its HTTP routes, but the site calls it from server actions, which
 * skip that limit. Without this, a form could be used to email the same person over and
 * over. The limit is one code per address per minute, read from the code Better Auth
 * itself stored (`sign-in-otp-<email>`), so there is no second store to keep in step.
 */
export const RESEND_AFTER_SECONDS = 60;

const identifier = (email: string) => `sign-in-otp-${email}`;

/** Whether a code went to this address within the last minute. */
export async function codeSentRecently(email: string): Promise<boolean> {
  const since = new Date(Date.now() - RESEND_AFTER_SECONDS * 1000);
  const [row] = await db
    .select({ id: verification.id })
    .from(verification)
    .where(and(eq(verification.identifier, identifier(email)), gt(verification.createdAt, since)))
    .orderBy(desc(verification.createdAt))
    .limit(1);
  return !!row;
}

/**
 * Issue and email a sign-in code to an address with no account, for registration.
 *
 * The public route won't send to unknown addresses (sign-ups are off there), so this uses
 * the server-only call that creates the code, and sends it here. Registration then creates
 * the account and redeems the code with `signInEmailOTP`, which proves the address.
 */
export async function sendRegistrationCode(email: string): Promise<void> {
  const otp = await auth.api.createVerificationOTP({ body: { email, type: "sign-in" } });
  await sendEmail(signInCodeEmail(email, otp, OTP_MINUTES));
}

/* ------------------------------------------------------------------ */
/* Creating an account behind a code                                   */
/* ------------------------------------------------------------------ */

/**
 * Account creation is two submits of the same form (website registration, and the console's
 * first-admin page). Without a code, the form's details are checked and a code is emailed.
 * With one, the account is created and the code redeemed against it before anything else
 * is written, so an account only survives if the address is proven.
 */
export async function sendCodeStep(email: string): Promise<ActionState> {
  if (await codeSentRecently(email)) {
    return fail("We sent a code less than a minute ago. Check your inbox, or wait a minute for a new one.");
  }
  try {
    await sendRegistrationCode(email);
  } catch (e) {
    console.error(e);
    return fail("We couldn't send a code just now. Please try again.");
  }
  return ok("Code sent.", email);
}

/** The code from the second submit, or null on the first. */
export function codeFrom(fd: FormData): string | null {
  const code = str(fd, "code").replace(/\s+/g, "");
  return code === "" ? null : code;
}

/**
 * Create the login and prove the address in one step. The login gets a random password
 * that nobody ever sees: Better Auth needs one to create the account, password sign-in is
 * closed to the outside, and redeeming the code deletes it anyway. A wrong code removes
 * the login again before any profile is written.
 */
export async function createVerifiedLogin(
  name: string,
  email: string,
  code: string,
  role?: "employer" | "admin",
): Promise<{ userId: string } | { error: string }> {
  const res = await auth.api.signUpEmail({
    body: { name, email, password: `${crypto.randomUUID()}${crypto.randomUUID()}` },
    headers: await headers(),
  });
  // Before the session exists, so the session already carries the right role.
  if (role) await db.update(user).set({ role }).where(eq(user.id, res.user.id));
  try {
    await auth.api.signInEmailOTP({ body: { email, otp: code }, headers: await headers() });
  } catch (e) {
    await db.delete(user).where(eq(user.id, res.user.id)).catch((err) => console.error(err));
    if (e instanceof APIError) return { error: otpMessage(e) };
    throw e;
  }
  return { userId: res.user.id };
}
