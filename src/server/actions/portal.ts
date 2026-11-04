"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { applications, candidates, employerContacts, employers, placements, vacancies, type PlacementFeedback } from "@/db/schema";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { assertRole, AuthzError } from "@/lib/permissions";
import { scoreMatch } from "@/lib/matching";
import { PACKAGES, SHORTLISTED_OR_LATER } from "@/lib/pipeline";
import { EMPLOYMENT_TYPES, isSectorCode, labelOf } from "@/lib/taxonomy";
import { logActivity } from "../activity";
import { recordSubmission } from "../intake";
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
  if (!res.ok) return res;
  await logActivity(session.user.id, "candidate", candidate.id, "profile_updated", "Updated by candidate");
  // Logged rather than flagged: staff need to know the dossier moved under them — a
  // verified qualification can be stale after an edit — but it owes nobody a reply.
  await recordSubmission({
    type: "profile_update",
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone,
    subject: `${candidate.pepId} revised their profile`,
    source: "/portal/candidate/profile",
    link: { entity: "candidate", id: candidate.id },
    actorId: session.user.id,
    details: [
      ["PEEP ID", candidate.pepId],
      ["Profession", candidate.profession],
      ["Stage at time of edit", candidate.stage],
      ["Why it matters", "Re-check any evidence affected by the change before shortlisting."],
    ],
  });
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

  const [employer] = await db.select({ name: employers.name }).from(employers).where(eq(employers.id, v.employerId));
  await recordSubmission({
    type: "job_application",
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone,
    organisation: employer?.name ?? null,
    subject: `${candidate.pepId} applied to ${v.title} (${v.ref})`,
    source: "/portal/candidate/jobs",
    link: { entity: "application", id: inserted[0].id },
    actorId: session.user.id,
    details: [
      ["PEEP ID", candidate.pepId],
      ["Vacancy", `${v.title} (${v.ref})`],
      ["Employer", employer?.name],
      ["Match score", `${match.total}%`],
      ["Candidate stage", candidate.stage],
      ["Profession", candidate.profession],
      ["Location", [candidate.city, candidate.state].filter(Boolean).join(", ")],
    ],
  });

  return ok("Application sent. A PEEPs consultant will review it against the vacancy.");
});

export const requestCareerService = guard(async (_: ActionState, fd: FormData) => {
  const { candidate } = await myCandidate();
  const service = str(fd, "service");
  const message = str(fd, "message");
  if (!service) return fail("Choose a service.");
  await recordSubmission({
    type: "career_service",
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone,
    subject: service,
    message: message || `Requested ${service} from the candidate portal.`,
    source: "/portal/candidate",
    link: { entity: "candidate", id: candidate.id },
    details: [
      ["PEEP ID", candidate.pepId],
      ["Service wanted", service],
      ["Profession", candidate.profession],
      ["Stage", candidate.stage],
    ],
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
    .returning();
  await logActivity(session.user.id, "vacancy", row.id, "received", "Posted from employer portal");

  const [company] = await db.select({ name: employers.name }).from(employers).where(eq(employers.id, employerId));
  const [me] = await db
    .select({ name: employerContacts.name, email: employerContacts.email, phone: employerContacts.phone })
    .from(employerContacts)
    .where(eq(employerContacts.userId, session.user.id));
  await recordSubmission({
    type: "talent_request",
    name: me?.name ?? session.user.name,
    email: me?.email ?? session.user.email,
    phone: me?.phone ?? null,
    organisation: company?.name ?? null,
    subject: `${row.headcount} × ${row.title} (${row.ref})`,
    message: row.description,
    source: "/portal/employer/vacancies/new",
    link: { entity: "vacancy", id: row.id },
    dueAt: row.deadline,
    actorId: session.user.id,
    details: [
      ["Vacancy", row.ref],
      ["Position", row.title],
      ["Headcount", row.headcount],
      ["Service", PACKAGES.find((x) => x.value === row.package)?.label ?? row.package],
      ["Location", row.city],
      ["Employment type", labelOf(EMPLOYMENT_TYPES, row.employmentType)],
      ["Minimum experience", row.experienceMin ? `${row.experienceMin} years` : null],
      ["Key skills", row.requiredSkills.join(", ")],
      ["Qualifications", row.qualifications],
      ["Hiring deadline", row.deadline ? row.deadline.toISOString().slice(0, 10) : null],
      ["Filed by", "Employer portal"],
    ],
  });

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
    .select({
      id: applications.id,
      stage: applications.stage,
      employerId: vacancies.employerId,
      ref: vacancies.ref,
      title: vacancies.title,
      pepId: candidates.pepId,
      candidateName: candidates.firstName,
    })
    .from(applications)
    .innerJoin(vacancies, eq(vacancies.id, applications.vacancyId))
    .innerJoin(candidates, eq(candidates.id, applications.candidateId))
    .where(eq(applications.id, applicationId));
  if (!app || app.employerId !== employerId) return fail("Candidate not found.");
  if (!SHORTLISTED_OR_LATER.includes(app.stage as never)) return fail("This candidate isn't on your shortlist.");
  const note = str(fd, "note");
  await db
    .update(applications)
    .set({
      employerDecision: decision === "interview" ? `Interview requested: ${note || "no note"}` : `Declined: ${note || "no reason given"}`,
      stage: decision === "interview" && app.stage === "shortlisted" ? "client_interview" : app.stage,
    })
    .where(eq(applications.id, applicationId));
  await logActivity(session.user.id, "application", applicationId, "employer_response", decision);

  const [company] = await db.select({ name: employers.name }).from(employers).where(eq(employers.id, employerId));
  await recordSubmission({
    type: "employer_decision",
    name: session.user.name,
    email: session.user.email,
    organisation: company?.name ?? null,
    subject: `${decision === "interview" ? "Interview requested" : "Declined"}: ${app.pepId} for ${app.title} (${app.ref})`,
    message: note || null,
    source: "/portal/employer",
    link: { entity: "application", id: applicationId },
    actorId: session.user.id,
    // An interview request needs a consultant to coordinate it; a decline does not.
    status: decision === "interview" ? "new" : undefined,
    details: [
      ["Decision", decision === "interview" ? "Interview requested" : "Declined"],
      ["Candidate", `${app.candidateName} (${app.pepId})`],
      ["Vacancy", `${app.title} (${app.ref})`],
      ["Note", note],
    ],
  });

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

  const [ctx] = await db
    .select({ company: employers.name, title: vacancies.title, ref: vacancies.ref, pepId: candidates.pepId })
    .from(placements)
    .innerJoin(employers, eq(employers.id, placements.employerId))
    .innerJoin(vacancies, eq(vacancies.id, placements.vacancyId))
    .innerJoin(candidates, eq(candidates.id, placements.candidateId))
    .where(eq(placements.id, placementId));
  await recordSubmission({
    type: "placement_feedback",
    name: session.user.name,
    email: session.user.email,
    organisation: ctx?.company ?? null,
    subject: `${rating}/5 for ${ctx?.pepId ?? "placement"} — ${ctx?.title ?? ""} (${ctx?.ref ?? ""})`,
    message: feedback.strengths || null,
    source: "/portal/employer",
    link: { entity: "placement", id: placementId },
    actorId: session.user.id,
    // Anything under 4/5, or an employer who would not hire again, wants a consultant's eye.
    status: rating < 4 || !feedback.wouldHireAgain ? "new" : undefined,
    details: [
      ["Rating", `${rating}/5`],
      ["Suitable", feedback.suitable === "yes" ? "Yes" : feedback.suitable === "partly" ? "Partly" : "No"],
      ["Would hire again", feedback.wouldHireAgain ? "Yes" : "No"],
      ["Candidate", ctx?.pepId],
      ["Role", ctx ? `${ctx.title} (${ctx.ref})` : null],
      ["Strengths", feedback.strengths],
      ["Weaknesses", feedback.weaknesses],
      ["Missing skills", feedback.missingSkills],
    ],
  });

  return ok("Thank you. Your feedback goes straight into how we train and select talent.");
});
