import { desc, eq, and } from "drizzle-orm";
import { FileText, Upload } from "lucide-react";
import { db } from "@/db";
import { activityLog, documents, notes, user } from "@/db/schema";
import { Panel } from "@/components/peeps/blocks";
import { ActionForm } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { addNote } from "@/server/actions/console";
import { uploadDocument } from "@/server/actions/documents";
import { formatDate, formatDateTime, humanize } from "@/lib/format";

export async function NotesPanel({ entity, entityId }: { entity: "candidate" | "employer" | "vacancy"; entityId: string }) {
  const rows = await db
    .select({ id: notes.id, body: notes.body, createdAt: notes.createdAt, author: user.name })
    .from(notes)
    .leftJoin(user, eq(user.id, notes.authorId))
    .where(and(eq(notes.entity, entity), eq(notes.entityId, entityId)))
    .orderBy(desc(notes.createdAt));
  return (
    <Panel title="Notes" description="Internal: never shown to candidates or employers">
      <ActionForm action={addNote} resetOnSuccess className="grid gap-2">
        <input type="hidden" name="entity" value={entity} />
        <input type="hidden" name="entityId" value={entityId} />
        <Textarea name="body" rows={2} placeholder="Add a note…" aria-label="New note" className="min-h-16" />
        <div>
          <SubmitButton size="sm" variant="outline" pendingText="Adding…">Add note</SubmitButton>
        </div>
      </ActionForm>
      <ul className="mt-4 grid gap-3">
        {rows.map((n) => (
          <li key={n.id} className="rounded-xl bg-muted/50 p-3 text-sm">
            <p className="whitespace-pre-line">{n.body}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {n.author ?? "Unknown"} · {formatDateTime(n.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export async function DocumentsPanel({ candidateId, canUpload = true }: { candidateId: string; canUpload?: boolean }) {
  const rows = await db.select().from(documents).where(eq(documents.candidateId, candidateId)).orderBy(desc(documents.createdAt));
  return (
    <Panel title="Documents" description="CVs, certificates and ID. PDF, Word, JPG or PNG up to 5 MB">
      {rows.length > 0 ? (
        <ul className="mb-4 grid gap-2">
          {rows.map((d) => (
            <li key={d.id}>
              <a href={`/api/files/${d.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border p-3 text-sm hover:bg-muted/50">
                <FileText className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{d.filename}</span>
                  <span className="text-xs text-muted-foreground">
                    {humanize(d.kind)} · {Math.max(1, Math.round(d.size / 1024))} KB · {formatDate(d.createdAt)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">No documents uploaded yet.</p>
      )}
      {canUpload && (
        <ActionForm action={uploadDocument} resetOnSuccess className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="candidateId" value={candidateId} />
          <Field label="File" name="file" className="sm:col-span-2">
            <Input id={`file-${candidateId}`} name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required className="py-1.5" />
          </Field>
          <Select name="kind" defaultValue="cv" aria-label="Document type">
            <option value="cv">CV</option>
            <option value="certificate">Certificate</option>
            <option value="id">Identity document</option>
            <option value="reference">Reference letter</option>
            <option value="other">Other</option>
          </Select>
          <SubmitButton variant="outline" pendingText="Uploading…">
            <Upload /> Upload
          </SubmitButton>
        </ActionForm>
      )}
    </Panel>
  );
}

export async function TimelinePanel({ entity, entityId }: { entity: string; entityId: string }) {
  const rows = await db
    .select({ id: activityLog.id, action: activityLog.action, detail: activityLog.detail, createdAt: activityLog.createdAt, actor: user.name })
    .from(activityLog)
    .leftJoin(user, eq(user.id, activityLog.actorId))
    .where(and(eq(activityLog.entity, entity), eq(activityLog.entityId, entityId)))
    .orderBy(desc(activityLog.createdAt))
    .limit(30);
  if (rows.length === 0) return null;
  return (
    <Panel title="Timeline">
      <ol className="grid gap-3 border-l pl-4">
        {rows.map((r) => (
          <li key={r.id} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-primary" />
            <p>
              <span className="font-medium">{humanize(r.action)}</span>
              {r.detail && <span className="text-muted-foreground"> · {r.detail}</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.actor ?? "System"} · {formatDateTime(r.createdAt)}
            </p>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
