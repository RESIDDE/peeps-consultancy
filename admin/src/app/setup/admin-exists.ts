import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

/** Whether the console already has an admin. The setup page only works while it doesn't. */
export async function adminExists(): Promise<boolean> {
  const [{ n }] = await db.select({ n: count() }).from(user).where(eq(user.role, "admin"));
  return n > 0;
}
