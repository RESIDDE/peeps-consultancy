"use server";

import { z } from "zod";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { employerContacts, employers, vacancies } from "@/db/schema";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { EMPLOYMENT_TYPES, isSectorCode, labelOf } from "@/lib/taxonomy";
import { PACKAGES } from "@/lib/pipeline";
import { AUTO_CHECK, COMPLIANCE, COMPLIANCE_AREAS, PAYROLL, naira } from "@/lib/services";
import { logActivity } from "../activity";
import { recordSubmission } from "../intake";
import { bool, date, fieldErrors, int, list, optStr, str, zEmail, zPhone, zRequired } from "../forms";

/**
 * The public forms.
 *
 * Every one of them ends at `recordSubmission()`, which saves the submission to the
 * console inbox under its own tag, logs it, and sends the two emails. The actions here
 * are only validation and whatever first-class records the form also creates — an
 * employer and a vacancy for a talent request, nothing for a quote request.
 */

/** Tags that the general-purpose enquiry form is allowed to file under. */
const ENQUIRY_KINDS = [
  "contact",
  "partner",
  "career_service",
  "academy",
  "professional",
  "recruitment",
  "workforce",
  "pilot",
] as const;

const enquirySchema = z.object({
  type: z.enum(ENQUIRY_KINDS),
  name: zRequired("Name"),
  email: zEmail,
  phone: zPhone,
  organisation: z.string().trim().max(160),
  subject: z.string().trim().max(160),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(4000),
});

export async function submitEnquiry(_: ActionState, fd: FormData): Promise<ActionState> {
  // Honeypot: real people never fill the hidden "website" field.
  if (str(fd, "website")) return ok("Thank you, we'll be in touch.");
  const parsed = enquirySchema.safeParse({
    type: str(fd, "type") || "contact",
    name: str(fd, "name"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    organisation: str(fd, "organisation"),
    subject: str(fd, "subject"),
    message: str(fd, "message"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;

  await recordSubmission({
    type: d.type,
    name: d.name,
    email: d.email,
    phone: d.phone,
    organisation: d.organisation,
    subject: d.subject || null,
    message: d.message,
    source: optStr(fd, "source"),
  });

  return ok("Thank you. A PEEPs consultant will respond within one working day.");
}

const talentSchema = z.object({
  company: zRequired("Company name"),
  industry: z.string().trim(),
  city: zRequired("Location"),
  contactName: zRequired("Contact name"),
  contactRole: z.string().trim(),
  email: zEmail,
  phone: zPhone,
  title: zRequired("Position"),
  sectorCode: z.string().refine(isSectorCode, "Choose a talent category"),
  headcount: z.number().int().min(1, "At least 1").max(500),
  package: z.enum(PACKAGES.map((p) => p.value) as [string, ...string[]]),
  description: z.string().trim().max(6000),
});

export async function requestTalent(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "website")) return ok("Thank you.");
  const parsed = talentSchema.safeParse({
    company: str(fd, "company"),
    industry: str(fd, "industry"),
    city: str(fd, "city"),
    contactName: str(fd, "contactName"),
    contactRole: str(fd, "contactRole"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    title: str(fd, "title"),
    sectorCode: str(fd, "sectorCode"),
    headcount: int(fd, "headcount") ?? 1,
    package: str(fd, "package") || "professional",
    description: str(fd, "description"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;

  const [employer] = await db
    .insert(employers)
    .values({
      name: d.company,
      industry: d.industry || null,
      city: d.city,
      crmStage: "discovery",
      source: "website",
      nextAction: "Call to run vacancy analysis",
      nextActionAt: new Date(Date.now() + 86_400_000),
    })
    .returning({ id: employers.id });

  await db.insert(employerContacts).values({
    employerId: employer.id,
    name: d.contactName,
    role: d.contactRole || null,
    email: d.email,
    phone: d.phone || null,
    isPrimary: true,
  });

  const [{ n }] = await db.select({ n: count() }).from(vacancies);
  const deadline = date(fd, "deadline");
  const salaryMin = int(fd, "salaryMin");
  const salaryMax = int(fd, "salaryMax");
  const experienceMin = int(fd, "experienceMin") ?? 0;
  const skills = list(fd, "requiredSkills");
  const employmentType = optStr(fd, "employmentType") ?? "full_time";
  const qualifications = optStr(fd, "qualifications");

  const [vacancy] = await db
    .insert(vacancies)
    .values({
      ref: `VAC-${String(n + 1).padStart(4, "0")}`,
      employerId: employer.id,
      title: d.title,
      sectorCode: d.sectorCode,
      headcount: d.headcount,
      description: d.description || null,
      salaryMin,
      salaryMax,
      experienceMin,
      qualifications,
      requiredSkills: skills,
      city: d.city,
      employmentType,
      deadline,
      package: d.package,
      status: "received",
    })
    .returning({ id: vacancies.id, ref: vacancies.ref });

  const money = (v: number | null) => (v === null ? null : naira(v));

  await recordSubmission({
    type: "talent_request",
    name: d.contactName,
    email: d.email,
    phone: d.phone,
    organisation: d.company,
    subject: `${d.headcount} × ${d.title} (${vacancy.ref})`,
    message: d.description || null,
    source: optStr(fd, "source") ?? "/employers#request",
    link: { entity: "vacancy", id: vacancy.id },
    dueAt: deadline,
    details: [
      ["Vacancy", vacancy.ref],
      ["Position", d.title],
      ["Headcount", d.headcount],
      ["Service", PACKAGES.find((p) => p.value === d.package)?.label ?? d.package],
      ["Industry", d.industry],
      ["Location", d.city],
      ["Employment type", labelOf(EMPLOYMENT_TYPES, employmentType)],
      ["Salary", salaryMin || salaryMax ? [money(salaryMin), money(salaryMax)].filter(Boolean).join(" – ") : null],
      ["Minimum experience", experienceMin ? `${experienceMin} years` : null],
      ["Key skills", skills.join(", ")],
      ["Qualifications", qualifications],
      ["Hiring deadline", deadline ? deadline.toISOString().slice(0, 10) : null],
      ["Contact role", d.contactRole],
    ],
  });
  await logActivity(null, "vacancy", vacancy.id, "received", `Website request from ${d.company}`);

  return ok(`Request ${vacancy.ref} received. A consultant will contact you to begin vacancy analysis.`);
}

/* ------------------------------------------------------------------ */
/* Payroll, Compliance and Auto Check                                  */
/*                                                                     */
/* The three services added by the November 2026 brief. Each answer is  */
/* kept as its own labelled field, so the console shows them as a table */
/* and the service desk can sort and schedule on them, rather than      */
/* parsing a paragraph.                                                 */
/* ------------------------------------------------------------------ */

/** A value that has to be one of a list the content file owns. */
const oneOf = (options: readonly string[], label: string) =>
  z
    .string()
    .trim()
    .refine((v) => options.includes(v), `Choose ${label}`);

const zConsent = z.literal(true, { message: "Please agree before submitting" });

/** Every one of these forms asks the same four things first. */
const contactShape = {
  company: zRequired("Company name"),
  contactName: zRequired("Contact person"),
  email: zEmail,
  phone: zPhone.refine((v) => v !== "", "Phone number is required"),
};

const payrollSchema = z.object({
  ...contactShape,
  employees: oneOf(PAYROLL.form.employeeBands, "a number of employees"),
  payFrequency: oneOf(PAYROLL.form.payFrequencies, "a pay frequency"),
  currentMethod: oneOf(PAYROLL.form.currentMethods, "your current payroll method"),
  message: z.string().trim().max(4000),
  consent: zConsent,
});

export async function requestPayrollQuote(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "website")) return ok("Thank you, we'll be in touch.");
  const parsed = payrollSchema.safeParse({
    company: str(fd, "company"),
    contactName: str(fd, "contactName"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    employees: str(fd, "employees"),
    payFrequency: str(fd, "payFrequency"),
    currentMethod: str(fd, "currentMethod"),
    message: str(fd, "message"),
    consent: bool(fd, "consent"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  // Checkboxes: whatever of the published list came back, in the published order.
  const services = fd.getAll("services").filter((v): v is string => typeof v === "string");
  const wanted = PAYROLL.form.services.filter((s) => services.includes(s));

  await recordSubmission({
    type: "payroll",
    name: d.contactName,
    email: d.email,
    phone: d.phone,
    organisation: d.company,
    subject: `Payroll quote — ${d.employees} employees, ${d.payFrequency.toLowerCase()}`,
    message: d.message || null,
    source: "/payroll#quote",
    consent: true,
    details: [
      ["Employees", d.employees],
      ["Pay frequency", d.payFrequency],
      ["Services needed", wanted.length ? wanted.join(", ") : "Not specified"],
      ["Current method", d.currentMethod],
    ],
  });

  return ok("Thank you. We'll send your payroll quote within 24 hours.");
}

const AREA_SLUGS = COMPLIANCE_AREAS.map((a) => a.slug) as readonly string[];

const complianceSchema = z.object({
  ...contactShape,
  rcNumber: z.string().trim().max(40),
  industry: oneOf(COMPLIANCE.form.industries, "an industry"),
  areas: z.array(z.string()).min(1, "Choose at least one compliance area"),
  urgency: oneOf(COMPLIANCE.form.urgency, "a timeframe"),
  message: z.string().trim().max(4000),
  consent: zConsent,
});

export async function requestComplianceCheck(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "website")) return ok("Thank you, we'll be in touch.");
  const chosen = fd.getAll("areas").filter((v): v is string => typeof v === "string");
  const parsed = complianceSchema.safeParse({
    company: str(fd, "company"),
    contactName: str(fd, "contactName"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    rcNumber: str(fd, "rcNumber"),
    industry: str(fd, "industry"),
    areas: chosen.filter((s) => AREA_SLUGS.includes(s)),
    urgency: str(fd, "urgency"),
    message: str(fd, "message"),
    consent: bool(fd, "consent"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const names = COMPLIANCE_AREAS.filter((a) => d.areas.includes(a.slug)).map((a) => a.name);

  await recordSubmission({
    type: "compliance",
    name: d.contactName,
    email: d.email,
    phone: d.phone,
    organisation: d.company,
    subject: `Compliance check — ${names.join(", ")} (${d.urgency.toLowerCase()})`,
    message: d.message || null,
    source: "/compliance#check",
    consent: true,
    // "This week" is a deadline the desk has to see; "just planning" is not.
    dueAt: d.urgency === COMPLIANCE.form.urgency[0] ? new Date(Date.now() + 7 * 86_400_000) : null,
    details: [
      ["Industry", d.industry],
      ["RC number", d.rcNumber || "Not given"],
      ["Areas needed", names.join(", ")],
      ["Timeframe", d.urgency],
    ],
  });

  return ok("Thank you. A compliance consultant will respond within 24 hours.");
}

const PACKAGE_SLUGS = AUTO_CHECK.packages.map((p) => p.slug) as readonly string[];
const THIS_YEAR = new Date().getFullYear();

const autoCheckSchema = z.object({
  fullName: zRequired("Full name"),
  email: zEmail,
  phone: zPhone.refine((v) => v !== "", "WhatsApp number is required"),
  make: zRequired("Vehicle make"),
  model: zRequired("Vehicle model"),
  year: z.number().int().min(1960, "Check the year").max(THIS_YEAR + 1, "Check the year"),
  vin: z.string().trim().max(32),
  askingPrice: z.number().int().positive().nullable(),
  dealership: zRequired("Dealership name"),
  state: oneOf(AUTO_CHECK.form.states, "a state"),
  area: z.string().trim().max(160),
  preferredDate: z.date({ message: "Choose a preferred date" }),
  timeSlot: oneOf(AUTO_CHECK.form.timeSlots, "a time slot"),
  package: oneOf(PACKAGE_SLUGS, "an inspection package"),
  notes: z.string().trim().max(4000),
  consent: zConsent,
});

export async function bookAutoCheck(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "website")) return ok("Thank you, we'll be in touch.");
  const parsed = autoCheckSchema.safeParse({
    fullName: str(fd, "fullName"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    make: str(fd, "make"),
    model: str(fd, "model"),
    year: int(fd, "year") ?? 0,
    vin: str(fd, "vin"),
    askingPrice: int(fd, "askingPrice"),
    dealership: str(fd, "dealership"),
    state: str(fd, "state"),
    area: str(fd, "area"),
    preferredDate: date(fd, "preferredDate") ?? undefined,
    timeSlot: str(fd, "timeSlot"),
    package: str(fd, "package"),
    notes: str(fd, "notes"),
    consent: bool(fd, "consent"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  const pkg = AUTO_CHECK.packages.find((p) => p.slug === d.package)!;
  const when = d.preferredDate.toISOString().slice(0, 10);

  await recordSubmission({
    type: "auto_check",
    name: d.fullName,
    email: d.email,
    phone: d.phone,
    organisation: d.dealership,
    subject: `${pkg.name} — ${d.make} ${d.model} at ${d.dealership} on ${when}`,
    message: d.notes || null,
    source: "/auto-check#book",
    consent: true,
    // The date the mechanic has to be somewhere: the service desk orders on this.
    dueAt: d.preferredDate,
    details: [
      ["Package", `${pkg.name} — ${naira(pkg.price)}`],
      ["Vehicle", `${d.make} ${d.model} (${d.year})`],
      ["VIN / chassis", d.vin || "Not given"],
      ["Asking price", d.askingPrice === null ? "Not given" : naira(d.askingPrice)],
      ["Dealership", d.dealership],
      ["State", d.state],
      ["Area", d.area],
      ["Preferred date", when],
      ["Time slot", d.timeSlot],
      ["Payment", AUTO_CHECK.form.onlinePayment ? "Chosen at booking" : "Pay on inspection"],
    ],
  });

  return ok(`Booking received. We'll confirm your ${pkg.name} inspection on WhatsApp within 24 hours.`);
}
