"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { db } from "@/db";
import { candidates, employerContacts, employers, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fail, type ActionState } from "@/lib/action-state";
import { homeFor } from "@/lib/permissions";
import { isSectorCode } from "@/lib/taxonomy";
import { CONSENT_VERSION } from "@/lib/consent";
import { issuePepId } from "../pep";
import { logActivity } from "../activity";
import { fieldErrors, int, str, zEmail, zPhone, zRequired } from "../forms";

const password = z.string().min(8, "Use at least 8 characters").max(128);

const EMAIL_TAKEN = "An account with this email already exists. Try signing in.";

function authMessage(e: unknown): string {
  if (e instanceof APIError) {
    const msg = e.body?.message ?? e.message;
    if (/exist/i.test(msg)) return EMAIL_TAKEN;
    if (/invalid/i.test(msg)) return "Incorrect email or password.";
    return msg;
  }
  console.error(e);
  return "Something went wrong. Please try again.";
}

/**
 * With autoSignIn off, Better Auth answers a duplicate sign-up with a synthetic
 * user instead of an error, so check up front to keep the explicit message.
 */
async function emailTaken(email: string) {
  const [row] = await db.select({ id: user.id }).from(user).where(eq(user.email, email.toLowerCase()));
  return Boolean(row);
}

/** Undo a just-created auth user when the profile write fails, so the email can register again. */
async function discardUser(id: string) {
  await db
    .delete(user)
    .where(eq(user.id, id))
    .catch((e) => console.error(e));
}

function safeNext(next: string): string | null {
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function signIn(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const pw = str(fd, "password");
  if (!email || !pw) return fail("Enter your email and password.");
  let role: string | undefined;
  try {
    const res = await auth.api.signInEmail({ body: { email, password: pw }, headers: await headers() });
    role = (res.user as { role?: string }).role;
  } catch (e) {
    return fail(authMessage(e));
  }
  redirect(safeNext(str(fd, "next")) ?? homeFor(role));
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

const candidateSchema = z.object({
  firstName: zRequired("First name"),
  lastName: zRequired("Last name"),
  email: zEmail,
  phone: zPhone,
  password,
  city: zRequired("City"),
  sectorCode: z.string().refine(isSectorCode, "Choose a talent category"),
  profession: zRequired("Profession"),
  consent: z.literal(true, { error: "We need your consent to process your profile" }),
});

export async function registerCandidate(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = candidateSchema.safeParse({
    firstName: str(fd, "firstName"),
    lastName: str(fd, "lastName"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    password: str(fd, "password"),
    city: str(fd, "city"),
    sectorCode: str(fd, "sectorCode"),
    profession: str(fd, "profession"),
    consent: fd.get("consent") === "on",
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  if (await emailTaken(d.email)) return fail(EMAIL_TAKEN);

  let pendingUserId: string | null = null;
  try {
    const res = await auth.api.signUpEmail({
      body: { name: `${d.firstName} ${d.lastName}`, email: d.email, password: d.password },
      headers: await headers(),
    });
    pendingUserId = res.user.id;
    const pepId = await issuePepId(d.sectorCode);
    const [c] = await db
      .insert(candidates)
      .values({
        pepId,
        userId: res.user.id,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone || null,
        city: d.city,
        sectorCode: d.sectorCode,
        profession: d.profession,
        yearsExperience: int(fd, "yearsExperience") ?? 0,
        source: str(fd, "source") || "website",
        consentAt: new Date(),
        consentVersion: CONSENT_VERSION,
      })
      .returning({ id: candidates.id });
    pendingUserId = null;
    await auth.api.signInEmail({ body: { email: d.email, password: d.password }, headers: await headers() });
    await logActivity(res.user.id, "candidate", c.id, "registered", `Self-registered as ${pepId}`);
  } catch (e) {
    if (pendingUserId) await discardUser(pendingUserId);
    return fail(authMessage(e));
  }
  redirect("/portal/candidate?welcome=1");
}

const employerSchema = z.object({
  company: zRequired("Company name"),
  industry: z.string().trim(),
  city: zRequired("City"),
  name: zRequired("Your name"),
  role: z.string().trim(),
  email: zEmail,
  phone: zPhone,
  password,
});

export async function registerEmployer(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = employerSchema.safeParse({
    company: str(fd, "company"),
    industry: str(fd, "industry"),
    city: str(fd, "city"),
    name: str(fd, "name"),
    role: str(fd, "role"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    password: str(fd, "password"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  if (await emailTaken(d.email)) return fail(EMAIL_TAKEN);

  let pendingUserId: string | null = null;
  try {
    const res = await auth.api.signUpEmail({
      body: { name: d.name, email: d.email, password: d.password },
      headers: await headers(),
    });
    pendingUserId = res.user.id;
    // All-or-nothing: an employer login without a linked company would 404 on its dashboard.
    const emp = await db.transaction(async (tx) => {
      await tx.update(user).set({ role: "employer" }).where(eq(user.id, res.user.id));
      const [row] = await tx
        .insert(employers)
        .values({
          name: d.company,
          industry: d.industry || null,
          city: d.city,
          crmStage: "discovery",
          source: "website",
          nextAction: "Welcome call and vacancy analysis",
          nextActionAt: new Date(Date.now() + 86_400_000),
        })
        .returning({ id: employers.id });
      await tx.insert(employerContacts).values({
        employerId: row.id,
        userId: res.user.id,
        name: d.name,
        role: d.role || null,
        email: d.email,
        phone: d.phone || null,
        isPrimary: true,
      });
      return row;
    });
    pendingUserId = null;
    // Signed in only now, so the session already carries the employer role.
    await auth.api.signInEmail({ body: { email: d.email, password: d.password }, headers: await headers() });
    await logActivity(res.user.id, "employer", emp.id, "registered", "Employer self-registered");
  } catch (e) {
    if (pendingUserId) await discardUser(pendingUserId);
    return fail(authMessage(e));
  }
  redirect("/portal/employer?welcome=1");
}
