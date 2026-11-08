import { and, count, desc, eq, gte, inArray, isNotNull, lte, ne, sum } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, candidates, employers, enquiries, placements, revenueEntries, user, vacancies } from "@/db/schema";
import { STAGES, stageIndex } from "@/lib/quality";
import { OPEN_VACANCY_STATUSES, REVENUE_STREAMS } from "@/lib/pipeline";
import { OPEN_STATUSES } from "@/lib/submissions";

const ACTIVE_CRM = ["pilot", "placement", "retention", "repeat"];

function lastMonths(n: number): { key: string; label: string; start: Date; end: Date }[] {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    out.push({
      key: `${start.getFullYear()}-${start.getMonth()}`,
      label: start.toLocaleString("en-GB", { month: "short" }),
      start,
      end,
    });
  }
  return out;
}

export async function overviewMetrics() {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const months = lastMonths(6);

  const [stageRows, employerRows, openVacancies, placementRows, revenueYtd, streamRows, revenueRows, candidateDates] =
    await Promise.all([
      db.select({ stage: candidates.stage, n: count() }).from(candidates).groupBy(candidates.stage),
      db.select({ stage: employers.crmStage, n: count() }).from(employers).groupBy(employers.crmStage),
      db.select({ n: count() }).from(vacancies).where(inArray(vacancies.status, OPEN_VACANCY_STATUSES)),
      db
        .select({
          createdAt: placements.createdAt,
          vacancyCreated: vacancies.createdAt,
          retention3m: placements.retention3m,
          retention6m: placements.retention6m,
          feedback: placements.feedback,
        })
        .from(placements)
        .innerJoin(vacancies, eq(vacancies.id, placements.vacancyId)),
      db.select({ total: sum(revenueEntries.amount) }).from(revenueEntries).where(gte(revenueEntries.date, yearStart)),
      db.select({ stream: revenueEntries.stream, total: sum(revenueEntries.amount) }).from(revenueEntries).groupBy(revenueEntries.stream),
      db
        .select({ date: revenueEntries.date, amount: revenueEntries.amount })
        .from(revenueEntries)
        .where(gte(revenueEntries.date, months[0].start)),
      db.select({ createdAt: candidates.createdAt }).from(candidates).where(gte(candidates.createdAt, months[0].start)),
    ]);

  const byStage = Object.fromEntries(stageRows.map((r) => [r.stage, r.n])) as Record<string, number>;
  const totalCandidates = stageRows.reduce((s, r) => s + r.n, 0);
  /** Funnel: candidates who have reached at least each stage. */
  const funnel = STAGES.map((s) => ({
    stage: s,
    value: stageRows.filter((r) => stageIndex(r.stage) >= stageIndex(s)).reduce((a, r) => a + r.n, 0),
  }));

  const decided3m = placementRows.filter((p) => p.retention3m !== "pending");
  const retained3m = decided3m.filter((p) => p.retention3m === "retained").length;
  const daysToPlace = placementRows.map((p) => (p.createdAt.getTime() - p.vacancyCreated.getTime()) / 86_400_000).filter((d) => d > 0);
  const ratings = placementRows.map((p) => p.feedback?.rating).filter((r): r is number => typeof r === "number");

  const monthly = months.map((m) => ({
    label: m.label,
    value: revenueRows.filter((r) => r.date >= m.start && r.date < m.end).reduce((s, r) => s + r.amount, 0),
  }));
  const registrations = months.map((m) => ({
    label: m.label,
    value: candidateDates.filter((r) => r.createdAt >= m.start && r.createdAt < m.end).length,
  }));
  const streams = REVENUE_STREAMS.map((s) => ({
    label: s.label,
    value: Number(streamRows.find((r) => r.stream === s.value)?.total ?? 0),
  }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  return {
    totalCandidates,
    jobReady: (byStage.peeps_ready ?? 0) + (byStage.recommended ?? 0),
    placed: placementRows.length,
    funnel,
    activeEmployers: employerRows.filter((r) => ACTIVE_CRM.includes(r.stage)).reduce((s, r) => s + r.n, 0),
    totalEmployers: employerRows.reduce((s, r) => s + r.n, 0),
    openVacancies: openVacancies[0].n,
    revenueYtd: Number(revenueYtd[0].total ?? 0),
    avgDaysToPlace: daysToPlace.length ? Math.round(daysToPlace.reduce((a, b) => a + b, 0) / daysToPlace.length) : null,
    retention3m: decided3m.length ? Math.round((retained3m / decided3m.length) * 100) : null,
    retentionSample: decided3m.length,
    avgRating: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null,
    monthly,
    registrations,
    streams,
  };
}

export async function upcomingActions(days = 14) {
  const horizon = new Date(Date.now() + days * 86_400_000);
  return db
    .select({ id: employers.id, name: employers.name, nextAction: employers.nextAction, nextActionAt: employers.nextActionAt, crmStage: employers.crmStage })
    .from(employers)
    .where(and(isNotNull(employers.nextActionAt), lte(employers.nextActionAt, horizon)))
    .orderBy(employers.nextActionAt)
    .limit(8);
}

export async function recentActivity(limit = 12) {
  return db
    .select({
      id: activityLog.id,
      entity: activityLog.entity,
      entityId: activityLog.entityId,
      action: activityLog.action,
      detail: activityLog.detail,
      createdAt: activityLog.createdAt,
      actor: user.name,
    })
    .from(activityLog)
    .leftJoin(user, eq(user.id, activityLog.actorId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}

/** Employer feedback loop: what employers say placed talent was missing. */
export async function feedbackInsights() {
  const rows = await db
    .select({ feedback: placements.feedback, employer: employers.name, title: vacancies.title })
    .from(placements)
    .innerJoin(employers, eq(employers.id, placements.employerId))
    .innerJoin(vacancies, eq(vacancies.id, placements.vacancyId))
    .where(isNotNull(placements.feedback))
    .orderBy(desc(placements.feedbackAt));
  return rows.filter((r) => r.feedback);
}


/* ------------------------------------------------------------------ */
/* The submission inbox                                                */
/*                                                                     */
/* What the console needs to show that every form on the site has been  */
/* received: how many of each, how many unanswered, what arrived last,  */
/* and which bookings are coming up.                                   */
/* ------------------------------------------------------------------ */

export interface InboxCounts {
  /** Per tag: everything ever, and what is still open. */
  byType: Record<string, { total: number; open: number; unanswered: number }>;
  /** Submissions sitting at "new" and owing a reply — the sidebar badge. */
  unanswered: number;
  /** Everything not closed. */
  open: number;
  total: number;
  /** This calendar month, for the dashboard card. */
  thisMonth: number;
  /** Median hours from arrival to somebody picking it up, over the last 50 handled. */
  medianResponseHours: number | null;
}

export async function inboxCounts(): Promise<InboxCounts> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [rows, monthRows, handled] = await Promise.all([
    db.select({ type: enquiries.type, status: enquiries.status, n: count() }).from(enquiries).groupBy(enquiries.type, enquiries.status),
    db.select({ n: count() }).from(enquiries).where(gte(enquiries.createdAt, monthStart)),
    db
      .select({ createdAt: enquiries.createdAt, handledAt: enquiries.handledAt })
      .from(enquiries)
      .where(isNotNull(enquiries.handledAt))
      .orderBy(desc(enquiries.createdAt))
      .limit(50),
  ]);

  const byType: InboxCounts["byType"] = {};
  for (const r of rows) {
    const bucket = (byType[r.type] ??= { total: 0, open: 0, unanswered: 0 });
    bucket.total += r.n;
    if (OPEN_STATUSES.includes(r.status)) bucket.open += r.n;
    if (r.status === "new") bucket.unanswered += r.n;
  }

  const hours = handled
    .map((h) => (h.handledAt!.getTime() - h.createdAt.getTime()) / 3_600_000)
    .filter((h) => h >= 0)
    .sort((a, b) => a - b);

  return {
    byType,
    unanswered: Object.values(byType).reduce((s, b) => s + b.unanswered, 0),
    open: Object.values(byType).reduce((s, b) => s + b.open, 0),
    total: Object.values(byType).reduce((s, b) => s + b.total, 0),
    thisMonth: monthRows[0].n,
    medianResponseHours: hours.length ? Math.round(hours[Math.floor(hours.length / 2)] * 10) / 10 : null,
  };
}

/** The latest arrivals, whatever form they came from. */
export async function recentSubmissions(limit = 8) {
  return db
    .select({
      id: enquiries.id,
      type: enquiries.type,
      name: enquiries.name,
      organisation: enquiries.organisation,
      subject: enquiries.subject,
      status: enquiries.status,
      createdAt: enquiries.createdAt,
    })
    .from(enquiries)
    .orderBy(desc(enquiries.createdAt))
    .limit(limit);
}

/** The oldest forms still at New: the ones somebody owes a reply, longest-waiting first. */
export async function awaitingReply(limit = 6) {
  return db
    .select({
      id: enquiries.id,
      type: enquiries.type,
      name: enquiries.name,
      organisation: enquiries.organisation,
      subject: enquiries.subject,
      createdAt: enquiries.createdAt,
    })
    .from(enquiries)
    .where(eq(enquiries.status, "new"))
    .orderBy(enquiries.createdAt)
    .limit(limit);
}

/**
 * Submissions with a date attached that hasn't passed: Auto Check inspections, compliance
 * deadlines, hiring deadlines. The one view that answers "where does somebody have to be".
 */
export async function upcomingBookings(limit = 8) {
  return db
    .select({
      id: enquiries.id,
      type: enquiries.type,
      name: enquiries.name,
      organisation: enquiries.organisation,
      subject: enquiries.subject,
      status: enquiries.status,
      dueAt: enquiries.dueAt,
      details: enquiries.details,
    })
    .from(enquiries)
    .where(and(isNotNull(enquiries.dueAt), gte(enquiries.dueAt, startOfToday()), ne(enquiries.status, "closed")))
    .orderBy(enquiries.dueAt)
    .limit(limit);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
