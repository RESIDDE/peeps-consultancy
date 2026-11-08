import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, enquiries, notes, user } from "@/db/schema";
import { PageHeader } from "@/components/peeps/blocks";
import { PortalPanel, PortalTag } from "@/components/portal/portal-kit";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  AssignControl,
  DueControl,
  StatusControl,
  StatusTag,
  SubmissionContact,
  SubmissionDetails,
  SubmissionLinks,
  SubmissionTag,
} from "@/components/console/submissions";
import { addNote } from "@/server/actions/console";
import { submissionMeta, tabOf } from "@/lib/submissions";
import { STAFF } from "@/lib/permissions";
import { formatDate, formatDateTime, humanize } from "@/lib/format";

/**
 * One submitted form, in full: every answer the sender gave, who it is with, what has
 * happened to it, and the consultants' notes.
 */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e] = await db.select({ subject: enquiries.subject, type: enquiries.type }).from(enquiries).where(eq(enquiries.id, id));
  return { title: e ? (e.subject ?? submissionMeta(e.type).label) : "Submission" };
}

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [row] = await db
    .select({
      e: enquiries,
      assignedTo: user.name,
    })
    .from(enquiries)
    .leftJoin(user, eq(user.id, enquiries.assignedToId))
    .where(eq(enquiries.id, id));
  if (!row) notFound();
  const e = row.e;
  const meta = submissionMeta(e.type);

  const [staff, threadNotes, history] = await Promise.all([
    db.select({ id: user.id, name: user.name }).from(user).where(inArray(user.role, STAFF)).orderBy(user.name),
    db
      .select({ id: notes.id, body: notes.body, createdAt: notes.createdAt, author: user.name })
      .from(notes)
      .leftJoin(user, eq(user.id, notes.authorId))
      .where(and(eq(notes.entity, "enquiry"), eq(notes.entityId, id)))
      .orderBy(desc(notes.createdAt)),
    db
      .select({ id: activityLog.id, action: activityLog.action, detail: activityLog.detail, createdAt: activityLog.createdAt, actor: user.name })
      .from(activityLog)
      .leftJoin(user, eq(user.id, activityLog.actorId))
      .where(and(eq(activityLog.entity, "enquiry"), eq(activityLog.entityId, id)))
      .orderBy(desc(activityLog.createdAt)),
  ]);

  return (
    <>
      <PageHeader
        back={{ href: `/console/enquiries${tabOf(e.type) ? `?tab=${tabOf(e.type)!.key}` : ""}`, label: tabOf(e.type)?.label ?? "Forms" }}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <SubmissionTag type={e.type} />
            <StatusTag status={e.status} />
            <span className="font-mono text-[11px] text-muted-foreground">{formatDateTime(e.createdAt)}</span>
          </span>
        }
        title={e.subject ?? meta.label}
        description={meta.note}
      />

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="grid gap-8">
          <PortalPanel label="AS THEY FILLED IT IN" title="The submission" description="Every answer, in the order the form asked for it.">
            <SubmissionDetails details={e.details} message={e.message} />
            {e.details.length === 0 && !e.message && (
              <p className="text-sm text-muted-foreground">This form carried no structured answers.</p>
            )}
          </PortalPanel>

          <PortalPanel label="CONSULTANT FILE" title="Notes" description="Internal. The sender never sees these.">
            <ActionForm action={addNote} resetOnSuccess className="grid gap-3">
              <input type="hidden" name="entity" value="enquiry" />
              <input type="hidden" name="entityId" value={id} />
              <Textarea
                name="body"
                rows={3}
                required
                aria-label="Note"
                placeholder="What you agreed on the call, what you quoted, what is outstanding…"
              />
              <FormMessage />
              <div className="flex justify-end">
                <SubmitButton size="sm" pendingText="Saving…">
                  Add note
                </SubmitButton>
              </div>
            </ActionForm>

            {threadNotes.length > 0 && (
              <ul className="mt-6 divide-y divide-border border-t border-border">
                {threadNotes.map((n) => (
                  <li key={n.id} className="py-3.5">
                    <p className="whitespace-pre-line text-sm leading-relaxed">{n.body}</p>
                    <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                      {n.author ?? "PEEPs"} · {formatDateTime(n.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </PortalPanel>
        </div>

        <div className="grid gap-8">
          <PortalPanel label="WHO IT IS WITH" title="Handling">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <span className="label text-[0.66rem] text-muted-foreground">Status</span>
                <StatusControl id={e.id} status={e.status} className="w-full" />
              </div>
              <div className="grid gap-2">
                <span className="label text-[0.66rem] text-muted-foreground">Consultant</span>
                <AssignControl id={e.id} assignedToId={e.assignedToId} staff={staff} />
                {row.assignedTo && <p className="font-mono text-[11px] text-muted-foreground">Currently {row.assignedTo}.</p>}
              </div>
              <DueControl id={e.id} dueAt={e.dueAt} />
              {e.handledAt && (
                <p className="border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground">
                  Picked up {formatDateTime(e.handledAt)}
                  {" · "}
                  {Math.max(0, Math.round(((e.handledAt.getTime() - e.createdAt.getTime()) / 3_600_000) * 10) / 10)}h after it
                  arrived
                </p>
              )}
            </div>
          </PortalPanel>

          <PortalPanel label="CONTACT" title="Reach them">
            <div className="grid gap-4">
              <div>
                <p className="font-display text-base">{e.name}</p>
                {e.organisation && <p className="text-sm text-muted-foreground">{e.organisation}</p>}
              </div>
              <SubmissionContact email={e.email} phone={e.phone} subject={e.subject} />
              <SubmissionLinks entity={e.entity} entityId={e.entityId} source={e.source} className="border-t border-border/60 pt-3" />
              {e.consentAt && (
                <p className="border-t border-border/60 pt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
                  NDPA 2023: consent given {formatDate(e.consentAt)}
                  {e.consentVersion ? ` (${e.consentVersion})` : ""}. They may withdraw it at any time.
                </p>
              )}
            </div>
          </PortalPanel>

          <PortalPanel label="AUDIT TRAIL" title="History" bodyClassName="p-0">
            <ul className="divide-y divide-border">
              {history.map((h) => (
                <li key={h.id} className="px-5 py-3">
                  <p className="text-xs">
                    <span className="font-medium">{humanize(h.action)}</span>
                    {h.detail && <span className="text-muted-foreground"> · {h.detail}</span>}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {h.actor ?? "Website"} · {formatDateTime(h.createdAt)}
                  </p>
                </li>
              ))}
              {history.length === 0 && (
                <li className="px-5 py-6 text-center font-mono text-[11px] text-muted-foreground">Nothing recorded yet.</li>
              )}
            </ul>
          </PortalPanel>

          <div className="rounded-[7px] border border-border bg-card/60 p-5">
            <p className="label mb-2 text-[0.66rem] text-muted-foreground">Where this came from</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{meta.note}</p>
            <p className="mt-3">
              <PortalTag variant="muted">{tabOf(e.type)?.label ?? "Other"}</PortalTag>
            </p>
            <Link href={`/console/enquiries?show=all${tabOf(e.type) ? `&tab=${tabOf(e.type)!.key}` : ""}`} className="mt-4 inline-block font-mono text-[11px] text-primary hover:underline">
              All {tabOf(e.type)?.label ?? "similar"} forms →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
