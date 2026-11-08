"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { user } from "@/db/schema";
import { fail, type ActionState } from "@/lib/action-state";
import { fieldErrors, str, zEmail, zRequired } from "@/server/forms";
import { codeFrom, createVerifiedLogin, sendCodeStep } from "@/server/otp";
import { adminExists } from "./admin-exists";

const CLOSED = "An admin account already exists. Sign in instead, or ask an admin to add you.";

const schema = z.object({ name: zRequired("Your name"), email: zEmail });

/**
 * Create the console's first admin, confirmed by an emailed code, and sign them in.
 *
 * Open only while there is no admin at all, and checked again just before the account is
 * created, so the page can't be used to make a second admin. Everyone after the first is
 * added from inside the console by an admin.
 */
export async function createFirstAdmin(_: ActionState, fd: FormData): Promise<ActionState> {
  if (await adminExists()) return fail(CLOSED);

  const parsed = schema.safeParse({ name: str(fd, "name"), email: str(fd, "email") });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const { name, email } = parsed.data;

  // An address that already has a candidate or employer account can't silently become an
  // admin: that would take away the account its owner signed up for.
  const [existing] = await db.select({ role: user.role }).from(user).where(eq(user.email, email));
  if (existing) {
    return fail(`This email already has a ${existing.role} account on PEEPs. Use a different email for the admin account.`);
  }

  const code = codeFrom(fd);
  if (code === null) return sendCodeStep(email);
  if (!/^\d{6}$/.test(code)) return fail("Enter the 6-digit code from the email.");

  // Checked again: someone else may have finished setting up while this code was in flight.
  if (await adminExists()) return fail(CLOSED);

  const login = await createVerifiedLogin(name, email, code, "admin");
  if ("error" in login) return fail(login.error);
  redirect("/console");
}
