import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { enquiries, type SubmissionField } from "@/db/schema";
import { CONSENT_VERSION } from "@/lib/consent";
import { submissionMeta } from "@/lib/submissions";
import { logActivity } from "./activity";
import { notifyEnquiry } from "./notify";

/**
 * The one door every form on the site comes through.
 *
 * Whatever the form — a payroll quote on the marketing site, a job application in the
 * candidate portal, a registration — calling `recordSubmission()` does four things:
 *
 *   1. saves it to `enquiries`, tagged with its form's `type`, so staff see it in the
 *      console inbox and nothing a visitor filled in is lost;
 *   2. writes an entry to the activity log, so the audit trail shows it arriving;
 *   3. emails PEEPs and (unless the form is its own confirmation) auto-replies to the
 *      sender, via `notify.ts`;
 *   4. revalidates the console so an open inbox picks it up on its next render.
 *
 * Adding a form means adding its tag to `lib/submissions.ts` and calling this. There is no
 * second path into the inbox, which is what makes "the admin receives every form" true
 * rather than a thing we remember to do.
 */

export interface SubmissionInput {
  /** A tag from `lib/submissions.ts`. */
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  organisation?: string | null;
  /** The one-line summary the inbox lists. */
  subject?: string | null;
  /** Free prose the sender typed, kept apart from the structured answers. */
  message?: string | null;
  /** The form's answers, in the order it asked them. Empty values are dropped. */
  details?: readonly (readonly [string, string | number | null | undefined])[];
  /** The page or portal it was filed on, e.g. "/payroll#quote". */
  source?: string | null;
  /** The record this submission created or concerns, for a link straight to it. */
  link?: { entity: "candidate" | "employer" | "vacancy" | "application" | "placement" | "partner"; id: string } | null;
  /** When what was asked for falls due: an inspection date, a filing deadline. */
  dueAt?: Date | null;
  /** True when the form carried a consent tick, for the NDPA 2023 record. */
  consent?: boolean;
  /** Who filed it, when they were signed in. */
  actorId?: string | null;
  /** Overrides the status the tag would arrive at. */
  status?: string;
}

/** Drop the blanks and coerce to strings, so the console never shows an empty row. */
function toFields(details: SubmissionInput["details"]): SubmissionField[] {
  if (!details) return [];
  return details
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([label, value]) => ({ label, value: String(value) }));
}

export interface RecordedSubmission {
  id: string;
  /** The tag's human label, for the action's reply to the sender. */
  label: string;
}

export async function recordSubmission(input: SubmissionInput): Promise<RecordedSubmission> {
  const meta = submissionMeta(input.type);
  const details = toFields(input.details);
  const now = new Date();

  const [row] = await db
    .insert(enquiries)
    .values({
      type: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      organisation: input.organisation || null,
      subject: input.subject || null,
      message: input.message || null,
      details,
      source: input.source ?? meta.href,
      entity: input.link?.entity ?? null,
      entityId: input.link?.id ?? null,
      dueAt: input.dueAt ?? null,
      // A tag that owes a reply arrives as "new" and counts on the sidebar badge; one that
      // does not arrives as "logged", recorded and filterable but not demanding an answer.
      status: input.status ?? (meta.reply ? "new" : "logged"),
      consentAt: input.consent ? now : null,
      consentVersion: input.consent ? CONSENT_VERSION : null,
    })
    .returning({ id: enquiries.id });

  // Best-effort from here: the submission is saved, and neither the log nor the mail is
  // worth failing it for.
  await logActivity(
    input.actorId ?? null,
    "enquiry",
    row.id,
    "received",
    `${meta.label}: ${input.subject || input.organisation || input.name}`,
  ).catch((e) => console.error("[intake] activity log failed", e));

  await notifyEnquiry({
    kind: meta.label,
    name: input.name,
    email: input.email,
    phone: input.phone,
    organisation: input.organisation,
    message: input.message,
    details,
    source: input.source ?? meta.href,
    consoleUrl: `/console/enquiries/${row.id}`,
    autoReply: meta.reply,
  });

  // The console is a separate Next app in ./admin, so this only reaches an inbox rendered
  // by this one. The admin app reads the table on every request, so it needs no nudge.
  revalidatePath("/console", "layout");

  return { id: row.id, label: meta.label };
}
