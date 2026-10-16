import { boolean, customType, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const json = <T>(name: string) => jsonb(name).$type<T>();
const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

/* ------------------------------------------------------------------ */
/* Better Auth                                                         */
/* ------------------------------------------------------------------ */

export const ROLES = ["admin", "recruiter", "employer", "candidate"] as const;
export type Role = (typeof ROLES)[number];

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").$type<Role>().notNull().default("candidate"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ------------------------------------------------------------------ */
/* Talent                                                              */
/* ------------------------------------------------------------------ */

export interface EducationEntry {
  institution: string;
  qualification: string;
  field?: string;
  year?: string;
}

export interface ExperienceEntry {
  employer: string;
  title: string;
  start?: string;
  end?: string;
  summary?: string;
}

export const partners = pgTable("partners", {
  id: id(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  city: text("city"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  programmes: json<string[]>("programmes").notNull().default([]),
  mouStatus: text("mou_status").notNull().default("prospect"),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const candidates = pgTable(
  "candidates",
  {
    id: id(),
    pepId: text("pep_id").notNull().unique(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    city: text("city"),
    state: text("state"),
    sectorCode: text("sector_code").notNull(),
    profession: text("profession").notNull(),
    headline: text("headline"),
    summary: text("summary"),
    yearsExperience: integer("years_experience").notNull().default(0),
    currentEmployer: text("current_employer"),
    employmentStatus: text("employment_status"),
    availability: text("availability"),
    employmentTypes: json<string[]>("employment_types").notNull().default([]),
    preferredLocations: json<string[]>("preferred_locations").notNull().default([]),
    willingToRelocate: boolean("willing_to_relocate").notNull().default(false),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    skills: json<string[]>("skills").notNull().default([]),
    software: json<string[]>("software").notNull().default([]),
    languages: json<string[]>("languages").notNull().default([]),
    education: json<EducationEntry[]>("education").notNull().default([]),
    qualifications: json<string[]>("qualifications").notNull().default([]),
    training: json<string[]>("training").notNull().default([]),
    experience: json<ExperienceEntry[]>("experience").notNull().default([]),
    stage: text("stage").notNull().default("registered"),
    classification: text("classification"),
    classificationRationale: text("classification_rationale"),
    source: text("source").notNull().default("website"),
    partnerId: text("partner_id").references(() => partners.id, { onDelete: "set null" }),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    consentVersion: text("consent_version"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("candidates_sector_idx").on(t.sectorCode), index("candidates_stage_idx").on(t.stage)],
);

export const verificationChecks = pgTable(
  "verification_checks",
  {
    id: id(),
    candidateId: text("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    status: text("status").notNull().default("pending"),
    notes: text("notes"),
    verifiedById: text("verified_by_id").references(() => user.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("checks_candidate_type_idx").on(t.candidateId, t.type)],
);

export const assessments = pgTable("assessments", {
  id: id(),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  kind: text("kind").$type<"technical" | "interview">().notNull(),
  template: text("template").notNull(),
  scores: json<Record<string, number>>("scores").notNull().default({}),
  outcome: text("outcome").$type<"recommend" | "develop" | "not_suitable">().notNull(),
  evidence: text("evidence"),
  assessorId: text("assessor_id").references(() => user.id, { onDelete: "set null" }),
  assessedAt: timestamp("assessed_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

export const documents = pgTable("documents", {
  id: id(),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedById: text("uploaded_by_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

/** File bytes live apart from `documents` so listing documents never loads them. */
export const documentFiles = pgTable("document_files", {
  documentId: text("document_id")
    .primaryKey()
    .references(() => documents.id, { onDelete: "cascade" }),
  data: bytea("data").notNull(),
});

/* ------------------------------------------------------------------ */
/* Employers & vacancies                                               */
/* ------------------------------------------------------------------ */

export const employers = pgTable("employers", {
  id: id(),
  name: text("name").notNull(),
  industry: text("industry"),
  city: text("city"),
  state: text("state"),
  size: text("size"),
  website: text("website"),
  about: text("about"),
  crmStage: text("crm_stage").notNull().default("target"),
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  nextAction: text("next_action"),
  nextActionAt: timestamp("next_action_at", { withTimezone: true }),
  source: text("source"),
  membershipTier: text("membership_tier").notNull().default("none"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const employerContacts = pgTable("employer_contacts", {
  id: id(),
  employerId: text("employer_id")
    .notNull()
    .references(() => employers.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: createdAt(),
});

export const vacancies = pgTable(
  "vacancies",
  {
    id: id(),
    ref: text("ref").notNull().unique(),
    employerId: text("employer_id")
      .notNull()
      .references(() => employers.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sectorCode: text("sector_code").notNull(),
    description: text("description"),
    headcount: integer("headcount").notNull().default(1),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    experienceMin: integer("experience_min").notNull().default(0),
    qualifications: text("qualifications"),
    requiredSkills: json<string[]>("required_skills").notNull().default([]),
    city: text("city"),
    employmentType: text("employment_type").notNull().default("full_time"),
    deadline: timestamp("deadline", { withTimezone: true }),
    package: text("package").notNull().default("professional"),
    status: text("status").notNull().default("received"),
    analysisNotes: text("analysis_notes"),
    published: boolean("published").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("vacancies_employer_idx").on(t.employerId)],
);

export const applications = pgTable(
  "applications",
  {
    id: id(),
    vacancyId: text("vacancy_id")
      .notNull()
      .references(() => vacancies.id, { onDelete: "cascade" }),
    candidateId: text("candidate_id")
      .notNull()
      .references(() => candidates.id, { onDelete: "cascade" }),
    stage: text("stage").notNull().default("sourced"),
    origin: text("origin").$type<"applied" | "sourced">().notNull().default("sourced"),
    matchScore: integer("match_score"),
    shortlistSummary: text("shortlist_summary"),
    employerDecision: text("employer_decision"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("applications_pair_idx").on(t.vacancyId, t.candidateId)],
);

export interface PlacementFeedback {
  suitable: "yes" | "partly" | "no";
  strengths: string;
  weaknesses: string;
  missingSkills: string;
  wouldHireAgain: boolean;
  rating: number;
}

export const placements = pgTable("placements", {
  id: id(),
  applicationId: text("application_id")
    .notNull()
    .unique()
    .references(() => applications.id, { onDelete: "cascade" }),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  employerId: text("employer_id")
    .notNull()
    .references(() => employers.id, { onDelete: "cascade" }),
  vacancyId: text("vacancy_id")
    .notNull()
    .references(() => vacancies.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  annualSalary: integer("annual_salary"),
  fee: integer("fee").notNull().default(0),
  invoiceStatus: text("invoice_status").notNull().default("draft"),
  retention3m: text("retention_3m").notNull().default("pending"),
  retention6m: text("retention_6m").notNull().default("pending"),
  retention12m: text("retention_12m").notNull().default("pending"),
  feedback: json<PlacementFeedback>("feedback"),
  feedbackAt: timestamp("feedback_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

export const enquiries = pgTable("enquiries", {
  id: id(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  organisation: text("organisation"),
  subject: text("subject"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: createdAt(),
});

export const revenueEntries = pgTable("revenue_entries", {
  id: id(),
  stream: text("stream").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  description: text("description"),
  employerId: text("employer_id").references(() => employers.id, { onDelete: "set null" }),
  placementId: text("placement_id").references(() => placements.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const notes = pgTable(
  "notes",
  {
    id: id(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    body: text("body").notNull(),
    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("notes_entity_idx").on(t.entity, t.entityId)],
);

export const activityLog = pgTable(
  "activity_log",
  {
    id: id(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    detail: text("detail"),
    createdAt: createdAt(),
  },
  (t) => [index("activity_entity_idx").on(t.entity, t.entityId)],
);

export type Candidate = typeof candidates.$inferSelect;
export type Employer = typeof employers.$inferSelect;
export type Vacancy = typeof vacancies.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Placement = typeof placements.$inferSelect;
export type Partner = typeof partners.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type VerificationCheck = typeof verificationChecks.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
