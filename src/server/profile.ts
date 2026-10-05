import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, type EducationEntry, type ExperienceEntry } from "@/db/schema";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { AVAILABILITY, EMPLOYMENT_STATUS, EMPLOYMENT_TYPES, isSectorCode } from "@/lib/taxonomy";
import { bool, fieldErrors, int, list, optStr, str, zPhone, zRequired } from "./forms";

const schema = z.object({
  firstName: zRequired("First name"),
  lastName: zRequired("Last name"),
  phone: zPhone,
  city: zRequired("City"),
  sectorCode: z.string().refine(isSectorCode, "Choose a talent category"),
  profession: zRequired("Profession"),
  yearsExperience: z.number().int().min(0).max(60),
  availability: z.enum(AVAILABILITY.map((a) => a.value) as [string, ...string[]]).or(z.literal("")),
  employmentStatus: z.enum(EMPLOYMENT_STATUS.map((a) => a.value) as [string, ...string[]]).or(z.literal("")),
  salaryMin: z.number().int().min(0).nullable(),
  salaryMax: z.number().int().min(0).nullable(),
});

/** Rows like `edu_institution_0`, `edu_qualification_0`… → array of entries. */
function rows<T extends object>(fd: FormData, prefix: string, keys: (keyof T & string)[], required: keyof T & string): T[] {
  const out: T[] = [];
  for (let i = 0; i < 10; i++) {
    const row = Object.fromEntries(keys.map((k) => [k, str(fd, `${prefix}_${k}_${i}`)])) as T;
    if ((row as Record<string, string>)[required]) out.push(row);
  }
  return out;
}

/** Shared by the candidate portal and the console's profile editor. */
export async function applyProfileUpdate(candidateId: string, fd: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({
    firstName: str(fd, "firstName"),
    lastName: str(fd, "lastName"),
    phone: str(fd, "phone"),
    city: str(fd, "city"),
    sectorCode: str(fd, "sectorCode"),
    profession: str(fd, "profession"),
    yearsExperience: int(fd, "yearsExperience") ?? 0,
    availability: str(fd, "availability"),
    employmentStatus: str(fd, "employmentStatus"),
    salaryMin: int(fd, "salaryMin"),
    salaryMax: int(fd, "salaryMax"),
  });
  if (!parsed.success) return fail("Please check the highlighted fields.", fieldErrors(parsed.error));
  const d = parsed.data;
  if (d.salaryMin != null && d.salaryMax != null && d.salaryMax < d.salaryMin) {
    return fail("Salary range looks reversed.", { salaryMax: ["Must be at least the minimum"] });
  }
  const employmentTypes = fd
    .getAll("employmentTypes")
    .filter((v): v is string => typeof v === "string" && EMPLOYMENT_TYPES.some((t) => t.value === v));

  await db
    .update(candidates)
    .set({
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone || null,
      city: d.city,
      sectorCode: d.sectorCode,
      profession: d.profession,
      headline: optStr(fd, "headline"),
      summary: optStr(fd, "summary"),
      yearsExperience: d.yearsExperience,
      currentEmployer: optStr(fd, "currentEmployer"),
      availability: d.availability || null,
      employmentStatus: d.employmentStatus || null,
      employmentTypes,
      preferredLocations: list(fd, "preferredLocations"),
      willingToRelocate: bool(fd, "willingToRelocate"),
      salaryMin: d.salaryMin,
      salaryMax: d.salaryMax,
      skills: list(fd, "skills"),
      software: list(fd, "software"),
      languages: list(fd, "languages"),
      qualifications: list(fd, "qualifications"),
      training: list(fd, "training"),
      education: rows<EducationEntry>(fd, "edu", ["institution", "qualification", "field", "year"], "institution"),
      experience: rows<ExperienceEntry>(fd, "exp", ["employer", "title", "start", "end", "summary"], "employer"),
    })
    .where(eq(candidates.id, candidateId));
  return ok("Profile saved.");
}
