"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { db } from "@/db";
import { user, type Role } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fail, type ActionState } from "@/lib/action-state";
import { STAFF } from "@/lib/permissions";
import { str } from "@/server/forms";

// One message for both cases, so the form never reveals which emails have accounts.
const REFUSED = "Incorrect email or password, or this isn't a PEEPs staff account.";

export async function staffSignIn(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  if (!email || !password) return fail("Enter your email and password.");

  // Only staff get a console session; employers and candidates use the main site.
  const [account] = await db.select({ role: user.role }).from(user).where(eq(user.email, email));
  if (!account || !STAFF.includes(account.role as Role)) return fail(REFUSED);

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (e) {
    if (e instanceof APIError) return fail(REFUSED);
    console.error(e);
    return fail("Something went wrong. Please try again.");
  }
  const next = str(fd, "next");
  redirect(next.startsWith("/console") ? next : "/console");
}
