"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { applications, candidates, employerContacts, enquiries, placements, vacancies, type PlacementFeedback } from "@/db/schema";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { assertRole, AuthzError } from "@/lib/permissions";
import { scoreMatch } from "@/lib/matching";
import { PACKAGES, SHORTLISTED_OR_LATER } from "@/lib/pipeline";
import { isSectorCode } from "@/lib/taxonomy";
import { logActivity } from "../activity";
import { applyProfileUpdate } from "../profile";
import { date, int, list, optStr, str } from "../forms";

function refresh() {
  revalidatePath("/portal", "layout");
  revalidatePath("/console", "layout");
}

function guard<T extends unknown[]>(fn: (...args: T) => Promise<ActionState>) {
  return async (...args: T): Promise<ActionState> => {
    try {
      const res = await fn(...args);
      if (res.ok) refresh();
      return res;
    } catch (e) {
      if (e instanceof AuthzError) return fail(e.message);
      if (e && typeof e === "object" && "digest" in e) throw e;
      console.error(e);
      return fail("Something went wrong. Please try again.");
    }
  };
}

async function myCandidate() {
  const session = await assertRole(["candidate"]);
  const [c] = await db.select().from(candidates).where(eq(candidates.userId, session.user.id));
  if (!c) throw new AuthzError("No candidate profile is linked to this account.");
  return { session, candidate: c };
}

async function myEmployerId() {
  const session = await assertRole(["employer"]);
  const [contact] = await db
    .select({ employerId: employerContacts.employerId })
    .from(employerContacts)
    .where(eq(employerContacts.userId, session.user.id));
  if (!contact) throw new AuthzError("No company is linked to this account.");
  return { session, employerId: contact.employerId };
}

/* ---------------- Candidate ---------------- */

export const updateMyProfile = guard(async (_: ActionState, fd: FormData) => {
  const { session, candidate } = await myCandidate();
  const res = await applyProfileUpdate(candidate.id, fd);
  if (res.ok) await logActivity(session.user.id, "candidate", candidate.id, "profile_updated", "Updated by candidate");
  return res;
});

export const applyToVacancy = guard(async (_: ActionState, fd: FormData) => {
  const { session, candidate } = await myCandidate();
  const vacancyId = str(fd, "vacancyId");
  const [v] = await db.select().from(vacancies).where(and(eq(vacancies.id, vacancyId), eq(vacancies.published, true)));
  if (!v) return fail("This vacancy is no longer open.");
  const match = scoreMatch(candidate, v);
  const inserted = await db
    .insert(applications)
    .values({ vacancyId, candidateId: candidate.id, stage: "applied", origin: "applied", matchScore: match.total })
    .onConflictDoNothing()
    .returning({ id: applications.id });
  if (!inserted.length) return fail("You've already applied for this role.");
  await logActivity(session.user.id, "application", inserted[0].id, "applied", `${candidate.pepId} → ${v.ref}`);
  return ok("Application sent. A PEEPs consultant will review it against the vacancy.");
});

export const requestCareerService = guard(async (_: ActionState, fd: FormData) => {
  const { candidate } = await myCandidate();
  const service = str(fd, "service");
  const message = str(fd, "message");
  if (!service) return fail("Choose a service.");
  await db.insert(enquiries).values({
    type: "career_service",
    name: `${candidate.firstName} ${candidate.lastName} (${candidate.pepId})`,
    email: candidate.email,
    phone: candidate.phone,
    subject: service,
    message: message || `Requested ${service} from the candidate portal.`,
  });
  return ok("Request sent. We'll be in touch with options and pricing.");
});

/* ---------------- Employer ---------------- */

export const postVacancy = guard(async (_: ActionState, fd: FormData) => {
  const { session, employerId } = await myEmployerId();
  const title = str(fd, "title");
  const sectorCode = str(fd, "sectorCode");
  const pkg = str(fd, "package") || "professional";
  const errors: Record<string, string[]> = {};
  if (!title) errors.title = ["Position is required"];
  if (!isSectorCode(sectorCode)) errors.sectorCode = ["Choose a talent category"];
  if (!PACKAGES.some((p) => p.value === pkg)) errors.package = ["Choose a service"];
  if (Object.keys(errors).length) return fail("Please check the highlighted fields.", errors);

  const all = await db.select({ ref: vacancies.ref }).from(vacancies);
  const [row] = await db
    .insert(vacancies)
    .values({
      ref: `VAC-${String(all.length + 1).padStart(4, "0")}`,
      employerId,
      title,
      sectorCode,
      package: pkg,
      headcount: int(fd, "headcount") ?? 1,
      salaryMin: int(fd, "salaryMin"),
      salaryMax: int(fd, "salaryMax"),
      experienceMin: int(fd, "experienceMin") ?? 0,
      requiredSkills: list(fd, "requiredSkills"),
      qualifications: optStr(fd, "qualifications"),
      city: optStr(fd, "city"),
      employmentType: str(fd, "employmentType") || "full_time",
      deadline: date(fd, "deadline"),
      description: optStr(fd, "description"),
      status: "received",
    })
    .returning({ id: vacancies.id });
  await logActivity(session.user.id, "vacancy", row.id, "received", "Posted from employer portal");
  refresh();
  redirect(`/portal/employer/vacancies/${row.id}?posted=1`);
});

/** Employer's response to a shortlisted candidate. */
export const respondToCandidate = guard(async (_: ActionState, fd: FormData) => {
  const { session, employerId } = await myEmployerId();
  const applicationId = str(fd, "applicationId");
  const decision = str(fd, "decision");
  if (!["interview", "decline"].includes(decision)) return fail("Choose a response.");
  const [app] = await db
    .select({ id: applications.id, stage: applications.stage, employerId: vacancies.employerId })
    .from(applications)
    .innerJoin(vacancies, eq(vacancies.id, applications.vacancyId))
    .where(eq(applications.id, applicationId));
  if (!app || app.employerId !== employerId) return fail("Candidate not found.");
  if (!SHORTLISTED_OR_LATER.includes(app.stage as never)) return fail("This candidate isn't on your shortlist.");
  await db
    .update(applications)
    .set({
      employerDecision: decision === "interview" ? `Interview requested: ${str(fd, "note") || "no note"}` : `Declined: ${str(fd, "note") || "no reason given"}`,
      stage: decision === "interview" && app.stage === "shortlisted" ? "client_interview" : app.stage,
    })
    .where(eq(applications.id, applicationId));
  await logActivity(session.user.id, "application", applicationId, "employer_response", decision);
  return ok(decision === "interview" ? "Interview requested. Your consultant will coordinate." : "Thanks, we've recorded your feedback.");
});

export const submitPlacementFeedback = guard(async (_: ActionState, fd: FormData) => {
  const { session, employerId } = await myEmployerId();
  const placementId = str(fd, "placementId");
  const [pl] = await db.select().from(placements).where(and(eq(placements.id, placementId), eq(placements.employerId, employerId)));
  if (!pl) return fail("Placement not found.");
  const suitable = str(fd, "suitable");
  const rating = int(fd, "rating");
  if (!["yes", "partly", "no"].includes(suitable)) return fail("Was the candidate suitable?", { suitable: ["Required"] });
  if (!rating || rating < 1 || rating > 5) return fail("Give an overall rating.", { rating: ["Required"] });
  const feedback: PlacementFeedback = {
    suitable: suitable as PlacementFeedback["suitable"],
    strengths: str(fd, "strengths"),
    weaknesses: str(fd, "weaknesses"),
    missingSkills: str(fd, "missingSkills"),
    wouldHireAgain: str(fd, "wouldHireAgain") === "yes",
    rating,
  };
  await db.update(placements).set({ feedback, feedbackAt: new Date() }).where(eq(placements.id, placementId));
  await logActivity(session.user.id, "placement", placementId, "feedback", `Rating ${rating}/5`);
  return ok("Thank you. Your feedback goes straight into how we train and select talent.");
});
