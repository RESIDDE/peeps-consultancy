import Link from "next/link";
import { and, count, desc, ilike, inArray, or, sql } from "drizzle-orm";
import { ArrowUpRight, Inbox, Search } from "lucide-react";
import { db } from "@/db";
import { enquiries, type SubmissionField } from "@/db/schema";
import { EmptyState } from "@/components/peeps/blocks";
import { PortalPageHeader } from "@/components/portal/portal-kit";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { StatusTag, SubmissionTag } from "@/components/console/submissions";
import { inboxCounts } from "@/server/metrics";
import { FORM_TABS, OPEN_STATUSES, formTab, submissionMeta, tabOf } from "@/lib/submissions";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Forms" };

/**
 * Every form filled on the PEEPs website, one tab per service.
 *
 * The page answers one question at a glance — "what came in, for which service, and who
 * still needs a reply?" — so it shows a tab bar, a two-way switch and a table, and nothing
 * else. Assigning, changing status and setting a date happen on a submission's own page,
 * one click away, where there is room to read the answers first.
 *
 * Tabs, their counts and their extra columns all come from `FORM_TABS` in
 * `lib/submissions.ts`; a new form or service needs no change here.
 */

interface Params {
  tab?: string;
  show?: string;
  q?: string;
  page?: string;
}

const PER_PAGE = 50;

/** Pull one answer out of a submission by the label its form gave it. */
function answer(details: readonly SubmissionField[], label: string): string | null {
  return details.find((d) => d.label === label)?.value ?? null;
}

export default async function FormsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const tab = formTab(params.tab);
  // Registrations and portal activity are logged, not owed a reply, so "To do" would
  // always be empty there. Their tab opens on everything instead.
  const show = params.show === "all" || params.show === "todo" ? params.show : tab?.logOnly ? "all" : "todo";
  const q = (params.q ?? "").trim();
  const page = Math.max(0, Number(params.page) || 0);

  const where = and(
    tab ? inArray(enquiries.type, [...tab.types]) : undefined,
    show === "todo" ? inArray(enquiries.status, [...OPEN_STATUSES]) : undefined,
    // Searches the answers as well as the contact fields, so anything a visitor typed into
    // any field on any form can be found.
    q
      ? or(
          ilike(enquiries.name, `%${q}%`),
          ilike(enquiries.email, `%${q}%`),
          ilike(enquiries.organisation, `%${q}%`),
          ilike(enquiries.subject, `%${q}%`),
          ilike(enquiries.message, `%${q}%`),
          ilike(enquiries.phone, `%${q}%`),
          sql`${enquiries.details}::text ilike ${`%${q}%`}`,
        )
      : undefined,
  );

  const [rows, [{ total }], counts] = await Promise.all([
    db
      .select()
      .from(enquiries)
      .where(where)
      .orderBy(desc(enquiries.createdAt))
      .limit(PER_PAGE)
      .offset(page * PER_PAGE),
    db.select({ total: count() }).from(enquiries).where(where),
    inboxCounts(),
  ]);

  /** Per-tab totals and unanswered counts, from the same tally the sidebar badge uses. */
  const tally = (types: readonly string[]) =>
    types.reduce(
      (acc, t) => ({ total: acc.total + (counts.byType[t]?.total ?? 0), fresh: acc.fresh + (counts.byType[t]?.unanswered ?? 0) }),
      { total: 0, fresh: 0 },
    );

  const url = (next: Partial<Params>) => {
    const merged: Params = { tab: tab?.key, show: params.show, q: q || undefined, page: undefined, ...next };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, String(v));
    return `/console/enquiries${sp.size ? `?${sp}` : ""}`;
  };

  const extra = tab?.columns ?? [];

  return (
    <>
      <PortalPageHeader
        label="FORMS"
        title="Forms."
        lede="Every form someone fills on the PEEPs website lands here. Pick a service to see its forms. Anything marked New is waiting for a reply."
      />

      {/* One tab per service. The red number is how many are still waiting for a reply. */}
      <nav aria-label="Services" className="-mx-1 mb-6 overflow-x-auto border-b border-border">
        <ul className="flex min-w-max gap-1 px-1">
          {[{ key: undefined, label: "All", types: FORM_TABS.flatMap((t) => t.types) }, ...FORM_TABS].map((t) => {
            const active = tab?.key === t.key;
            const { total: n, fresh } = tally(t.types);
            return (
              <li key={t.key ?? "all"}>
                <Link
                  href={url({ tab: t.key, show: undefined })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 pb-3 pt-2 text-sm transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className={cn(active && "font-medium")}>{t.label}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{n}</span>
                  {fresh > 0 && (
                    <span
                      className="rounded-full bg-primary px-1.5 font-mono text-[10px] font-bold leading-[1.15rem] text-primary-foreground"
                      title={`${fresh} waiting for a reply`}
                    >
                      {fresh}
                    </span>
                  )}
                  {active && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {tab && (
        <p className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{tab.note}</span>
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${submissionMeta(tab.types[0]).href}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
          >
            See the form on the website <ArrowUpRight className="size-3" aria-hidden />
          </a>
        </p>
      )}

      {/* To do / All, and search. Nothing else to set. */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-[6px] border border-border p-0.5" role="group" aria-label="Show">
          {[
            { key: "todo", label: "To do" },
            { key: "all", label: "All" },
          ].map((o) => (
            <Link
              key={o.key}
              href={url({ show: o.key })}
              aria-current={show === o.key ? "page" : undefined}
              className={cn(
                "rounded-[4px] px-3 py-1.5 text-xs transition-colors",
                show === o.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </Link>
          ))}
        </div>

        <form action="/console/enquiries" className="relative min-w-0 flex-1 sm:max-w-xs">
          {tab && <input type="hidden" name="tab" value={tab.key} />}
          {params.show && <input type="hidden" name="show" value={params.show} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input name="q" defaultValue={q} placeholder="Search names, companies, answers…" aria-label="Search forms" className="h-9 pl-9 text-sm" />
        </form>

        <p className="ml-auto font-mono text-[11px] text-muted-foreground">
          {total === 0 ? "No forms" : `${total} ${total === 1 ? "form" : "forms"}`}
          {show === "todo" && total > 0 ? " to do" : ""}
          {q ? ` matching “${q}”` : ""}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={q ? "No matches" : show === "todo" ? "All caught up" : "Nothing yet"}
          body={
            q
              ? "No form matches that search."
              : show === "todo"
                ? "Every form here has been picked up. Switch to All to see the full record."
                : "No one has filled this form yet. It will appear here the moment someone does."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-[7px] border border-border bg-card/60">
          <Table>
            <THead>
              <TR>
                <TH className="w-36">Status</TH>
                <TH>From</TH>
                <TH>About</TH>
                {extra.map((c) => (
                  <TH key={c}>{c}</TH>
                ))}
                <TH className="w-40">Received</TH>
                <TH className="w-16">
                  <span className="sr-only">Open</span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((e) => {
                const href = `/console/enquiries/${e.id}`;
                const service = tabOf(e.type);
                return (
                  <TR key={e.id} className={cn(e.status === "new" && "bg-primary/[0.035]")}>
                    <TD className="whitespace-nowrap">
                      <StatusTag status={e.status} />
                    </TD>
                    <TD>
                      <Link href={href} className="font-medium hover:text-primary">
                        {e.name}
                      </Link>
                      {e.organisation && <p className="text-xs text-muted-foreground">{e.organisation}</p>}
                    </TD>
                    <TD className="max-w-[22rem]">
                      {/* On All, say which service it came from; inside a tab that's already known. */}
                      {!tab ? (
                        <SubmissionTag type={e.type} className="mb-1" />
                      ) : (
                        service &&
                        service.types.length > 1 && <p className="mb-0.5 text-xs text-muted-foreground">{submissionMeta(e.type).label}</p>
                      )}
                      <p className="truncate text-sm">{e.subject ?? submissionMeta(e.type).label}</p>
                    </TD>
                    {extra.map((c) => (
                      <TD key={c} className="text-sm">
                        {answer(e.details, c) ?? <span className="text-muted-foreground">—</span>}
                      </TD>
                    ))}
                    <TD className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {formatDateTime(e.createdAt)}
                      {e.dueAt && <p className="text-primary">Due {formatDate(e.dueAt)}</p>}
                    </TD>
                    <TD className="text-right">
                      <Link href={href} className="whitespace-nowrap font-mono text-[11px] text-primary hover:underline">
                        Open →
                      </Link>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      )}

      {total > PER_PAGE && (
        <nav className="mt-6 flex items-center justify-between gap-4" aria-label="Pagination">
          {page > 0 ? (
            <Link href={url({ page: String(page - 1) })} className="font-mono text-[11px] text-primary hover:underline">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono text-[11px] text-muted-foreground">
            Page {page + 1} of {Math.ceil(total / PER_PAGE)}
          </span>
          {(page + 1) * PER_PAGE < total ? (
            <Link href={url({ page: String(page + 1) })} className="font-mono text-[11px] text-primary hover:underline">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
