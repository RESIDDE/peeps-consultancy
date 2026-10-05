import { like } from "drizzle-orm";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { nextPepId } from "@/lib/pep-id";

export async function issuePepId(sectorCode: string): Promise<string> {
  const rows = await db
    .select({ pepId: candidates.pepId })
    .from(candidates)
    .where(like(candidates.pepId, `PEP-${sectorCode}-%`));
  return nextPepId(
    sectorCode,
    rows.map((r) => r.pepId),
  );
}
