import { eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, documentFiles, documents } from "@/db/schema";
import { getSession, STAFF } from "@/lib/permissions";
import type { Role } from "@/db/schema";

/**
 * Serves an uploaded document to staff or to the candidate who owns it.
 * Shared by the /api/files/[id] route in both the main site and the admin console.
 */
export async function serveDocument(id: string): Promise<Response> {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const [doc] = await db
    .select({ filename: documents.filename, mimeType: documents.mimeType, ownerId: candidates.userId })
    .from(documents)
    .innerJoin(candidates, eq(candidates.id, documents.candidateId))
    .where(eq(documents.id, id));
  if (!doc) return new Response("Not found", { status: 404 });
  const role = session.user.role as Role;
  if (!STAFF.includes(role) && !(role === "candidate" && doc.ownerId === session.user.id)) {
    return new Response("Forbidden", { status: 403 });
  }
  // Bytes are only loaded once access is confirmed.
  const [file] = await db.select({ data: documentFiles.data }).from(documentFiles).where(eq(documentFiles.documentId, id));
  if (!file) return new Response("File missing", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.filename.replace(/["\\\r\n]/g, "")}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
