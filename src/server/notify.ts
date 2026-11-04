import { COMPANY } from "@/lib/content";
import type { SubmissionField } from "@/db/schema";

/**
 * Where a submitted form turns into an email.
 *
 * The developer brief asks for two on every submission: the entry to PEEPs, and an
 * auto-reply telling the visitor they will be contacted within 24 hours. No mail provider
 * is wired to this project yet — there is no API key, no sender domain and no dependency
 * for it — so nothing is actually sent. Both messages are written to the server log, where
 * they can be read during development, and every submission is saved to the database, so
 * no enquiry is lost while this is a stub.
 *
 * To turn it on: add a provider (Resend, Postmark, SES — whichever PEEPs has an account
 * with), and replace the two `console.info` calls below with its send. Nothing else in the
 * app needs to change; every form already goes through here, via `recordSubmission()` in
 * `./intake.ts`.
 */

export const AUTO_REPLY_SUBJECT = `We have your request — ${COMPANY.short}`;

export const AUTO_REPLY_BODY = (name: string) =>
  `Hello ${name},\n\nThanks — your request has reached ${COMPANY.name}. A consultant will contact you within 24 hours.\n\nIf it is urgent, reply to this email or message us on WhatsApp.\n\n${COMPANY.name}\n${COMPANY.email}`;

export interface EnquiryNotice {
  /** Where it came from, for the subject line: "Payroll quote", "Auto Check booking". */
  kind: string;
  /** The visitor. */
  name: string;
  email: string;
  phone?: string | null;
  organisation?: string | null;
  /** What they wrote in a free-text box, if the form had one. */
  message?: string | null;
  /** The form's answers, label and value, in the order asked. */
  details?: readonly SubmissionField[];
  /** The page the form was filed on. */
  source?: string | null;
  /** Where in the console it landed. */
  consoleUrl?: string | null;
  /**
   * Whether the sender should get the "within 24 hours" auto-reply. False for things that
   * are their own confirmation — a registration that signs them straight in, an
   * application whose progress they can already follow in their portal.
   */
  autoReply?: boolean;
}

/**
 * Send a submission to PEEPs and, unless told otherwise, an auto-reply to the sender.
 * Never throws: a mail failure must not lose a form submission that is already saved.
 */
export async function notifyEnquiry(notice: EnquiryNotice): Promise<void> {
  try {
    const to = COMPANY.email;
    const subject = `${notice.kind} — ${notice.organisation || notice.name}`;
    const body = [
      `${notice.kind} submitted on peepsconsultancy.com`,
      notice.source ? `Form:    ${notice.source}` : null,
      "",
      `Name:    ${notice.name}`,
      `Email:   ${notice.email}`,
      notice.phone ? `Phone:   ${notice.phone}` : null,
      notice.organisation ? `Company: ${notice.organisation}` : null,
      "",
      notice.details?.length ? summarise(notice.details.map((d) => [d.label, d.value])) : null,
      notice.message ? `\nMessage:\n${notice.message}` : null,
      notice.consoleUrl ? `\nOpen in the console: ${notice.consoleUrl}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    // Replace both of these with a real provider call. See the note at the top.
    console.info(`[notify] to ${to} · ${subject}\n${body}`);
    if (notice.autoReply !== false) {
      console.info(`[notify] auto-reply to ${notice.email} · ${AUTO_REPLY_SUBJECT}\n${AUTO_REPLY_BODY(notice.name)}`);
    }
  } catch (e) {
    console.error("[notify] failed", e);
  }
}

/** Render a set of answers as the plain aligned block the email shows. */
export function summarise(rows: readonly [string, string | number | null | undefined][]): string {
  const kept = rows.filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (kept.length === 0) return "";
  const width = Math.max(...kept.map(([label]) => label.length));
  return kept.map(([label, value]) => `${label.padEnd(width)} : ${value}`).join("\n");
}
