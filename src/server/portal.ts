import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { candidates, employerContacts, employers } from "@/db/schema";
import { requireRole } from "@/lib/permissions";

export async function currentCandidate() {
  const session = await requireRole(["candidate"]);
  const [c] = await db.select().from(candidates).where(eq(candidates.userId, session.user.id));
  if (!c) notFound();
  return { session, candidate: c };
}

export async function currentEmployer() {
  const session = await requireRole(["employer"]);
  const [row] = await db
    .select({ employer: employers, contact: employerContacts })
    .from(employerContacts)
    .innerJoin(employers, eq(employers.id, employerContacts.employerId))
    .where(eq(employerContacts.userId, session.user.id));
  if (!row) notFound();
  return { session, ...row };
}
