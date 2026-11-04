import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { AlertTriangle, CheckCircle2, Inbox } from "lucide-react";
import { db } from "@/db";
import { enquiries, user, type SubmissionField } from "@/db/schema";
import { EmptyState } from "@/components/peeps/blocks";
import { PortalMarkRule, PortalPageHeader, PortalPanel, PortalStatCard, PortalTag } from "@/components/portal/portal-kit";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AssignControl, StatusControl, StatusTag, SubmissionContact } from "@/components/console/submissions";
import { AUTO_CHECK, COMPLIANCE, COMPLIANCE_AREAS, PAYROLL, naira } from "@/lib/services";
import { OPEN_STATUSES, submissionMeta } from "@/lib/submissions";
import { STAFF } from "@/lib/permissions";
import { formatDate, formatDateTime, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Service desk" };

/**
 * The desk for the three services the November 2026 brief added: Payroll Outsourcing,
 * Business Compliance and Auto Check Mechanic.
 *
 * The inbox at /console/enquiries holds every form; this page is the working view for
 * these three, where the answers become columns a consultant can scan, sort and schedule
 * against. It also shows what PEEPs still owes the public pages — an unset price, a
 * mechanic roster nobody has supplied — because an empty figure there is a gap the
 * visitor sees.
 */

const SERVICES = [
  { key: "payroll", type: "payroll", name: PAYROLL.name, short: PAYROLL.short, href: PAYROLL.href },
  { key: "compliance", type: "compliance", name: COMPLIANCE.name, short: COMPLIANCE.short, href: COMPLIANCE.href },
  { key: "auto-check", type: "auto_check", name: AUTO_CHECK.name, short: AUTO_CHECK.short, href: AUTO_CHECK.href },
] as const;

type ServiceKey = (typeof SERVICES)[number]["key"];

/** Pull one answer out of a submission by the label the form gave it. */
function field(details: readonly SubmissionField[], label: string): string | null {
  return details.find((d) => d.label === label)?.value ?? null;
}

/** The columns each service's table shows, drawn from the labels its form writes. */
const COLUMNS: Record<ServiceKey, string[]> = {
  payroll: ["Employees", "Pay frequency", "Current method", "Services needed"],
  compliance: ["Industry", "Areas needed", "Timeframe", "RC number"],
  "auto-check": ["Package", "Vehicle", "Dealership", "State", "Preferred date", "Time slot"],
};

export default async function ServiceDeskPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const active: ServiceKey = SERVICES.some((s) => s.key === service) ? (service as ServiceKey) : "payroll";
  const current = SERVICES.find((s) => s.key === active)!;

  const [rows, staff, allServiceRows] = await Promise.all([
    // Capped: the desk is for working the current queue, and the inbox holds the archive.
    db.select().from(enquiries).where(eq(enquiries.type, current.type)).orderBy(desc(enquiries.createdAt)).limit(200),
    db.select({ id: user.id, name: user.name }).from(user).where(inArray(user.role, STAFF)).orderBy(user.name),
    db
      .select({ id: enquiries.id, type: enquiries.type, status: enquiries.status, dueAt: enquiries.dueAt })
      .from(enquiries)
      .where(inArray(enquiries.type, SERVICES.map((s) => s.type))),
  ]);

  const countsFor = (type: string) => {
    const mine = allServiceRows.filter((r) => r.type === type);
    return { total: mine.length, open: mine.filter((r) => OPEN_STATUSES.includes(r.status)).length };
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = rows
    .filter((r) => r.dueAt && r.dueAt >= today && r.status !== "closed")
    .sort((a, b) => a.dueAt!.getTime() - b.dueAt!.getTime());

  const open = rows.filter((r) => OPEN_STATUSES.includes(r.status));

  return (
    <>
      <PortalPageHeader
        label="SERVICE DESK // PAYROLL · COMPLIANCE · AUTO CHECK"
        title="Service requests."
        lede="The three services on the landing page, with every answer the request form collected laid out as a column. Everything here is also in the inbox; this is the view for working it."
        actions={
          <Link
            href="/console/enquiries?group=services&status=all"
            className="inline-flex items-center gap-2 rounded-[7px] border border-border bg-card px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-foreground/40"
          >
            <Inbox className="size-3.5" />
            <span>All service forms in the inbox</span>
          </Link>
        }
      />

      {/* Service switcher, each carrying its own load */}
      <nav className="mb-8 grid gap-4 sm:grid-cols-3" aria-label="Service">
        {SERVICES.map((s, i) => {
          const c = countsFor(s.type);
          return (
            <Link key={s.key} href={`/console/services?service=${s.key}`} aria-current={active === s.key ? "page" : undefined} className="block">
              <PortalStatCard
                index={i + 1}
                label={s.short}
                value={String(c.open).padStart(2, "0")}
                note={`${c.open} open · ${c.total} received in total.`}
                tone={active === s.key ? "accent" : "default"}
                actionLabel={active === s.key ? "Showing this desk" : "Open this desk"}
              />
            </Link>
          );
        })}
      </nav>

      {/* Auto Check and urgent compliance carry dates, so the schedule leads */}
      {upcoming.length > 0 && (
        <PortalPanel
          className="mb-8"
          label={active === "auto-check" ? "WHERE THE MECHANIC HAS TO BE" : "DATED WORK"}
          title={active === "auto-check" ? "Upcoming inspections" : "Coming deadlines"}
          description="Ordered by the date the visitor asked for. Set a date on any submission to add it here."
          actionGuide="Action: confirm each one with the customer on WhatsApp, then move it to Scheduled. Anything still New within 24 hours of its date needs chasing today."
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {upcoming.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{formatDate(r.dueAt)}</span>
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">{relativeDays(r.dueAt)}</span>
                    <StatusTag status={r.status} />
                  </div>
                  <p className="mt-1 truncate font-display text-sm">
                    <Link href={`/console/enquiries/${r.id}`} className="hover:text-primary">
                      {r.subject ?? submissionMeta(r.type).label}
                    </Link>
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {r.name}
                    {field(r.details, "Time slot") ? ` · ${field(r.details, "Time slot")}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AssignControl id={r.id} assignedToId={r.assignedToId} staff={staff} />
                  <StatusControl id={r.id} status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </PortalPanel>
      )}

      {/* The requests themselves, answers as columns */}
      <PortalPanel
        label={`${current.short.toUpperCase()} REQUESTS`}
        title={current.name}
        description={`${rows.length} received · ${open.length} open. Every column below is an answer from the request form on ${current.href}.`}
        actionGuide="How to use: click a subject to open the full record, where every answer, the consultant notes and the audit trail live. Status and consultant can be set from this table."
        bodyClassName="p-0"
      >
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Inbox}
              title={`No ${current.short.toLowerCase()} requests yet`}
              body={`Submissions from the ${current.href} form arrive here, and in the inbox, the moment they are filed.`}
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Received</TH>
                <TH>Company / customer</TH>
                {COLUMNS[active].map((c) => (
                  <TH key={c}>{c}</TH>
                ))}
                <TH>Consultant</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((r) => (
                <TR key={r.id} className={cn(r.status === "new" && "bg-primary/[0.04]")}>
                  <TD className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">{formatDateTime(r.createdAt)}</TD>
                  <TD className="min-w-[14rem]">
                    <Link href={`/console/enquiries/${r.id}`} className="font-medium hover:text-primary">
                      {r.organisation || r.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{r.name}</p>
                    <SubmissionContact email={r.email} phone={r.phone} subject={r.subject} className="mt-1" />
                  </TD>
                  {COLUMNS[active].map((c) => (
                    <TD key={c} className="max-w-[16rem] text-xs leading-snug">
                      {field(r.details, c) ?? <span className="text-muted-foreground">—</span>}
                    </TD>
                  ))}
                  <TD>
                    <AssignControl id={r.id} assignedToId={r.assignedToId} staff={staff} />
                  </TD>
                  <TD>
                    <StatusControl id={r.id} status={r.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </PortalPanel>

      <ServiceCatalogue active={active} />

      <PortalMarkRule className="mt-16 w-3/4" mark="cross" />
    </>
  );
}

/**
 * What the public pages are currently publishing for this service, and what PEEPs has
 * still to supply. A null price or an empty mechanic roster is a hole a visitor sees, so
 * the console says so rather than letting it sit unnoticed in a content file.
 */
function ServiceCatalogue({ active }: { active: ServiceKey }) {
  const items: { label: string; value: string; missing: boolean; note: string }[] = [];

  if (active === "payroll") {
    items.push({
      label: "Price per employee / month",
      value: PAYROLL.pricePerEmployee === null ? "Not set — pages say “Price on request”" : naira(PAYROLL.pricePerEmployee),
      missing: PAYROLL.pricePerEmployee === null,
      note: "Set it in src/lib/services.ts (PAYROLL.pricePerEmployee) and the pricing section fills in.",
    });
    items.push({
      label: "Services offered on the form",
      value: PAYROLL.form.services.join(", "),
      missing: false,
      note: "These are the tick-boxes the quote form shows.",
    });
    items.push({
      label: "What we handle",
      value: `${PAYROLL.handles.length} items published on /payroll`,
      missing: false,
      note: "The cards under “What we handle”.",
    });
  }

  if (active === "compliance") {
    items.push({
      label: "Compliance areas published",
      value: `${COMPLIANCE_AREAS.length} areas — ${COMPLIANCE_AREAS.map((a) => a.name).join(", ")}`,
      missing: false,
      note: "Each one is a card on /compliance and a tick-box on the check form.",
    });
    items.push({
      label: "Industries on the form",
      value: COMPLIANCE.form.industries.join(", "),
      missing: false,
      note: "Add one in src/lib/services.ts and the select follows.",
    });
    items.push({
      label: "Wording review",
      value: "Compliance team still to sign off the area descriptions",
      missing: true,
      note: "Noted in src/lib/services.ts — the text is live on the public page meanwhile.",
    });
  }

  if (active === "auto-check") {
    for (const p of AUTO_CHECK.packages) {
      items.push({
        label: `${p.name} package price`,
        value: p.price === null ? "Not set — the card says “Price on request”" : naira(p.price),
        missing: p.price === null,
        note: `${p.checks.length} checks published.`,
      });
    }
    items.push({
      label: "Certified mechanics",
      value: AUTO_CHECK.mechanics.length === 0 ? "None supplied — the section does not render" : `${AUTO_CHECK.mechanics.length} profiles live`,
      missing: AUTO_CHECK.mechanics.length === 0,
      note: "Names, photos, certifications and years. Nothing is invented: a certification shown has to be real.",
    });
    items.push({
      label: "Customer reviews",
      value: AUTO_CHECK.reviews.length === 0 ? "None supplied — the section is hidden" : `${AUTO_CHECK.reviews.length} published`,
      missing: AUTO_CHECK.reviews.length === 0,
      note: "Real reviews only.",
    });
    items.push({
      label: "Sample inspection report",
      value: AUTO_CHECK.sampleReport ?? "No PDF supplied — the download is hidden",
      missing: !AUTO_CHECK.sampleReport,
      note: "Drop the PDF in /public and point AUTO_CHECK.sampleReport at it.",
    });
    items.push({
      label: "Online payment",
      value: AUTO_CHECK.form.onlinePayment ? "On — customers can pay at booking" : "Off — every booking is pay-on-inspection",
      missing: !AUTO_CHECK.form.onlinePayment,
      note: "Waiting on a Paystack or Flutterwave account.",
    });
    items.push({
      label: "States covered by the form",
      value: AUTO_CHECK.form.states.join(", "),
      missing: false,
      note: "The booking form's state list.",
    });
  }

  const gaps = items.filter((i) => i.missing).length;

  return (
    <PortalPanel
      className="mt-8"
      label="WHAT THE PUBLIC PAGE IS SAYING"
      title="Service content"
      description={
        gaps === 0
          ? "Everything this service needs is published."
          : `${gaps} ${gaps === 1 ? "item" : "items"} PEEPs still has to supply. Until then the pages ask for a quote rather than inventing a figure.`
      }
      actionGuide="How to use: these are the values the landing page and the service page read. A flagged row is a gap a visitor can see. Send the figure to the developer, or edit src/lib/services.ts."
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-border">
        {items.map((i) => (
          <li key={i.label} className="flex items-start gap-3 px-5 py-3.5">
            {i.missing ? (
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{i.label}</p>
                {i.missing && <PortalTag variant="muted">Outstanding</PortalTag>}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{i.value}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground/80">{i.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </PortalPanel>
  );
}
