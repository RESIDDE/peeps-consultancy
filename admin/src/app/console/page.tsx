import Link from "next/link";
import {
  CalendarClock,
  Compass,
  FileCheck2,
  GraduationCap,
  Inbox,
  Lightbulb,
  LifeBuoy,
  Plus,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  PortalMarkRule,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from "@/components/portal/portal-kit";
import { ColumnChart } from "@/components/charts/column-chart";
import { BarList } from "@/components/charts/bar-list";
import { ChartTable } from "@/components/charts/chart-table";
import {
  feedbackInsights,
  inboxCounts,
  overviewMetrics,
  recentActivity,
  recentSubmissions,
  upcomingActions,
  upcomingBookings,
} from "@/server/metrics";
import { StatusTag, SubmissionTag, submissionIcon } from "@/components/console/submissions";
import { SUBMISSIONS, SUBMISSION_GROUPS, submissionMeta, typesInGroup } from "@/lib/submissions";
import { STAGE_META } from "@/lib/quality";
import { CRM_STAGES } from "@/lib/pipeline";
import { formatDate, formatDateTime, humanize, isPast, nairaCompact, relativeDays } from "@/lib/format";
import { getSession } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Overview" };

const ENTITY_HREF: Record<string, string> = {
  candidate: "/console/talent/",
  employer: "/console/employers/",
  vacancy: "/console/vacancies/",
};

export default async function ConsoleOverview() {
  const [m, actions, activity, insights, session, inbox, submissions, bookings] = await Promise.all([
    overviewMetrics(),
    upcomingActions(),
    recentActivity(),
    feedbackInsights(),
    getSession(),
    inboxCounts(),
    recentSubmissions(8),
    upcomingBookings(6),
  ]);

  /** Every form the site has, with how much of it has come in. Reads the form registry. */
  const formLoad = SUBMISSIONS.map((f) => ({
    ...f,
    total: inbox.byType[f.value]?.total ?? 0,
    unanswered: inbox.byType[f.value]?.unanswered ?? 0,
  }));
  const serviceUnanswered = typesInGroup("services").reduce((n, t) => n + (inbox.byType[t]?.unanswered ?? 0), 0);

  const firstName = session?.user.name.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayFormatted = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      {/* Studio Header Opening */}
      <PortalPageHeader
        label={`EXECUTIVE DESK // CENTRAL OPERATIONS · ${todayFormatted.toUpperCase()}`}
        title={`${greeting}, ${firstName}.`}
        lede="Welcome to the PEEPs administrative workspace. Below is your real-time operating picture covering candidate verification throughput, employer mandates, placement velocity, and realized revenue."
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/console/talent/new"
              className="inline-flex items-center gap-2 rounded-[7px] border border-border bg-card px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-foreground hover:border-foreground/40 transition-colors"
            >
              <Users className="size-3.5" />
              <span>Register Candidate</span>
            </Link>
            <Link
              href="/console/employers/new"
              className="inline-flex items-center gap-2 rounded-[7px] bg-foreground px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-background hover:opacity-90 transition-opacity"
            >
              <Plus className="size-3.5" />
              <span>Add Employer</span>
            </Link>
          </div>
        }
      />

      {/* New User Orientation & Action Field Manual */}
      <div className="mb-10 rounded-[7px] border border-border bg-card/75 p-6 md:p-8 backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-[4px] border border-primary/30 bg-primary/10 text-primary">
              <Compass className="size-4" />
            </span>
            <div>
              <p className="label text-[0.72rem] text-muted-foreground">Console Field Manual</p>
              <h2 className="font-display text-lg font-medium text-foreground tracking-[-0.02em]">
                How to Navigate PEEPs Operations Without a Briefing
              </h2>
            </div>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground/80">
5 Core Workflows · Click Any Card or Section to Execute
          </span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {/* Step 0 — the inbox, because everything the public sends starts here */}
          <div className="rounded-[5px] border border-primary/30 bg-primary/[0.04] p-4 transition-colors hover:border-primary/60">
            <div className="mb-2 flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span className="font-bold text-primary">01 // INBOX</span>
              <Inbox className="size-3.5 text-primary" />
            </div>
            <h3 className="font-display text-sm font-medium text-foreground">Inbound Submissions</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Every form filed on the site — talent requests, payroll quotes, compliance checks, Auto Check bookings,
              partnerships, career services and registrations — arrives here <strong>tagged with the form it came from</strong>.
              Answer within 24 hours.
            </p>
            <Link href="/console/enquiries" className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline">
              <span>Open the Inbox →</span>
            </Link>
          </div>

          {/* Step 1 */}
          <div className="rounded-[5px] border border-border/70 bg-background/50 p-4 transition-colors hover:border-foreground/30">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-2">
              <span className="font-bold text-primary">02 // TALENT</span>
              <FileCheck2 className="size-3.5 text-primary" />
            </div>
            <h3 className="font-display text-sm font-medium text-foreground">Candidate Verification</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Review candidate dossiers, verify NYSC / degrees / identity documents, log technical assessments, and advance profiles to <strong>PEEPs Ready</strong>.
            </p>
            <Link
              href="/console/talent"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
            >
              <span>Open Talent Registry →</span>
            </Link>
          </div>

          {/* Step 2 */}
          <div className="rounded-[5px] border border-border/70 bg-background/50 p-4 transition-colors hover:border-foreground/30">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-2">
              <span className="font-bold text-primary">03 // MANDATES</span>
              <TrendingUp className="size-3.5 text-primary" />
            </div>
            <h3 className="font-display text-sm font-medium text-foreground">Employer Vacancies</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Conduct client vacancy analyses, calibrate required skills & salary bands, and generate algorithmic matches to assemble verified candidate shortlists.
            </p>
            <Link
              href="/console/vacancies"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
            >
              <span>Manage Vacancies →</span>
            </Link>
          </div>

          {/* Step 3 */}
          <div className="rounded-[5px] border border-border/70 bg-background/50 p-4 transition-colors hover:border-foreground/30">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-2">
              <span className="font-bold text-primary">04 // CRM</span>
              <Users className="size-3.5 text-primary" />
            </div>
            <h3 className="font-display text-sm font-medium text-foreground">Client Engagement</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Track corporate partnerships, follow up on pending proposals, schedule calibration calls, and advance pipeline stages from prospect to active agreement.
            </p>
            <Link
              href="/console/employers"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
            >
              <span>View Client CRM →</span>
            </Link>
          </div>

          {/* Step 4 */}
          <div className="rounded-[5px] border border-border/70 bg-background/50 p-4 transition-colors hover:border-foreground/30">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground mb-2">
              <span className="font-bold text-primary">05 // AUDIT</span>
              <GraduationCap className="size-3.5 text-primary" />
            </div>
            <h3 className="font-display text-sm font-medium text-foreground">§30 Feedback Loop</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Review post-placement employer feedback at 30 & 90 days. Feed identified skill deficits to training partners to improve cohort preparation.
            </p>
            <Link
              href="/console/placements"
              className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
            >
              <span>Inspect Placements →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Inbound: every form filed on the site, tagged and counted */}
      <div className="mb-10">
        <p className="label mb-4 flex items-center gap-4 text-muted-foreground">
          <span>INBOUND // EVERY FORM FILED ON THE SITE</span>
          <span aria-hidden className="h-px flex-1 bg-border" />
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PortalStatCard
            index={1}
            label="Awaiting a reply"
            value={String(inbox.unanswered).padStart(2, "0")}
            note="Submissions nobody has picked up yet, across every form."
            guide="Every public form promises an answer within 24 hours. Click to open the inbox filtered to New."
            actionLabel="Open the inbox"
            tone={inbox.unanswered > 0 ? "accent" : "default"}
            href="/console/enquiries?status=new"
          />
          <PortalStatCard
            index={2}
            label="Service requests open"
            value={String(serviceUnanswered).padStart(2, "0")}
            note="Payroll quotes, compliance checks and Auto Check bookings."
            guide="Click for the service desk, where each request's answers are laid out as columns you can schedule against."
            actionLabel="Open the service desk"
            tone="default"
            href="/console/services"
          />
          <PortalStatCard
            index={3}
            label="Received this month"
            value={String(inbox.thisMonth).padStart(2, "0")}
            note={`${inbox.total} forms filed since launch.`}
            guide="Counts every form on the site: requests, registrations and portal activity alike."
            actionLabel="See everything"
            tone="default"
            href="/console/enquiries?status=all"
          />
          <PortalStatCard
            index={4}
            label="Median pick-up"
            value={inbox.medianResponseHours != null ? `${inbox.medianResponseHours}h` : "—"}
            note="From a form arriving to a consultant taking it on."
            guide="Measured over the last 50 handled submissions. Target is under 24 hours."
            tone="default"
          />
        </div>
      </div>

      {/* Inbound detail: load per form, latest arrivals, dated work */}
      <div className="mb-10 grid gap-8 xl:grid-cols-[1fr_1fr_1fr] items-start">
        <PortalPanel
          label="FORM COVERAGE"
          title="Every form, and its load"
          description="Each form on the PEEPs site and how much of it has come in. A form with no submissions yet still has a home here."
          actionGuide="How to use: this list is generated from the site's form registry, so a new form on the site appears here by itself. Click one to see its submissions."
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {SUBMISSION_GROUPS.map((g) => {
              const forms = formLoad.filter((f) => f.group === g.value);
              if (forms.length === 0) return null;
              return (
                <li key={g.value} className="px-5 py-4">
                  <p className="label mb-2 text-[0.66rem] text-muted-foreground">{g.label}</p>
                  <ul className="grid gap-1.5">
                    {forms.map((f) => {
                      const Icon = submissionIcon(f.value);
                      return (
                        <li key={f.value}>
                          <Link
                            href={`/console/enquiries?type=${f.value}&status=all`}
                            title={f.note}
                            className="group flex items-center gap-2.5 rounded-[4px] px-1.5 py-1 transition-colors hover:bg-muted/50"
                          >
                            <Icon className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
                            <span className="min-w-0 flex-1 truncate text-xs">{f.label}</span>
                            {f.unanswered > 0 && (
                              <span className="rounded-[3px] bg-primary px-1 font-mono text-[10px] font-bold leading-tight text-primary-foreground">
                                {f.unanswered}
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-muted-foreground">{f.total}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </PortalPanel>

        <PortalPanel
          label="LATEST ARRIVALS"
          title="Just in"
          description="The most recent submissions, whatever form they came from."
          actionGuide="Action: anything tagged New owes a reply. Click through to see the answers and assign it to yourself."
          actions={
            <Link href="/console/enquiries" className="font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:text-foreground">
              Inbox →
            </Link>
          }
          bodyClassName="p-0"
        >
          {submissions.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="mx-auto mb-2 size-6 text-muted-foreground" />
              <p className="font-display text-base">Nothing filed yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Every form on the site writes here the moment it is submitted.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {submissions.map((sub) => (
                <li key={sub.id}>
                  <Link href={`/console/enquiries/${sub.id}`} className="block p-4 transition-colors hover:bg-muted/40">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SubmissionTag type={sub.type} />
                      {sub.status === "new" && <StatusTag status={sub.status} />}
                    </div>
                    <p className="mt-1.5 truncate text-xs font-medium">{sub.subject ?? submissionMeta(sub.type).label}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {sub.organisation || sub.name} · {formatDateTime(sub.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PortalPanel>

        <PortalPanel
          label="DATED WORK"
          title="Where somebody has to be"
          description="Submissions with a date attached: Auto Check inspections, compliance deadlines, hiring deadlines."
          actionGuide="Action required: confirm each with the customer, then set it to Scheduled. An inspection still New the day before needs a call now."
          actions={
            <Link href="/console/services?service=auto-check" className="font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:text-foreground">
              Service desk →
            </Link>
          }
          bodyClassName="p-0"
        >
          {bookings.length === 0 ? (
            <div className="p-8 text-center">
              <LifeBuoy className="mx-auto mb-2 size-6 text-muted-foreground" />
              <p className="font-display text-base">Nothing booked</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Auto Check bookings and dated requests appear here, soonest first.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link href={`/console/enquiries/${b.id}`} className="block p-4 transition-colors hover:bg-muted/40">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs font-semibold text-primary">{formatDate(b.dueAt)}</span>
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">{relativeDays(b.dueAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium">{b.subject ?? submissionMeta(b.type).label}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {b.organisation || b.name}
                      {b.details.find((d) => d.label === "Time slot") ? ` · ${b.details.find((d) => d.label === "Time slot")!.value}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PortalPanel>
      </div>

      {/* Row 1: Core Key Facts Metrics with Explicit Action Prompts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <PortalStatCard
          index={5}
          label="Registered Talent"
          value={String(m.totalCandidates).padStart(2, "0")}
          note={`${m.jobReady} candidates ready for client submission.`}
          guide="Click to open the candidate database. Filter by sector, check documents, or evaluate unvetted candidates."
          actionLabel="Open Talent Registry"
          tone="default"
          href="/console/talent"
        />

        <PortalStatCard
          index={6}
          label="Active Employers"
          value={String(m.activeEmployers).padStart(2, "0")}
          note={`${m.totalEmployers} total organizations in CRM.`}
          guide="Click to view the client database. Manage corporate tiers, assign account consultants, or add new companies."
          actionLabel="Manage Client CRM"
          tone="default"
          href="/console/employers"
        />

        <PortalStatCard
          index={7}
          label="Open Mandates"
          value={String(m.openVacancies).padStart(2, "0")}
          note="Active sourcing and shortlist reviews."
          guide="Click to inspect client vacancies. Review match rankings, build candidate shortlists, and track hiring progress."
          actionLabel="Review Vacancy Mandates"
          tone="default"
          href="/console/vacancies"
        />

        <PortalStatCard
          index={8}
          label="Realized Revenue (YTD)"
          value={nairaCompact(m.revenueYtd)}
          note={`${m.placed} verified placements to date.`}
          guide="Click to access financial records. Inspect placement fees, billing milestones, and recognized revenue streams."
          actionLabel="Inspect Financial Ledger"
          tone="accent"
          href="/console/placements"
        />
      </div>

      {/* Row 2: Secondary Operational Quality Indicators */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <PortalStatCard
          index={9}
          label="Placement Velocity"
          value={m.avgDaysToPlace ? `${m.avgDaysToPlace}d` : "—"}
          note="Average timeframe: mandate brief received → candidate hire."
          guide="Measures operational speed from employer request to signed contract. Target SLA is under 21 calendar days."
          tone="default"
        />

        <PortalStatCard
          index={10}
          label="3-Month Retention"
          value={m.retention3m != null ? `${m.retention3m}%` : "—"}
          note={
            m.retentionSample
              ? `${m.retentionSample} placements evaluated past 3 months.`
              : "No placements past 3 months yet."
          }
          guide="Tracks candidates who remain employed through probation. High retention confirms evidence accuracy."
          tone="default"
        />

        <PortalStatCard
          index={11}
          label="Employer Satisfaction"
          value={m.avgRating ? `${m.avgRating} / 5` : "—"}
          note="Aggregated score from post-hire employer feedback audits."
          guide="Calculated from structured post-placement reviews. Scores below 4.0 trigger automated consultant intervention."
          tone={m.avgRating && Number(m.avgRating) >= 4 ? "accent" : "default"}
        />
      </div>

      {/* Row 3: Talent Funnel & Monthly Revenue */}
      <div className="grid gap-8 xl:grid-cols-[1.1fr_1fr] mb-10 items-start">
        <PortalPanel
          label="VERIFICATION RIGOUR"
          title="Talent Quality Funnel"
          description="Candidates who have satisfied documentary evidence at each rung of the quality ladder."
          actionGuide="Action: Track bottlenecks where candidates are stalled. Click 'Registry View' to filter candidates needing screening, credential verification, or technical assessment."
          actions={
            <Link
              href="/console/talent"
              className="font-mono text-xs uppercase tracking-wider text-primary hover:text-foreground transition-colors"
            >
              Registry View →
            </Link>
          }
        >
          <div className="space-y-6">
            <BarList
              data={m.funnel.map((f) => ({
                label: STAGE_META[f.stage].label,
                value: f.value,
                swatch: `var(--stage-${f.stage})`,
              }))}
            />
            <div className="border-t border-border/60 pt-4">
              <ChartTable
                data={m.funnel.map((f) => ({ label: STAGE_META[f.stage].label, value: f.value }))}
                labelHeader="Stage reached"
                valueHeader="Candidates"
              />
            </div>
          </div>
        </PortalPanel>

        <PortalPanel
          label="FINANCIAL RECOGNITION"
          title="Revenue Velocity (Monthly)"
          description="Gross recognized revenue across placement and training lines (trailing 6 months)."
          actionGuide="Action: Monitor cash flow against operational expenditure. Click 'Placements Ledger' to verify individual fee invoices, payment status, and due dates."
          actions={
            <Link
              href="/console/placements"
              className="font-mono text-xs uppercase tracking-wider text-primary hover:text-foreground transition-colors"
            >
              Placements Ledger →
            </Link>
          }
        >
          <div className="space-y-6">
            <ColumnChart data={m.monthly} format="naira" title="Revenue by month" />
            <div className="border-t border-border/60 pt-4">
              <ChartTable data={m.monthly} format="naira" labelHeader="Month" valueHeader="Revenue" />
            </div>
          </div>
        </PortalPanel>
      </div>

      {/* Row 4: Three-Column Strategic Matrix */}
      <div className="grid gap-8 xl:grid-cols-3 mb-10 items-start">
        {/* Stream Breakdown */}
        <PortalPanel
          label="COMMERCIAL MIX"
          title="Revenue by Stream"
          description="All-time distribution across fee models."
          actionGuide="Action: Compares contingency recruitment fees vs retainers and advisory fees. Ensures healthy diversified revenue."
        >
          <div className="space-y-6">
            <BarList data={m.streams} format="naira" />
            <div className="border-t border-border/60 pt-4">
              <ChartTable data={m.streams} format="naira" labelHeader="Stream" valueHeader="Revenue" />
            </div>
          </div>
        </PortalPanel>

        {/* New Talent Inflow */}
        <PortalPanel
          label="TALENT ACQUISITION"
          title="New Registrations"
          description="Monthly inflow of new candidate dossiers."
          actionGuide="Action: Measures registration velocity from marketing campaigns and university partnerships. Sudden dips signal a need for new outreach."
        >
          <div className="space-y-6">
            <ColumnChart data={m.registrations} title="New talent registrations" height={160} />
            <div className="border-t border-border/60 pt-4">
              <ChartTable data={m.registrations} labelHeader="Month" valueHeader="Candidates" />
            </div>
          </div>
        </PortalPanel>

        {/* Priority CRM Actions */}
        <PortalPanel
          label="PIPELINE VELOCITY"
          title="Next Follow-ups (14d)"
          description="Client meetings and SLA deadlines due."
          actionGuide="Action required: These client accounts have approaching deadlines. Click any company name to log call notes, update the CRM stage, or send shortlist updates."
          actions={
            <Link
              href="/console/employers"
              className="font-mono text-xs uppercase tracking-wider text-primary hover:text-foreground transition-colors"
            >
              Open CRM →
            </Link>
          }
          bodyClassName="p-0"
        >
          {actions.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarClock className="mx-auto size-6 text-muted-foreground mb-2" />
              <p className="font-display text-base">No actions overdue</p>
              <p className="mt-1 text-xs text-muted-foreground">All client accounts are currently within SLA cadence.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {actions.map((a, i) => {
                const overdue = isPast(a.nextActionAt);
                const stageLabel = CRM_STAGES.find((s) => s.value === a.crmStage)?.label;

                return (
                  <li key={a.id}>
                    <Link
                      href={`/console/employers/${a.id}`}
                      className="group flex items-start justify-between gap-3 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <p className="truncate font-display text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {a.name}
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground pl-5">{a.nextAction}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={cn(
                            "font-mono text-xs font-semibold",
                            overdue ? "text-destructive" : "text-foreground",
                          )}
                        >
                          {relativeDays(a.nextActionAt)}
                        </span>
                        {stageLabel && (
                          <p className="font-mono text-[10px] text-muted-foreground uppercase">{stageLabel}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </PortalPanel>
      </div>

      {/* Row 5: Quality Insights & Live Activity Stream */}
      <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr] items-start mb-10">
        {/* Employer Feedback Loop (§30 Audit) */}
        <PortalPanel
          label="QUALITY ASSURANCE (§30 AUDIT)"
          title="Employer Post-Hire Feedback"
          description="Documented capability gaps reported by hiring managers, fed back into partner curriculum."
          actionGuide="Action required: Review competency deficits reported by employers. Relay these skills to PEEPs training partners to refine coursework for the next candidate cohort."
        >
          {insights.length === 0 ? (
            <div className="p-8 text-center rounded-[5px] border border-dashed border-border">
              <Lightbulb className="mx-auto size-6 text-muted-foreground mb-2" />
              <p className="font-display text-base text-foreground">No feedback logged yet</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[36ch] mx-auto">
                Feedback surveys trigger automatically 30 and 90 days after each verified candidate starts.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="rounded-[5px] border border-border bg-muted/25 p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-display text-sm font-medium text-foreground">
                        {insight.title}
                      </h4>
                      <p className="font-mono text-xs text-muted-foreground mt-0.5">
                        Client: {insight.employer}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-[3px] border border-gold/40 bg-gold-soft/30 px-2 py-0.5 font-mono text-xs font-semibold text-gold-foreground dark:text-gold">
                      <Star className="size-3 fill-gold text-gold" />
                      <span>{insight.feedback!.rating}/5</span>
                    </span>
                  </div>

                  {insight.feedback!.missingSkills && (
                    <div className="mt-3 rounded-[4px] border border-warning/30 bg-warning/5 p-2.5 text-xs">
                      <span className="font-semibold text-warning uppercase font-mono tracking-wider">
                        Competency Gap to Address:{" "}
                      </span>
                      <span className="text-foreground">{insight.feedback!.missingSkills}</span>
                    </div>
                  )}

                  {insight.feedback!.strengths && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Verified Strength: </span>
                      {insight.feedback!.strengths}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </PortalPanel>

        {/* Live Activity Stream */}
        <PortalPanel
          label="AUDIT REGISTRY"
          title="Live Operations Log"
          description="Chronological event history across talent onboarding, client verification, and mandate milestones."
          actionGuide="How to use: Provides an immutable audit trail of actions taken across the platform. Click on any linked record to review the source entity."
          bodyClassName="p-0"
        >
          <ul className="divide-y divide-border">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-4 text-xs transition-colors hover:bg-muted/30">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="leading-snug">
                    <span className="font-semibold text-foreground font-mono">{a.actor ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">{humanize(a.action).toLowerCase()}</span>
                    {a.detail && (
                      <>
                        {" "}
                        ·{" "}
                        {ENTITY_HREF[a.entity] ? (
                          <Link
                            href={`${ENTITY_HREF[a.entity]}${a.entityId}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {a.detail}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">{a.detail}</span>
                        )}
                      </>
                    )}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    {formatDateTime(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}

            {activity.length === 0 && (
              <li className="p-8 text-center text-xs text-muted-foreground font-mono">
                No activity entries recorded yet.
              </li>
            )}
          </ul>
        </PortalPanel>
      </div>

      <PortalMarkRule className="mt-16 w-3/4" mark="cross" />
    </>
  );
}
