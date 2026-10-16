"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { candidates, documentFiles, documents } from "@/db/schema";
import { fail, ok, type ActionState } from "@/lib/action-state";
import { AuthzError, getSession, STAFF } from "@/lib/permissions";
import type { Role } from "@/db/schema";
import { logActivity } from "../activity";
import { str } from "../forms";

const ALLOWED: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/jpeg": ".jpg",
  "image/png": ".png",
};
const MAX_BYTES = 5 * 1024 * 1024;
const KINDS = ["cv", "certificate", "id", "reference", "other"];

export async function uploadDocument(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const session = await getSession();
    if (!session) throw new AuthzError("Please sign in again.");
    const role = session.user.role as Role;
    const candidateId = str(fd, "candidateId");
    const [c] = await db.select({ id: candidates.id, userId: candidates.userId }).from(candidates).where(eq(candidates.id, candidateId));
    if (!c) return fail("Candidate not found.");
    const allowed = STAFF.includes(role) || (role === "candidate" && c.userId === session.user.id);
    if (!allowed) throw new AuthzError("You can't upload documents to this profile.");

    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) return fail("Choose a file to upload.", { file: ["Required"] });
    const ext = ALLOWED[file.type];
    if (!ext) return fail("Upload a PDF, Word document, JPG or PNG.", { file: ["Unsupported file type"] });
    if (file.size > MAX_BYTES) return fail("Files must be 5 MB or smaller.", { file: ["Too large"] });
    const kind = KINDS.includes(str(fd, "kind")) ? str(fd, "kind") : "other";

    const data = Buffer.from(await file.arrayBuffer());
    await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          candidateId,
          kind,
          filename: file.name.slice(0, 200),
          mimeType: file.type,
          size: file.size,
          uploadedById: session.user.id,
        })
        .returning({ id: documents.id });
      await tx.insert(documentFiles).values({ documentId: doc.id, data });
    });
    await logActivity(session.user.id, "candidate", candidateId, "document_uploaded", `${kind}: ${file.name}`);
    revalidatePath("/portal", "layout");
    revalidatePath("/console", "layout");
    return ok("Document uploaded.");
  } catch (e) {
    if (e instanceof AuthzError) return fail(e.message);
    console.error(e);
    return fail("Upload failed. Please try again.");
  }
}
