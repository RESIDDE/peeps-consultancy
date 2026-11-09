/**
 * Sends transactional email through Resend's HTTP API. A plain `fetch`, so there is no SDK
 * to keep current.
 *
 * Configuration:
 * - `RESEND_API_KEY`: required to send anything.
 * - `RESEND_FROM`: the sender. Resend only sends from a domain verified in its dashboard;
 *   until peepsconsultancy.com is verified, leave this unset and the test sender is used,
 *   which Resend will only deliver to the address that owns the Resend account.
 *
 * In development the message is also written to the server log, so the sign-in flow can
 * be tested without a verified domain or an inbox.
 */
const FALLBACK_FROM = "PEEPs <onboarding@resend.dev>";

export interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(email: Email): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(`\n[email] to ${email.to} · ${email.subject}\n${email.text}\n`);
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") console.error("[email] RESEND_API_KEY is not set; nothing was sent.");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM || FALLBACK_FROM, ...email, to: [email.to] }),
  });
  if (!res.ok) {
    // Logged, never thrown: the caller must not reveal to the visitor whether a send
    // failed, or the sign-in form would leak which emails have accounts.
    console.error(`[email] Resend refused the message (${res.status}): ${await res.text()}`);
  }
}

/** The sign-in code email. Plain, so it reads the same in every mail client. */
export function signInCodeEmail(to: string, code: string, minutes: number): Email {
  const text = `Your PEEPs sign-in code is ${code}.\n\nIt expires in ${minutes} minutes. If you didn't try to sign in, you can ignore this email.`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;color:#1a1a1a">
  <p style="margin:0 0 24px;font-size:15px">Your PEEPs sign-in code is:</p>
  <p style="margin:0 0 24px;font-size:34px;font-weight:600;letter-spacing:8px;font-family:ui-monospace,Menlo,monospace">${code}</p>
  <p style="margin:0;font-size:13px;color:#666">It expires in ${minutes} minutes. If you didn't try to sign in, you can ignore this email.</p>
</div>`;
  return { to, subject: `${code} is your PEEPs sign-in code`, text, html };
}
