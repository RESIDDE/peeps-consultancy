import Link from "next/link";
import {
  Briefcase,
  Building2,
  Calculator,
  Car,
  FileCheck2,
  GraduationCap,
  Handshake,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Shield,
  Star,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ActionForm } from "@/components/ui/action-form";
import { AutoSubmitSelect } from "@/components/ui/auto-submit-select";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PortalTag } from "@/components/portal/portal-kit";
import { assignEnquiry, setEnquiryDue, setEnquiryStatus } from "@/server/actions/console";
import { SUBMISSION_STATUSES, submissionMeta, type SubmissionMeta } from "@/lib/submissions";
import type { SubmissionField } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * The console's view of a submitted form.
 *
 * Everything here reads the tag's entry in `lib/submissions.ts`, so a form added to the
 * site is labelled, iconed and linked in the console without a change to this file.
 */

const ICONS: Record<SubmissionMeta["icon"], LucideIcon> = {
  inbox: Inbox,
  briefcase: Briefcase,
  users: Users,
  handshake: Handshake,
  graduation: GraduationCap,
  calculator: Calculator,
  wallet: Wallet,
  shield: Shield,
  car: Car,
  userPlus: UserPlus,
  building: Building2,
  fileCheck: FileCheck2,
  star: Star,
};

export function submissionIcon(type: string): LucideIcon {
  return ICONS[submissionMeta(type).icon];
}

/** Which tags get the gold treatment: the ones with money or a deadline behind them. */
const PROMINENT = new Set(["talent_request", "pilot", "payroll", "auto_check", "compliance"]);

export function SubmissionTag({ type, className }: { type: string; className?: string }) {
  const meta = submissionMeta(type);
  const Icon = ICONS[meta.icon];
  return (
    <PortalTag variant={PROMINENT.has(type) ? "accent" : "default"} className={className}>
      <Icon className="size-3" aria-hidden />
      {meta.label}
    </PortalTag>
  );
}

export function StatusTag({ status }: { status: string }) {
  const meta = SUBMISSION_STATUSES.find((s) => s.value === status);
  return (
    <PortalTag
      variant={status === "new" ? "primary" : status === "closed" ? "muted" : status === "scheduled" ? "solid" : "default"}
    >
      {meta?.label ?? status}
    </PortalTag>
  );
}

/** The form's answers, exactly as the sender filled them in. */
export function SubmissionDetails({
  details,
  message,
  className,
}: {
  details: readonly SubmissionField[];
  message?: string | null;
  className?: string;
}) {
  if (details.length === 0 && !message) return null;
  return (
    <div className={cn("grid gap-4", className)}>
      {details.length > 0 && (
        <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {details.map((d) => (
            <div key={d.label} className="min-w-0 border-b border-border/50 pb-2">
              <dt className="label text-[0.68rem] text-muted-foreground">{d.label}</dt>
              <dd className="mt-0.5 text-sm leading-snug text-foreground">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {message && (
        <div>
          <p className="label mb-1 text-[0.68rem] text-muted-foreground">In their own words</p>
          <p className="whitespace-pre-line rounded-[5px] border border-border bg-muted/20 px-3.5 py-3 text-sm leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

/** Email, phone and WhatsApp, one click each. */
export function SubmissionContact({
  email,
  phone,
  subject,
  className,
}: {
  email: string;
  phone?: string | null;
  subject?: string | null;
  className?: string;
}) {
  const digits = phone?.replace(/[^\d]/g, "");
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px]", className)}>
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${subject ?? "Your enquiry"}`)}`}
        className="inline-flex items-center gap-1.5 text-primary hover:underline"
      >
        <Mail className="size-3.5" />
        {email}
      </a>
      {phone && (
        <a href={`tel:${digits}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
          <Phone className="size-3.5" />
          {phone}
        </a>
      )}
      {digits && digits.length >= 10 && (
        <a
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="size-3.5" />
          WhatsApp
        </a>
      )}
    </div>
  );
}

export function StatusControl({ id, status, className }: { id: string; status: string; className?: string }) {
  return (
    <ActionForm action={setEnquiryStatus} closeOnSuccess={false}>
      <input type="hidden" name="enquiryId" value={id} />
      <AutoSubmitSelect
        name="status"
        defaultValue={status}
        aria-label="Submission status"
        className={cn("h-8 w-36 text-xs", className)}
      >
        {SUBMISSION_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </AutoSubmitSelect>
    </ActionForm>
  );
}

export function AssignControl({
  id,
  assignedToId,
  staff,
}: {
  id: string;
  assignedToId: string | null;
  staff: readonly { id: string; name: string }[];
}) {
  return (
    <ActionForm action={assignEnquiry} closeOnSuccess={false}>
      <input type="hidden" name="enquiryId" value={id} />
      <AutoSubmitSelect name="assignedToId" defaultValue={assignedToId ?? ""} aria-label="Assigned consultant" className="h-8 w-40 text-xs">
        <option value="">Unassigned</option>
        {staff.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </AutoSubmitSelect>
    </ActionForm>
  );
}

/** The date the thing happens: an inspection, a filing, a call. */
export function DueControl({ id, dueAt }: { id: string; dueAt: Date | null }) {
  return (
    <ActionForm action={setEnquiryDue} closeOnSuccess={false} className="flex items-end gap-2">
      <input type="hidden" name="enquiryId" value={id} />
      <label className="grid gap-1">
        <span className="label text-[0.66rem] text-muted-foreground">Scheduled for</span>
        <Input
          type="date"
          name="dueAt"
          defaultValue={dueAt ? dueAt.toISOString().slice(0, 10) : ""}
          className="h-8 w-40 text-xs"
        />
      </label>
      <SubmitButton size="sm" variant="outline" pendingText="Saving…">
        Set
      </SubmitButton>
    </ActionForm>
  );
}

/** Links back to the record the submission created, and to the page it was filed on. */
const ENTITY_HREF: Record<string, { path: string; label: string }> = {
  candidate: { path: "/console/talent/", label: "Open candidate" },
  employer: { path: "/console/employers/", label: "Open employer" },
  vacancy: { path: "/console/vacancies/", label: "Open vacancy" },
  application: { path: "/console/vacancies/", label: "Open pipeline" },
  placement: { path: "/console/placements", label: "Open placements" },
  partner: { path: "/console/partners", label: "Open partners" },
};

export function SubmissionLinks({
  entity,
  entityId,
  source,
  className,
}: {
  entity: string | null;
  entityId: string | null;
  source: string | null;
  className?: string;
}) {
  const target = entity ? ENTITY_HREF[entity] : undefined;
  // Placements and partners are list pages, so they take no id in the path.
  const href = target
    ? target.path.endsWith("/") && entityId
      ? `${target.path}${entityId}`
      : target.path
    : null;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  if (!href && !source) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-4 font-mono text-[11px]", className)}>
      {href && target && (
        <Link href={href} className="text-primary hover:underline">
          {target.label} →
        </Link>
      )}
      {source && (
        <a
          href={source.startsWith("/") ? `${site}${source}` : source}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground"
        >
          See the form they filled ({source})
        </a>
      )}
    </div>
  );
}
