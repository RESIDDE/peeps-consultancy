import Link from "next/link";
import { CalendarClock, CheckCircle2, ChevronDown, Plus, Users } from "lucide-react";
import { PortalPageHeader, PortalPanel, PortalStatCard } from "@/components/portal/portal-kit";
import { ColumnChart } from "@/components/charts/column-chart";
import { BarList } from "@/components/charts/bar-list";
import { awaitingReply, inboxCounts, overviewMetrics, upcomingActions, upcomingBookings } from "@/server/metrics";
import { SubmissionTag, submissionIcon } from "@/components/console/submissions";
import { FORM_TABS, submissionMeta } from "@/lib/submissions";
import { STAGE_META } from "@/lib/quality";
import { formatDate, isPast, nairaCompact, relativeDays } from "@/lib/format";
import { getSession } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Overview" };

/**
 * The first screen after signing in. It answers three questions, in this order, and
 * nothing else above the fold:
 *
 *   1. How are we doing?          — four numbers, each a link to where it lives.
 *   2. What came in, from where?  — one tile per service, same as the Forms tabs.
 *   3. What do I do next?         — forms waiting for a reply, and what's coming up.
 *
 * The longer-range analytics (time to place, retention, satisfaction, the funnel, revenue
 * by month) are kept, but folded under "More numbers": they matter weekly, not on every
 * visit, and on the main screen they buried the work.
 */
export default async function ConsoleOverview() {
  const [m, inbox, waiting, bookings, followUps, session] = await Promise.all([
    overviewMetrics(),
    inboxCounts(),
    awaitingReply(6),
    upcomingBookings(6),
    upcomingActions(),
    getSession(),
  ]);

  const firstName = session?.user.name.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  // Past the 24-hour reply promise. Taken once per request, not per row.
  const replyDeadline = new Date();
  replyDeadline.setHours(replyDeadline.getHours() - 24);

  /** One tile per service, with how many have come in and how many still need a reply. */
  const services = FORM_TABS.map((t) => ({
    ...t,
    total: t.types.reduce((n, type) => n + (inbox.byType[type]?.total ?? 0), 0),
    fresh: t.types.reduce((n, type) => n + (inbox.byType[type]?.unanswered ?? 0), 0),
  }));

  /** Bookings from forms and client follow-ups from the CRM, in one list, soonest first. */
  const comingUp = [
    ...bookings
      .filter((b) => b.dueAt)
      .map((b) => ({
        key: `b-${b.id}`,
        at: b.dueAt!,
        title: b.subject ?? submissionMeta(b.type).label,
        sub: b.organisation || b.name,
        kind: submissionMeta(b.type).short,
        href: `/console/enquiries/${b.id}`,
      })),
    ...followUps
      .filter((a) => a.nextActionAt)
      .map((a) => ({
        key: `f-${a.id}`,
        at: a.nextActionAt!,
        title: a.nextAction ?? "Follow up",
        sub: a.name,
        kind: "Client",
        href: `/console/employers/${a.id}`,
      })),
  ]
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, 6);

  return (
    <>
      <PortalPageHeader
        label="OVERVIEW"
        title={`${greeting}, ${firstName}.`}
        lede="Here's what needs you today."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/console/talent/new"
              className="inline-flex items-center gap-2 rounded-[7px] border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:border-foreground/40"
            >
              <Users className="size-4" aria-hidden />
              Add candidate
            </Link>
            <Link
              href="/console/employers/new"
              className="inline-flex items-center gap-2 rounded-[7px] bg-foreground px-4 py-2.5 text-sm text-background transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" aria-hidden />
              Add employer
            </Link>
          </div>
        }
      />

      {/* 1. How are we doing — four numbers, each one a door. */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStatCard
          label="Forms to answer"
          value={inbox.unanswered}
          note={inbox.unanswered === 0 ? "You're all caught up." : "Waiting for someone to reply."}
          actionLabel="Open forms"
          tone={inbox.unanswered > 0 ? "accent" : "default"}
          href="/console/enquiries"
        />
        <PortalStatCard
          label="Candidates"
          value={m.totalCandidates}
          note={`${m.jobReady} ready to put forward.`}
          actionLabel="Open talent"
          href="/console/talent"
        />
        <PortalStatCard
          label="Open vacancies"
          value={m.openVacancies}
          note={`For ${m.activeEmployers} active ${m.activeEmployers === 1 ? "employer" : "employers"}.`}
          actionLabel="Open vacancies"
          href="/console/vacancies"
        />
        <PortalStatCard
          label="Revenue this year"
          value={nairaCompact(m.revenueYtd)}
          note={`From ${m.placed} ${m.placed === 1 ? "placement" : "placements"}.`}
          actionLabel="Open revenue"
          href="/console/placements"
        />
      </div>

      {/* 2. What came in, and from which service. Same groups as the Forms tabs. */}
      <PortalPanel
        className="mb-10"
        title="Forms by service"
        description="Every form on the website, grouped by the service it's for. A red number means someone is waiting for a reply."
        actions={
          <Link href="/console/enquiries?show=all" className="text-sm text-primary hover:underline">
            See all forms →
          </Link>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((s) => {
            const Icon = submissionIcon(s.types[0]);
            return (
              <li key={s.key}>
                <Link
                  href={`/console/enquiries?tab=${s.key}`}
                  className={cn(
                    "group flex h-full items-center gap-3 rounded-[6px] border px-4 py-3 transition-colors",
                    s.fresh > 0 ? "border-primary/40 bg-primary/[0.04] hover:border-primary" : "border-border hover:border-foreground/30",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.total === 0 ? "None yet" : `${s.total} ${s.total === 1 ? "form" : "forms"}`}
                    </span>
                  </span>
                  {s.fresh > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[11px] font-bold text-primary-foreground" title={`${s.fresh} waiting for a reply`}>
                      {s.fresh}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </PortalPanel>

      {/* 3. What to do next. */}
      <div className="mb-10 grid items-start gap-6 lg:grid-cols-2">
        <PortalPanel
          title="Waiting for a reply"
          description="Oldest first. Every form promises an answer within 24 hours."
          actions={
            <Link href="/console/enquiries" className="text-sm text-primary hover:underline">
              All to do →
            </Link>
          }
          bodyClassName="p-0"
        >
          {waiting.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden />
              <p className="font-display text-base">All caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">Nobody is waiting on a reply.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {waiting.map((w) => {
                const late = w.createdAt < replyDeadline;
                return (
                  <li key={w.id}>
                    <Link href={`/console/enquiries/${w.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40">
                      <div className="min-w-0 flex-1">
                        <SubmissionTag type={w.type} />
                        <p className="mt-1.5 truncate text-sm font-medium">{w.subject ?? submissionMeta(w.type).label}</p>
                        <p className="truncate text-xs text-muted-foreground">{w.organisation || w.name}</p>
                      </div>
                      <span className={cn("shrink-0 font-mono text-[11px]", late ? "font-semibold text-destructive" : "text-muted-foreground")}>
                        {relativeDays(w.createdAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </PortalPanel>

        <PortalPanel
          title="Coming up"
          description="Bookings from forms and client follow-ups, soonest first."
          bodyClassName="p-0"
        >
          {comingUp.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarClock className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden />
              <p className="font-display text-base">Nothing scheduled</p>
              <p className="mt-1 text-xs text-muted-foreground">Bookings and follow-ups will show here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {comingUp.map((c) => (
                <li key={c.key}>
                  <Link href={c.href} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40">
                    <div className="w-20 shrink-0">
                      <p className={cn("font-mono text-xs font-semibold", isPast(c.at) ? "text-destructive" : "text-foreground")}>
                        {relativeDays(c.at)}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">{formatDate(c.at)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.sub}</p>
                    </div>
                    <span className="shrink-0 rounded-[3px] border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                      {c.kind}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PortalPanel>
      </div>

      {/* The longer view: closed by default so it never crowds the work above. */}
      <details className="group rounded-[7px] border border-border bg-card/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-display text-base">More numbers</span>
            <span className="block text-xs text-muted-foreground">Time to place, retention, satisfaction, the talent funnel and revenue by month.</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
        </summary>

        <div className="grid gap-6 border-t border-border p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <PortalStatCard label="Average time to place" value={m.avgDaysToPlace ? `${m.avgDaysToPlace} days` : "—"} note="From a vacancy brief to a hire. Target: under 21 days." />
            <PortalStatCard
              label="Still in the job after 3 months"
              value={m.retention3m != null ? `${m.retention3m}%` : "—"}
              note={m.retentionSample ? `Out of ${m.retentionSample} placements old enough to count.` : "No placements past 3 months yet."}
            />
            <PortalStatCard label="Employer satisfaction" value={m.avgRating ? `${m.avgRating} / 5` : "—"} note="Average post-hire rating from employers." />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <PortalPanel title="Talent funnel" description="How many candidates have reached each step of the quality ladder.">
              <BarList
                data={m.funnel.map((f) => ({
                  label: STAGE_META[f.stage].label,
                  value: f.value,
                  swatch: `var(--stage-${f.stage})`,
                }))}
              />
            </PortalPanel>
            <PortalPanel title="Revenue by month" description="The last six months, across placements and training.">
              <ColumnChart data={m.monthly} format="naira" title="Revenue by month" />
            </PortalPanel>
          </div>
        </div>
      </details>
    </>
  );
}
