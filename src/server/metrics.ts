import { and, count, desc, eq, gte, inArray, isNotNull, lte, sum } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, candidates, employers, placements, revenueEntries, user, vacancies } from "@/db/schema";
import { STAGES, stageIndex } from "@/lib/quality";
import { OPEN_VACANCY_STATUSES, REVENUE_STREAMS } from "@/lib/pipeline";

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

