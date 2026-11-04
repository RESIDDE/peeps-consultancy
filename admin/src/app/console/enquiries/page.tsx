import Link from "next/link";
import { and, count, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { Inbox, Search } from "lucide-react";
import { db } from "@/db";
import { enquiries, user } from "@/db/schema";
import { EmptyState } from "@/components/peeps/blocks";
import { PortalPageHeader, PortalPanel, PortalStatCard } from "@/components/portal/portal-kit";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  AssignControl,
  StatusControl,
  StatusTag,
  SubmissionContact,
  SubmissionDetails,
  SubmissionLinks,
  SubmissionTag,
  submissionIcon,
} from "@/components/console/submissions";
import { inboxCounts } from "@/server/metrics";
import {
  OPEN_STATUSES,
  SUBMISSIONS,
  SUBMISSION_GROUPS,
  SUBMISSION_STATUSES,
  submissionMeta,
  typesInGroup,
} from "@/lib/submissions";
import { STAFF } from "@/lib/permissions";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inbox" };

/**
 * Every form filed anywhere on the PEEPs site, in one place.
 *
 * The filters are built from the form registry in `lib/submissions.ts`, so a form added
 * to the site appears here — with its own chip, count and badge — without this page
 * changing. Nothing is dropped: the "Everything" view really is everything.
 */

interface Params {
  status?: string;
  type?: string;
  group?: string;
  q?: string;
  page?: string;
}

/**
 * How many submissions a page shows.
 *
 * This table now holds every form filed on the site, including the high-volume ones —
 * job applications, profile revisions, registrations — so the page filters and pages in
 * SQL rather than reading the table and sifting it in memory.
 */
const PER_PAGE = 50;

/** The named views along the top, before the per-form chips. */
const VIEWS = [
  { key: "needs-action", label: "Needs action", note: "New, in progress and scheduled" },
  { key: "new", label: "New", note: "Nobody has picked these up" },
  { key: "scheduled", label: "Scheduled", note: "Booked in for a date" },
  { key: "closed", label: "Closed", note: "Answered or resolved" },
  { key: "all", label: "Everything", note: "Every form ever filed, including logged activity" },
];

/** The status part of the query for a named view. */
function viewFilter(view: string): SQL | undefined {
  if (view === "all") return undefined;
  if (view === "needs-action") return inArray(enquiries.status, [...OPEN_STATUSES]);
  return eq(enquiries.status, view);
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { status: view = "needs-action", type, group, q = "", page: pageParam } = await searchParams;
  const page = Math.max(0, Number(pageParam) || 0);

  // Only a group the registry actually knows filters anything; a junk value is ignored.
  const knownGroup = SUBMISSION_GROUPS.find((g) => g.value === group)?.value;
  const groupTypes = knownGroup ? typesInGroup(knownGroup) : null;
  const needle = q.trim();

  const where = and(
    viewFilter(view),
    type ? eq(enquiries.type, type) : undefined,
    groupTypes ? inArray(enquiries.type, groupTypes) : undefined,
    // Searches the answers as well as the contact fields: `details` is cast to text so a
    // value a visitor typed into any field on any form is findable.
    needle
      ? or(
          ilike(enquiries.name, `%${needle}%`),
          ilike(enquiries.email, `%${needle}%`),
          ilike(enquiries.organisation, `%${needle}%`),
          ilike(enquiries.subject, `%${needle}%`),
          ilike(enquiries.message, `%${needle}%`),
          ilike(enquiries.phone, `%${needle}%`),
          sql`${enquiries.details}::text ilike ${`%${needle}%`}`,
        )
      : undefined,
  );

  const [rows, [{ total }], staff, counts] = await Promise.all([
    db
      .select()
      .from(enquiries)
      .where(where)
      .orderBy(desc(enquiries.createdAt))
      .limit(PER_PAGE)
      .offset(page * PER_PAGE),
    db.select({ total: count() }).from(enquiries).where(where),
    db.select({ id: user.id, name: user.name }).from(user).where(inArray(user.role, STAFF)).orderBy(user.name),
    inboxCounts(),
  ]);

  /** Keeps the other filters when one of them changes, and goes back to the first page. */
  const url = (next: Partial<Params>) => {
    const merged: Params = { status: view, type, group, q, page: undefined, ...next };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, String(v));
    return `/console/enquiries${sp.size ? `?${sp}` : ""}`;
  };

  /** Only show a chip for a form that has ever been filed, so the row stays readable. */
  const chips = SUBMISSIONS.filter((s) => (counts.byType[s.value]?.total ?? 0) > 0);

  return (
    <>
      <PortalPageHeader
        label="INBOUND DESK // EVERY FORM FILED ON THE SITE"
        title="Inbox."
        lede="Talent requests, payroll quotes, compliance checks, Auto Check bookings, partnerships, career services, registrations and portal activity — every form on the PEEPs site lands here, tagged with the form it came from. Filter by form or search the answers."
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStatCard
          index={1}
          label="Awaiting a reply"
          value={String(counts.unanswered).padStart(2, "0")}
          note="Submissions still at New that owe somebody an answer."
          guide="The SLA on every public form is 24 hours. Assign one to yourself to move it to In progress."
          tone={counts.unanswered > 0 ? "accent" : "default"}
          href={url({ status: "new", type: undefined, group: undefined })}
          actionLabel="Open the new ones"
        />
        <PortalStatCard index={2} label="Open" value={String(counts.open).padStart(2, "0")} note="New, in progress and scheduled together." tone="default" />
        <PortalStatCard index={3} label="Received this month" value={String(counts.thisMonth).padStart(2, "0")} note={`${counts.total} since launch, across every form.`} tone="default" />
        <PortalStatCard
          index={4}
          label="Median pick-up"
          value={counts.medianResponseHours != null ? `${counts.medianResponseHours}h` : "—"}
          note="Arrival to a consultant picking it up, last 50."
          guide="Measured from the submission timestamp to the first status change. Target is under 24 hours."
          tone="default"
        />
      </div>

      {/* Views */}
      <nav className="mb-3 flex flex-wrap gap-1.5" aria-label="Status filter">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={url({ status: v.key })}
            title={v.note}
            aria-current={view === v.key ? "page" : undefined}
            className={cn(
              "rounded-[4px] border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              view === v.key ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      {/* Group filter */}
      <nav className="mb-3 flex flex-wrap gap-1.5" aria-label="Form group filter">
        <Link
          href={url({ group: undefined, type: undefined })}
          aria-current={!group && !type ? "page" : undefined}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            !group && !type ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          All forms
        </Link>
        {SUBMISSION_GROUPS.map((g) => (
          <Link
            key={g.value}
            href={url({ group: g.value, type: undefined })}
            title={g.note}
            aria-current={group === g.value ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              group === g.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {g.label}
          </Link>
        ))}
      </nav>

      {/* Per-form chips, each with its own count */}
      <nav className="mb-5 flex flex-wrap gap-1.5" aria-label="Form filter">
        {chips.map((s) => {
          const c = counts.byType[s.value];
          const Icon = submissionIcon(s.value);
          return (
            <Link
              key={s.value}
              href={url({ type: type === s.value ? undefined : s.value, group: undefined })}
              title={s.note}
              aria-current={type === s.value ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-xs transition-colors",
                type === s.value ? "border-foreground bg-muted text-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              <span>{s.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{c.total}</span>
              {c.unanswered > 0 && (
                <span className="rounded-[3px] bg-primary px-1 font-mono text-[10px] font-bold leading-tight text-primary-foreground">
                  {c.unanswered}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Search across every answer, not just the subject line */}
      <form action="/console/enquiries" className="mb-6 flex flex-wrap items-center gap-2">
        <input type="hidden" name="status" value={view} />
        {type && <input type="hidden" name="type" value={type} />}
        {group && <input type="hidden" name="group" value={group} />}
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search names, companies, answers…"
            aria-label="Search submissions"
            className="h-9 pl-9 text-sm"
          />
        </div>
        <SubmitButton size="sm" variant="outline" pendingText="Searching…">
          Search
        </SubmitButton>
        {(q || type || group) && (
          <Link href={`/console/enquiries?status=${view}`} className="font-mono text-[11px] text-muted-foreground hover:text-foreground">
            Clear filters
          </Link>
        )}
      </form>

      <p className="mb-4 font-mono text-[11px] text-muted-foreground">
        {total === 0
          ? "No submissions"
          : total <= PER_PAGE
            ? `${total} ${total === 1 ? "submission" : "submissions"}`
            : `Showing ${page * PER_PAGE + 1}–${page * PER_PAGE + rows.length} of ${total}`}
        {type ? ` · ${submissionMeta(type).label}` : group ? ` · ${SUBMISSION_GROUPS.find((g) => g.value === group)?.label}` : ""}
        {q ? ` · matching “${q}”` : ""}
      </p>

      {rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={view === "needs-action" ? "Nothing waiting" : "Nothing here"}
          body={
            view === "needs-action"
              ? "Every submission has been picked up. Switch to Everything to see the full record of forms filed."
              : "No submission matches these filters."
          }
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((e) => {
            const meta = submissionMeta(e.type);
            return (
              <li key={e.id}>
                <PortalPanel
                  className={cn(e.status === "new" && "border-primary/50")}
                  bodyClassName="p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <SubmissionTag type={e.type} />
                        <StatusTag status={e.status} />
                        <span className="font-mono text-[11px] text-muted-foreground">{formatDateTime(e.createdAt)}</span>
                        {e.dueAt && (
                          <span className="font-mono text-[11px] text-primary">· due {formatDate(e.dueAt)}</span>
                        )}
                      </div>
                      <h2 className="mt-2.5 font-display text-[1.1rem] leading-snug tracking-[-0.02em]">
                        <Link href={`/console/enquiries/${e.id}`} className="hover:text-primary">
                          {e.subject ?? meta.label}
                        </Link>
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {e.name}
                        {e.organisation ? ` · ${e.organisation}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <AssignControl id={e.id} assignedToId={e.assignedToId} staff={staff} />
                      <StatusControl id={e.id} status={e.status} />
                    </div>
                  </div>

                  <SubmissionDetails details={e.details} message={e.message} className="mt-5" />
                  <SubmissionContact email={e.email} phone={e.phone} subject={e.subject} className="mt-5" />
                  <SubmissionLinks entity={e.entity} entityId={e.entityId} source={e.source} className="mt-2.5" />

                  <div className="mt-4 border-t border-border/60 pt-3">
                    <Link href={`/console/enquiries/${e.id}`} className="font-mono text-[11px] text-primary hover:underline">
                      Open the full record →
                    </Link>
                  </div>
                </PortalPanel>
              </li>
            );
          })}
        </ul>
      )}

      {total > PER_PAGE && (
        <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Pagination">
          {page > 0 ? (
            <Link
              href={url({ page: String(page - 1) })}
              className="rounded-[4px] border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-foreground transition-colors hover:border-foreground/40"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono text-[11px] text-muted-foreground">
            Page {page + 1} of {Math.ceil(total / PER_PAGE)}
          </span>
          {(page + 1) * PER_PAGE < total ? (
            <Link
              href={url({ page: String(page + 1) })}
              className="rounded-[4px] border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-foreground transition-colors hover:border-foreground/40"
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <p className="mt-10 font-mono text-[11px] leading-relaxed text-muted-foreground">
        Statuses:{" "}
        {SUBMISSION_STATUSES.map((s, i) => (
          <span key={s.value}>
            {i > 0 && " · "}
            <strong className="text-foreground">{s.label}</strong> {s.note.toLowerCase()}
          </span>
        ))}
      </p>
    </>
  );
}
