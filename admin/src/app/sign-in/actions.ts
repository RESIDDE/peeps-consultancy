"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { db } from "@/db";
import { user, type Role } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { STAFF } from "@/lib/permissions";
import { otpMessage } from "@/server/otp-message";
import { str } from "@/server/forms";
import { codeSentRecently } from "@/server/otp";

/** Whether this address belongs to a staff account. Only staff get a console session. */
async function isStaff(email: string): Promise<boolean> {
  const [account] = await db.select({ role: user.role }).from(user).where(eq(user.email, email));
  return !!account && STAFF.includes(account.role as Role);
}

/**
 * Step one: email a code, but only to staff. Every well-formed address gets the same
 * answer, so the console can't be used to find out who works at PEEPs. Employers and
 * candidates sign in on the main site.
 */
export async function requestStaffCode(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.");
  if (!(await isStaff(email))) return ok("Code sent.", email);
  // One code a minute per address. Answered as "sent" either way, so this can't reveal
  // which addresses have accounts; the code sent a moment ago still works.
  if (await codeSentRecently(email)) return ok("Code sent.", email);
  try {
    await auth.api.sendVerificationOTP({ body: { email, type: "sign-in" }, headers: await headers() });
  } catch (e) {
    if (e instanceof APIError && e.status === "TOO_MANY_REQUESTS") return fail("Too many codes requested. Wait a minute and try again.");
    console.error(e);
    return fail("We couldn't send a code just now. Please try again.");
  }
  return ok("Code sent.", email);
}

/** Step two: check the code and open the console. */
export async function verifyStaffCode(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const otp = str(fd, "code").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(otp)) return fail("Enter the 6-digit code from the email.");
  // Checked again here: a non-staff address never received a code, but a guessed one
  // must not open a console session either.
  if (!(await isStaff(email))) return fail("That code isn't right. Check the email and try again.");
  try {
    await auth.api.signInEmailOTP({ body: { email, otp }, headers: await headers() });
  } catch (e) {
    if (e instanceof APIError) return fail(otpMessage(e));
    console.error(e);
    return fail("Something went wrong. Please try again.");
  }
  const next = str(fd, "next");
  redirect(next.startsWith("/console") ? next : "/console");
}
