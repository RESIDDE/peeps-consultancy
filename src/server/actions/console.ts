"use server";

import { z } from "zod";
import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  applications,
  assessments,
  candidates,
  employerContacts,
  employers,
  enquiries,
  notes,
  partners,
  placements,
  revenueEntries,
  vacancies,
  verificationChecks,
} from "@/db/schema";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { assertRole, AuthzError, STAFF } from "@/lib/permissions";
import { CHECK_META, CHECK_STATUSES, CHECK_TYPES, STAGE_META, nextStep, stageIndex, type CheckType } from "@/lib/quality";
import {
  APPLICATION_STAGES,
  CRM_STAGES,
  INVOICE_STATUSES,
  MOU_STATUSES,
  PACKAGES,
  PARTNER_TYPES,
  RETENTION_STATUSES,
  REVENUE_STREAMS,
  SHORTLISTED_OR_LATER,
  VACANCY_STATUSES,
  type ApplicationStage,
} from "@/lib/pipeline";
import { ASSESSMENT_TEMPLATES, CLASSIFICATIONS, INTERVIEW_TEMPLATE, isSectorCode, type TemplateKey } from "@/lib/taxonomy";
import { scoreMatch } from "@/lib/matching";
import { CONSENT_VERSION } from "@/lib/consent";
import { logActivity } from "../activity";
import { loadEvidence, recomputeStage } from "../stage";
import { issuePepId } from "../pep";
import { bool, date, fieldErrors, int, list, optStr, str, zEmail, zPhone, zRequired } from "../forms";
import { applyProfileUpdate } from "../profile";

const values = <T extends readonly { value: string }[]>(arr: T) => arr.map((a) => a.value) as [string, ...string[]];

function refresh() {
  revalidatePath("/console", "layout");
  revalidatePath("/portal", "layout");
}

/** Wrap a staff action: checks role, converts thrown errors into a toast. */
function staffAction(fn: (fd: FormData, actorId: string) => Promise<ActionState>) {
  return async (_: ActionState, fd: FormData): Promise<ActionState> => {
    try {
      const session = await assertRole(STAFF);
      const result = await fn(fd, session.user.id);
      if (result.ok) refresh();
      return result;
    } catch (e) {
      if (e instanceof AuthzError) return fail(e.message);
      // redirect() throws a control-flow error that must propagate.
      if (e && typeof e === "object" && "digest" in e) throw e;
      console.error(e);
      return fail("Something went wrong. Please try again.");
    }
  };
}

/* ------------------------------------------------------------------ */
/* Talent                                                              */
/* ------------------------------------------------------------------ */

export const setCheck = staffAction(async (fd, actorId) => {
  const candidateId = str(fd, "candidateId");
  const type = str(fd, "type") as CheckType;
  const status = str(fd, "status");
  const notesText = str(fd, "notes");
  if (!CHECK_TYPES.includes(type)) return fail("Unknown check.");
  if (!(CHECK_STATUSES as readonly string[]).includes(status)) return fail("Unknown status.");
  if (status === "not_applicable" && !CHECK_META[type].allowNA) {
    return fail(`${CHECK_META[type].label} cannot be marked N/A.`);
  }
  if ((status === "not_applicable" || status === "failed") && notesText.length < 5) {
    return fail("Add a short reason when marking a check N/A or failed.", { notes: ["A reason is required"] });
  }

  const decided = status === "passed" || status === "failed" || status === "not_applicable";
  await db
    .insert(verificationChecks)
    .values({
      candidateId,
      type,
      status,
      notes: notesText || null,
      verifiedById: decided ? actorId : null,
      verifiedAt: decided ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [verificationChecks.candidateId, verificationChecks.type],
      set: {
        status,
        notes: notesText || null,
        verifiedById: decided ? actorId : null,
        verifiedAt: decided ? new Date() : null,
      },
    });
  await logActivity(actorId, "candidate", candidateId, "check_updated", `${CHECK_META[type].label}: ${status.replace("_", " ")}`);
  const stage = await recomputeStage(candidateId, actorId);
  return ok(`${CHECK_META[type].label} saved · now ${STAGE_META[stage!]?.label ?? stage}`);
});

export const recordAssessment = staffAction(async (fd, actorId) => {
  const candidateId = str(fd, "candidateId");
  const kind = str(fd, "kind") === "interview" ? "interview" : "technical";
  const templateKey = (kind === "interview" ? "interview" : str(fd, "template")) as TemplateKey | "interview";
  const template = templateKey === "interview" ? INTERVIEW_TEMPLATE : ASSESSMENT_TEMPLATES[templateKey as TemplateKey];
  if (!template) return fail("Choose an assessment template.");
  const outcome = str(fd, "outcome");
  if (!["recommend", "develop", "not_suitable"].includes(outcome)) return fail("Choose an outcome.");
  const evidence = str(fd, "evidence");
  if (evidence.length < 15) return fail("Record the evidence behind the scores.", { evidence: ["At least a sentence of evidence"] });

  const scores: Record<string, number> = {};
  for (const c of template.criteria) {
    const v = int(fd, `score_${c.key}`);
    if (v == null || v < 1 || v > 4) return fail(`Score every criterion (missing: ${c.label}).`);
    scores[c.key] = v;
  }

  await db.insert(assessments).values({
    candidateId,
    kind,
    template: templateKey,
    scores,
    outcome: outcome as "recommend" | "develop" | "not_suitable",
    evidence,
    assessorId: actorId,
    assessedAt: new Date(),
  });

  // The matching ladder check follows the assessment outcome.
  const checkType: CheckType = kind === "interview" ? "interview" : "skills_assessment";
  const checkStatus = outcome === "recommend" ? "passed" : outcome === "not_suitable" ? "failed" : "pending";
  const checkNote =
    outcome === "develop"
      ? `${template.name}: development needed before re-assessment.`
      : `${template.name} recorded (${outcome.replace("_", " ")}).`;
  await db
    .insert(verificationChecks)
    .values({ candidateId, type: checkType, status: checkStatus, notes: checkNote, verifiedById: actorId, verifiedAt: new Date() })
    .onConflictDoUpdate({
      target: [verificationChecks.candidateId, verificationChecks.type],
      set: { status: checkStatus, notes: checkNote, verifiedById: actorId, verifiedAt: new Date() },
    });

  await logActivity(actorId, "candidate", candidateId, "assessed", `${template.name}: ${outcome.replace("_", " ")}`);
  const stage = await recomputeStage(candidateId, actorId);
  return ok(`Assessment recorded · now ${STAGE_META[stage!]?.label ?? stage}`);
});

export const setClassification = staffAction(async (fd, actorId) => {
  const candidateId = str(fd, "candidateId");
  const classification = str(fd, "classification");
  const rationale = str(fd, "rationale");
  if (!values(CLASSIFICATIONS).includes(classification)) return fail("Choose a classification.");
  if (rationale.length < 20) {
    return fail("Explain the evidence behind the classification.", { rationale: ["At least 20 characters"] });
  }
  await db.update(candidates).set({ classification, classificationRationale: rationale }).where(eq(candidates.id, candidateId));
  await logActivity(actorId, "candidate", candidateId, "classified", classification);
  const stage = await recomputeStage(candidateId, actorId);
  return ok(`Classification saved · now ${STAGE_META[stage!]?.label ?? stage}`);
});

export const addNote = staffAction(async (fd, actorId) => {
  const entity = str(fd, "entity");
  const entityId = str(fd, "entityId");
  const body = str(fd, "body");
  if (!["candidate", "employer", "vacancy"].includes(entity) || !entityId) return fail("Invalid note target.");
  if (body.length < 2) return fail("Write a note first.");
  await db.insert(notes).values({ entity, entityId, body, authorId: actorId });
  return ok("Note added.");
});

const intakeSchema = z.object({
  firstName: zRequired("First name"),
  lastName: zRequired("Last name"),
  email: zEmail,
  phone: zPhone,
  city: zRequired("City"),
  sectorCode: z.string().refine(isSectorCode, "Choose a talent category"),
  profession: zRequired("Profession"),
  consent: z.literal(true, { error: "Signed consent is required before a profile is created" }),
});

export const createCandidate = staffAction(async (fd, actorId) => {
  const parsed = intakeSchema.safeParse({
    firstName: str(fd, "firstName"),
    lastName: str(fd, "lastName"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    city: str(fd, "city"),
    sectorCode: str(fd, "sectorCode"),
    profession: str(fd, "profession"),
    consent: bool(fd, "consent"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const pepId = await issuePepId(d.sectorCode);
  const [row] = await db
    .insert(candidates)
    .values({
      pepId,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone || null,
      city: d.city,
      sectorCode: d.sectorCode,
      profession: d.profession,
      yearsExperience: int(fd, "yearsExperience") ?? 0,
      source: str(fd, "source") || "training_school",
      partnerId: optStr(fd, "partnerId"),
      consentAt: new Date(),
      consentVersion: CONSENT_VERSION,
    })
    .returning({ id: candidates.id });
  await logActivity(actorId, "candidate", row.id, "registered", `Registered by PEEPs staff as ${pepId}`);
  refresh();
  redirect(`/console/talent/${row.id}`);
});

export const updateCandidate = staffAction(async (fd, actorId) => {
  const candidateId = str(fd, "candidateId");
  const res = await applyProfileUpdate(candidateId, fd);
  if (!res.ok) return res;
  await logActivity(actorId, "candidate", candidateId, "profile_updated", "Profile edited by staff");
  return ok("Profile updated.");
});

/* ------------------------------------------------------------------ */
/* Employers / CRM                                                     */
/* ------------------------------------------------------------------ */

const employerSchema = z.object({
  name: zRequired("Company name"),
  industry: z.string(),
  city: z.string(),
  size: z.string(),
  website: z.string(),
  crmStage: z.enum(values(CRM_STAGES)),
  membershipTier: z.enum(["none", "corporate"]),
});

export const createEmployer = staffAction(async (fd, actorId) => {
  const parsed = employerSchema.safeParse({
    name: str(fd, "name"),
    industry: str(fd, "industry"),
    city: str(fd, "city"),
    size: str(fd, "size"),
    website: str(fd, "website"),
    crmStage: str(fd, "crmStage") || "target",
    membershipTier: str(fd, "membershipTier") || "none",
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const [row] = await db
    .insert(employers)
    .values({
      name: d.name,
      industry: d.industry || null,
      city: d.city || null,
      size: d.size || null,
      website: d.website || null,
      crmStage: d.crmStage,
      membershipTier: d.membershipTier,
      ownerId: actorId,
      source: "outreach",
      nextAction: optStr(fd, "nextAction"),
      nextActionAt: date(fd, "nextActionAt"),
    })
    .returning({ id: employers.id });
  const contactName = str(fd, "contactName");
  if (contactName) {
    await db.insert(employerContacts).values({
      employerId: row.id,
      name: contactName,
      role: optStr(fd, "contactRole"),
      email: optStr(fd, "contactEmail"),
      phone: optStr(fd, "contactPhone"),
      isPrimary: true,
    });
  }
  await logActivity(actorId, "employer", row.id, "created", `Added at ${d.crmStage}`);
  refresh();
  redirect(`/console/employers/${row.id}`);
});

export const updateEmployer = staffAction(async (fd, actorId) => {
  const employerId = str(fd, "employerId");
  const crmStage = str(fd, "crmStage");
  if (!values(CRM_STAGES).includes(crmStage)) return fail("Choose a pipeline stage.");
  const [before] = await db.select({ crmStage: employers.crmStage }).from(employers).where(eq(employers.id, employerId));
  await db
    .update(employers)
    .set({
      crmStage,
      industry: optStr(fd, "industry"),
      city: optStr(fd, "city"),
      size: optStr(fd, "size"),
      website: optStr(fd, "website"),
      membershipTier: str(fd, "membershipTier") || "none",
      nextAction: optStr(fd, "nextAction"),
      nextActionAt: date(fd, "nextActionAt"),
      ownerId: optStr(fd, "ownerId"),
    })
    .where(eq(employers.id, employerId));
  if (before && before.crmStage !== crmStage) {
    await logActivity(actorId, "employer", employerId, "stage_changed", `${before.crmStage} → ${crmStage}`);
  }
  return ok("Employer updated.");
});

export const moveEmployerStage = staffAction(async (fd, actorId) => {
  const employerId = str(fd, "employerId");
  const crmStage = str(fd, "crmStage");
  if (!values(CRM_STAGES).includes(crmStage)) return fail("Unknown stage.");
  const [before] = await db.select({ crmStage: employers.crmStage }).from(employers).where(eq(employers.id, employerId));
  await db.update(employers).set({ crmStage }).where(eq(employers.id, employerId));
  await logActivity(actorId, "employer", employerId, "stage_changed", `${before?.crmStage} → ${crmStage}`);
  return ok(`Moved to ${CRM_STAGES.find((s) => s.value === crmStage)?.label}.`);
});

export const addContact = staffAction(async (fd) => {
  const employerId = str(fd, "employerId");
  const name = str(fd, "name");
  if (!name) return fail("Contact name is required.", { name: ["Required"] });
  await db.insert(employerContacts).values({
    employerId,
    name,
    role: optStr(fd, "role"),
    email: optStr(fd, "email"),
    phone: optStr(fd, "phone"),
  });
  return ok("Contact added.");
});

/* ------------------------------------------------------------------ */
/* Vacancies & pipeline                                                */
/* ------------------------------------------------------------------ */

async function nextVacancyRef() {
  const [{ n }] = await db.select({ n: count() }).from(vacancies);
  return `VAC-${String(n + 1).padStart(4, "0")}`;
}

const vacancySchema = z.object({
  employerId: zRequired("Employer"),
  title: zRequired("Position"),
  sectorCode: z.string().refine(isSectorCode, "Choose a talent category"),
  package: z.enum(values(PACKAGES)),
});

export const createVacancy = staffAction(async (fd, actorId) => {
  const parsed = vacancySchema.safeParse({
    employerId: str(fd, "employerId"),
    title: str(fd, "title"),
    sectorCode: str(fd, "sectorCode"),
    package: str(fd, "package") || "professional",
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const [row] = await db
    .insert(vacancies)
    .values({
      ref: await nextVacancyRef(),
      employerId: d.employerId,
      title: d.title,
      sectorCode: d.sectorCode,
      package: d.package,
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
      status: "analysis",
    })
    .returning({ id: vacancies.id });
  await logActivity(actorId, "vacancy", row.id, "created", d.title);
  refresh();
  redirect(`/console/vacancies/${row.id}`);
});

export const updateVacancy = staffAction(async (fd, actorId) => {
  const vacancyId = str(fd, "vacancyId");
  const status = str(fd, "status");
  if (!values(VACANCY_STATUSES).includes(status)) return fail("Choose a status.");
  await db
    .update(vacancies)
    .set({
      status,
      analysisNotes: optStr(fd, "analysisNotes"),
      published: bool(fd, "published"),
      requiredSkills: list(fd, "requiredSkills"),
      salaryMin: int(fd, "salaryMin"),
      salaryMax: int(fd, "salaryMax"),
      experienceMin: int(fd, "experienceMin") ?? 0,
      headcount: int(fd, "headcount") ?? 1,
      city: optStr(fd, "city"),
    })
    .where(eq(vacancies.id, vacancyId));
  await logActivity(actorId, "vacancy", vacancyId, "updated", `Status: ${status}`);
  return ok("Vacancy updated.");
});

const STATUS_FOR_STAGE: Partial<Record<ApplicationStage, string>> = {
  screened: "sourcing",
  interviewed: "sourcing",
  shortlisted: "shortlisting",
  client_interview: "interviewing",
  offer: "offer",
};
const VACANCY_ORDER = values(VACANCY_STATUSES);

/** Vacancy status only ever moves forward automatically. */
async function nudgeVacancyStatus(vacancyId: string, appStage: ApplicationStage) {
  const target = STATUS_FOR_STAGE[appStage];
  if (!target) return;
  const [v] = await db.select({ status: vacancies.status }).from(vacancies).where(eq(vacancies.id, vacancyId));
  if (v && VACANCY_ORDER.indexOf(target) > VACANCY_ORDER.indexOf(v.status) && !["filled", "closed"].includes(v.status)) {
    await db.update(vacancies).set({ status: target }).where(eq(vacancies.id, vacancyId));
  }
}

export const addToPipeline = staffAction(async (fd, actorId) => {
  const vacancyId = str(fd, "vacancyId");
  const candidateId = str(fd, "candidateId");
  const [v] = await db.select().from(vacancies).where(eq(vacancies.id, vacancyId));
  const [c] = await db.select().from(candidates).where(eq(candidates.id, candidateId));
  if (!v || !c) return fail("Vacancy or candidate not found.");
  const match = scoreMatch(c, v);
  const inserted = await db
    .insert(applications)
    .values({ vacancyId, candidateId, stage: "sourced", origin: "sourced", matchScore: match.total })
    .onConflictDoNothing()
    .returning({ id: applications.id });
  if (!inserted.length) return fail(`${c.firstName} is already in this pipeline.`);
  await logActivity(actorId, "application", inserted[0].id, "sourced", `${c.pepId} → ${v.ref}`);
  await nudgeVacancyStatus(vacancyId, "screened");
  return ok(`${c.firstName} ${c.lastName} added to ${v.ref}.`);
});

export const moveApplication = staffAction(async (fd, actorId) => {
  const applicationId = str(fd, "applicationId");
  const stage = str(fd, "stage") as ApplicationStage;
  if (!values(APPLICATION_STAGES).includes(stage)) return fail("Unknown stage.");
  if (stage === "placed") return fail("Use “Record placement” to mark a hire.");

  const [app] = await db
    .select({ id: applications.id, candidateId: applications.candidateId, vacancyId: applications.vacancyId, summary: applications.shortlistSummary })
    .from(applications)
    .where(eq(applications.id, applicationId));
  if (!app) return fail("Application not found.");

  // The core PEEPs promise: only evidenced candidates reach a client.
  if (SHORTLISTED_OR_LATER.includes(stage)) {
    const ev = await loadEvidence(app.candidateId);
    const [c] = await db.select({ stage: candidates.stage }).from(candidates).where(eq(candidates.id, app.candidateId));
    if (!ev || !c || stageIndex(c.stage) < stageIndex("peeps_ready")) {
      const missing = ev ? nextStep(ev).missing.map((m) => m.label).slice(0, 3).join("; ") : "";
      return fail(`Only PEEPs Ready candidates can be shortlisted to a client.${missing ? ` Still needed: ${missing}.` : ""}`);
    }
    if (!app.summary) {
      return fail("Write the shortlist summary (why this candidate fits) before shortlisting.");
    }
  }

  await db.update(applications).set({ stage }).where(eq(applications.id, applicationId));
  await logActivity(actorId, "application", applicationId, "moved", stage);
  await nudgeVacancyStatus(app.vacancyId, stage);
  await recomputeStage(app.candidateId, actorId);
  return ok(`Moved to ${APPLICATION_STAGES.find((s) => s.value === stage)?.label}.`);
});

export const updateShortlistSummary = staffAction(async (fd) => {
  const applicationId = str(fd, "applicationId");
  const summary = str(fd, "summary");
  if (summary.length < 20) return fail("Summarise the evidence in at least a sentence.", { summary: ["At least 20 characters"] });
  await db.update(applications).set({ shortlistSummary: summary }).where(eq(applications.id, applicationId));
  return ok("Shortlist summary saved.");
});

export const recordPlacement = staffAction(async (fd, actorId) => {
  const applicationId = str(fd, "applicationId");
  const startDate = date(fd, "startDate");
  const fee = int(fd, "fee");
  if (!startDate) return fail("Enter the start date.", { startDate: ["Required"] });
  if (fee == null || fee < 0) return fail("Enter the placement fee (₦).", { fee: ["Required"] });

  const [app] = await db.select().from(applications).where(eq(applications.id, applicationId));
  if (!app) return fail("Application not found.");
  if (!SHORTLISTED_OR_LATER.includes(app.stage as ApplicationStage)) {
    return fail("Only shortlisted candidates can be placed.");
  }
  const [v] = await db.select().from(vacancies).where(eq(vacancies.id, app.vacancyId));
  const [c] = await db.select({ pepId: candidates.pepId }).from(candidates).where(eq(candidates.id, app.candidateId));

  const [pl] = await db
    .insert(placements)
    .values({
      applicationId,
      candidateId: app.candidateId,
      employerId: v.employerId,
      vacancyId: v.id,
      startDate,
      annualSalary: int(fd, "annualSalary"),
      fee,
      invoiceStatus: str(fd, "invoiceStatus") || "draft",
    })
    .onConflictDoNothing()
    .returning({ id: placements.id });
  if (!pl) return fail("This placement is already recorded.");

  await db.update(applications).set({ stage: "placed" }).where(eq(applications.id, applicationId));
  await db.insert(revenueEntries).values({
    stream: "recruitment",
    amount: fee,
    date: startDate,
    description: `Placement fee: ${v.title} (${c?.pepId ?? ""})`,
    employerId: v.employerId,
    placementId: pl.id,
  });

  const [{ n }] = await db.select({ n: count() }).from(placements).where(eq(placements.vacancyId, v.id));
  if (n >= v.headcount) await db.update(vacancies).set({ status: "filled" }).where(eq(vacancies.id, v.id));

  const [emp] = await db.select({ crmStage: employers.crmStage }).from(employers).where(eq(employers.id, v.employerId));
  const crmOrder = values(CRM_STAGES);
  if (emp && crmOrder.indexOf(emp.crmStage) < crmOrder.indexOf("placement")) {
    await db.update(employers).set({ crmStage: "placement" }).where(eq(employers.id, v.employerId));
  }

  await logActivity(actorId, "placement", pl.id, "placed", `${c?.pepId} → ${v.ref}`);
  await recomputeStage(app.candidateId, actorId);
  return ok("Placement recorded. Congratulations!");
});

export const updatePlacement = staffAction(async (fd, actorId) => {
  const placementId = str(fd, "placementId");
  const invoiceStatus = str(fd, "invoiceStatus");
  const r3 = str(fd, "retention3m");
  const r6 = str(fd, "retention6m");
  const r12 = str(fd, "retention12m");
  const okVal = (v: string, arr: readonly { value: string }[]) => arr.some((a) => a.value === v);
  if (!okVal(invoiceStatus, INVOICE_STATUSES) || ![r3, r6, r12].every((r) => okVal(r, RETENTION_STATUSES))) {
    return fail("Invalid values.");
  }
  await db
    .update(placements)
    .set({ invoiceStatus, retention3m: r3, retention6m: r6, retention12m: r12 })
    .where(eq(placements.id, placementId));
  await logActivity(actorId, "placement", placementId, "updated", `Invoice ${invoiceStatus}`);
  return ok("Placement updated.");
});

export const addRevenue = staffAction(async (fd) => {
  const stream = str(fd, "stream");
  const amount = int(fd, "amount");
  const when = date(fd, "date") ?? new Date();
  if (!values(REVENUE_STREAMS).includes(stream)) return fail("Choose a revenue stream.");
  if (!amount || amount <= 0) return fail("Enter an amount.", { amount: ["Required"] });
  await db.insert(revenueEntries).values({
    stream,
    amount,
    date: when,
    description: optStr(fd, "description"),
    employerId: optStr(fd, "employerId"),
  });
  return ok("Revenue recorded.");
});

/* ------------------------------------------------------------------ */
/* Partners & enquiries                                                */
/* ------------------------------------------------------------------ */

export const createPartner = staffAction(async (fd) => {
  const name = str(fd, "name");
  const type = str(fd, "type");
  if (!name) return fail("Partner name is required.", { name: ["Required"] });
  if (!values(PARTNER_TYPES).includes(type)) return fail("Choose a partner type.");
  await db.insert(partners).values({
    name,
    type,
    city: optStr(fd, "city"),
    contactName: optStr(fd, "contactName"),
    contactEmail: optStr(fd, "contactEmail"),
    programmes: list(fd, "programmes"),
    mouStatus: str(fd, "mouStatus") || "prospect",
    notes: optStr(fd, "notes"),
  });
  return ok("Partner added.");
});

export const setPartnerStatus = staffAction(async (fd) => {
  const partnerId = str(fd, "partnerId");
  const mouStatus = str(fd, "mouStatus");
  if (!values(MOU_STATUSES).includes(mouStatus)) return fail("Invalid status.");
  await db.update(partners).set({ mouStatus }).where(eq(partners.id, partnerId));
  return ok("Partner status updated.");
});

export const setEnquiryStatus = staffAction(async (fd) => {
  const enquiryId = str(fd, "enquiryId");
  const status = str(fd, "status");
  if (!["new", "in_progress", "closed"].includes(status)) return fail("Invalid status.");
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, enquiryId));
  return ok(status === "closed" ? "Enquiry closed." : "Enquiry updated.");
});
