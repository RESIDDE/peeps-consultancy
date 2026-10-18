import Link from "next/link";
import { Briefcase, Building2, CalendarClock, Clock, Lightbulb, Users, Wallet, BadgeCheck } from "lucide-react";
import { PageHeader, Panel, StatCard, EmptyState } from "@/components/peeps/blocks";
import { ColumnChart } from "@/components/charts/column-chart";
import { BarList } from "@/components/charts/bar-list";
import { ChartTable } from "@/components/charts/chart-table";
import { buttonVariants } from "@/components/ui/button";
import { feedbackInsights, overviewMetrics, recentActivity, upcomingActions } from "@/server/metrics";
import { STAGE_META } from "@/lib/quality";
import { CRM_STAGES } from "@/lib/pipeline";
import { formatDateTime, humanize, isPast, nairaCompact, relativeDays } from "@/lib/format";
import { getSession } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Overview" };

const ENTITY_HREF: Record<string, string> = {
  candidate: "/console/talent/",
  employer: "/console/employers/",
  vacancy: "/console/vacancies/",
};

export default async function ConsoleOverview() {
  const [m, actions, activity, insights, session] = await Promise.all([
    overviewMetrics(),
    upcomingActions(),
    recentActivity(),
    feedbackInsights(),
    getSession(),
  ]);
  const firstName = session?.user.name.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting}, ${firstName}.`}
        description="The PEEPs operating picture: talent quality, employer pipeline, placements and revenue."
        actions={
          <>
            <Link href="/console/talent/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Register candidate
            </Link>
            <Link href="/console/employers/new" className={buttonVariants({ size: "sm" })}>
              Add employer
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Registered talent" value={m.totalCandidates} hint={`${m.jobReady} PEEPs Ready now`} icon={Users} href="/console/talent" />
        <StatCard label="Active employers" value={m.activeEmployers} hint={`${m.totalEmployers} in CRM`} icon={Building2} href="/console/employers" />
        <StatCard label="Open vacancies" value={m.openVacancies} hint="Across all clients" icon={Briefcase} href="/console/vacancies" />
        <StatCard label="Revenue this year" value={nairaCompact(m.revenueYtd)} hint={`${m.placed} placements to date`} icon={Wallet} tone="primary" href="/console/placements" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatCard label="Avg. days to placement" value={m.avgDaysToPlace ?? "—"} hint="Vacancy received → hire" icon={Clock} />
        <StatCard
          label="3-month retention"
          value={m.retention3m != null ? `${m.retention3m}%` : "—"}
          hint={m.retentionSample ? `${m.retentionSample} placements past 3 months` : "No placements past 3 months yet"}
          icon={BadgeCheck}
        />
        <StatCard label="Employer rating" value={m.avgRating ? `${m.avgRating}/5` : "—"} hint="From placement feedback" icon={Lightbulb} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel title="Talent quality funnel" description="Candidates who have reached at least each stage of the quality ladder">
          <BarList
            data={m.funnel.map((f) => ({ label: STAGE_META[f.stage].label, value: f.value, swatch: `var(--stage-${f.stage})` }))}
          />
          <ChartTable
            data={m.funnel.map((f) => ({ label: STAGE_META[f.stage].label, value: f.value }))}
            labelHeader="Stage reached"
            valueHeader="Candidates"
          />
        </Panel>
        <Panel title="Revenue by month" description="All streams, last six months">
          <ColumnChart data={m.monthly} format="naira" title="Revenue by month" />
          <ChartTable data={m.monthly} format="naira" labelHeader="Month" valueHeader="Revenue" />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Revenue by stream" description="All time">
          <BarList data={m.streams} format="naira" />
          <ChartTable data={m.streams} format="naira" labelHeader="Stream" valueHeader="Revenue" />
        </Panel>
        <Panel title="New talent registrations" description="Candidates added per month">
          <ColumnChart data={m.registrations} title="New talent registrations" height={160} />
          <ChartTable data={m.registrations} labelHeader="Month" valueHeader="Candidates" />
        </Panel>
        <Panel
          title="Next actions"
          description="Employer follow-ups due in the next 14 days"
          bodyClassName="p-0"
          actions={
            <Link href="/console/employers" className="text-xs font-medium text-primary hover:underline">
              CRM
            </Link>
          }
        >
          {actions.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing due" className="m-5" />
          ) : (
            <ul className="divide-y">
              {actions.map((a) => {
                const overdue = isPast(a.nextActionAt);
                return (
                  <li key={a.id}>
                    <Link href={`/console/employers/${a.id}`} className="flex items-start justify-between gap-3 px-5 py-3 hover:bg-muted/50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.nextAction}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={cn("text-xs font-medium", overdue ? "text-destructive" : "text-foreground")}>{relativeDays(a.nextActionAt)}</p>
                        <p className="text-[10px] text-muted-foreground">{CRM_STAGES.find((s) => s.value === a.crmStage)?.label}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel
          title="Employer feedback loop"
          description="What employers say placed talent was missing. Share these with training partners."
        >
          {insights.length === 0 ? (
            <EmptyState icon={Lightbulb} title="No feedback yet" body="Feedback appears here after employers review placements." />
          ) : (
            <ul className="grid gap-4">
              {insights.map((i, idx) => (
                <li key={idx} className="rounded-xl bg-muted/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {i.title} · <span className="text-muted-foreground">{i.employer}</span>
                    </p>
                    <span className="text-xs font-semibold">{i.feedback!.rating}/5</span>
                  </div>
                  {i.feedback!.missingSkills && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium text-warning">Missing: </span>
                      {i.feedback!.missingSkills}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Strong: {i.feedback!.strengths}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent activity" bodyClassName="p-0">
          <ul className="divide-y">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <span className="font-medium">{a.actor ?? "Website"}</span>{" "}
                    <span className="text-muted-foreground">{humanize(a.action).toLowerCase()}</span>
                    {a.detail && <> · {ENTITY_HREF[a.entity] ? <Link href={`${ENTITY_HREF[a.entity]}${a.entityId}`} className="hover:underline">{a.detail}</Link> : a.detail}</>}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</p>
                </div>
              </li>
            ))}
            {activity.length === 0 && <li className="px-5 py-6 text-sm text-muted-foreground">No activity yet.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
