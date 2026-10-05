"use server";

import { z } from "zod";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { employerContacts, employers, enquiries, vacancies } from "@/db/schema";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { isSectorCode } from "@/lib/taxonomy";
import { PACKAGES } from "@/lib/pipeline";
import { logActivity } from "../activity";
import { date, fieldErrors, int, list, optStr, str, zEmail, zPhone, zRequired } from "../forms";

const ENQUIRY_KINDS = ["contact", "partner", "career_service", "academy", "professional", "pilot"] as const;

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
  await db.insert(enquiries).values({
    type: d.type,
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    organisation: d.organisation || null,
    subject: d.subject || null,
    message: d.message,
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
  const [vacancy] = await db
    .insert(vacancies)
    .values({
      ref: `VAC-${String(n + 1).padStart(4, "0")}`,
      employerId: employer.id,
      title: d.title,
      sectorCode: d.sectorCode,
      headcount: d.headcount,
      description: d.description || null,
      salaryMin: int(fd, "salaryMin"),
      salaryMax: int(fd, "salaryMax"),
      experienceMin: int(fd, "experienceMin") ?? 0,
      qualifications: optStr(fd, "qualifications"),
      requiredSkills: list(fd, "requiredSkills"),
      city: d.city,
      employmentType: optStr(fd, "employmentType") ?? "full_time",
      deadline: date(fd, "deadline"),
      package: d.package,
      status: "received",
    })
    .returning({ id: vacancies.id, ref: vacancies.ref });

  await db.insert(enquiries).values({
    type: "talent_request",
    name: d.contactName,
    email: d.email,
    phone: d.phone || null,
    organisation: d.company,
    subject: `${d.headcount} × ${d.title} (${vacancy.ref})`,
    message: d.description || "Talent request submitted via website.",
  });
  await logActivity(null, "vacancy", vacancy.id, "received", `Website request from ${d.company}`);

  return ok(`Request ${vacancy.ref} received. A consultant will contact you to begin vacancy analysis.`);
}
