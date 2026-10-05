import { db } from "@/db";
import { activityLog } from "@/db/schema";

export async function logActivity(
  actorId: string | null | undefined,
  entity: "candidate" | "employer" | "vacancy" | "application" | "placement" | "partner" | "enquiry",
  entityId: string,
  action: string,
  detail?: string,
) {
  await db.insert(activityLog).values({ actorId: actorId ?? null, entity, entityId, action, detail });
}
