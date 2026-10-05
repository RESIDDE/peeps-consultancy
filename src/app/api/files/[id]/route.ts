import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, documents } from "@/db/schema";
import { getSession, STAFF } from "@/lib/permissions";
import type { Role } from "@/db/schema";
import { UPLOAD_DIR } from "@/server/uploads";

/** Serves an uploaded document to staff or to the candidate who owns it. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const [doc] = await db
    .select({ storedName: documents.storedName, filename: documents.filename, mimeType: documents.mimeType, ownerId: candidates.userId })
    .from(documents)
    .innerJoin(candidates, eq(candidates.id, documents.candidateId))
    .where(eq(documents.id, id));
  if (!doc) return new Response("Not found", { status: 404 });
  const role = session.user.role as Role;
  if (!STAFF.includes(role) && !(role === "candidate" && doc.ownerId === session.user.id)) {
    return new Response("Forbidden", { status: 403 });
  }
  const filePath = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, path.basename(doc.storedName));
  try {
    const data = await readFile(filePath);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${doc.filename.replace(/["\\\r\n]/g, "")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File missing", { status: 404 });
  }
}
