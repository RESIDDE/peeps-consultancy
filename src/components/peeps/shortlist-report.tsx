import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { applications, assessments, candidates, employers, vacancies, verificationChecks } from "@/db/schema";
import { TalentReport } from "./talent-report";
import { Logo } from "@/components/brand/logo";
import { EmptyState } from "./blocks";
import { SHORTLISTED_OR_LATER } from "@/lib/pipeline";
import { sectorName } from "@/lib/taxonomy";
import type { CheckRecord } from "@/lib/quality";
import { formatDate, salaryRange } from "@/lib/format";
import { Users } from "lucide-react";

/** Contact details are released only once the employer has agreed to interview. */
const CONTACT_STAGES = ["client_interview", "offer", "placed"];

export async function loadShortlist(vacancyId: string) {
  const [vac] = await db
    .select({ v: vacancies, employer: employers.name })
    .from(vacancies)
    .innerJoin(employers, eq(employers.id, vacancies.employerId))
    .where(eq(vacancies.id, vacancyId));
  if (!vac) return null;
  const apps = await db
    .select({ app: applications, c: candidates })
    .from(applications)
    .innerJoin(candidates, eq(candidates.id, applications.candidateId))
    .where(eq(applications.vacancyId, vacancyId));
  const shortlisted = apps.filter((a) => SHORTLISTED_OR_LATER.includes(a.app.stage as never));
  const ids = shortlisted.map((s) => s.c.id);
  const [checks, as] = ids.length
    ? await Promise.all([
        db.select().from(verificationChecks).where(inArray(verificationChecks.candidateId, ids)),
        db.select().from(assessments).where(inArray(assessments.candidateId, ids)).orderBy(desc(assessments.assessedAt)),
      ])
    : [[], []];
  return {
    ...vac,
    entries: shortlisted
      .sort((a, b) => (b.app.matchScore ?? 0) - (a.app.matchScore ?? 0))
      .map((s) => ({
        ...s,
        checks: checks.filter((x) => x.candidateId === s.c.id) as unknown as CheckRecord[],
        assessments: as.filter((x) => x.candidateId === s.c.id),
        showContact: CONTACT_STAGES.includes(s.app.stage),
      })),
  };
}

export function ShortlistHeader({ v, employer }: { v: typeof vacancies.$inferSelect; employer: string }) {
  return (
    <div className="mb-6 border-b pb-6">
      <div className="flex items-start justify-between gap-4">
        <Logo />
        <p className="text-right text-xs text-muted-foreground">
          Shortlist report · {v.ref}
          <br />
          {formatDate(new Date())}
        </p>
      </div>
      <h1 className="font-display mt-8 text-3xl font-medium sm:text-4xl">
        {v.title} {v.headcount > 1 && <span className="text-muted-foreground">× {v.headcount}</span>}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Prepared for {employer} · {sectorName(v.sectorCode)} · {v.city ?? ""} · {salaryRange(v.salaryMin, v.salaryMax)} / month
      </p>
      {v.analysisNotes && (
        <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Our understanding of the role</p>
          <p className="mt-1.5 leading-relaxed">{v.analysisNotes}</p>
        </div>
      )}
    </div>
  );
}

export function ShortlistBody({ entries }: { entries: NonNullable<Awaited<ReturnType<typeof loadShortlist>>>["entries"] }) {
  if (entries.length === 0) {
    return <EmptyState icon={Users} title="No candidates shortlisted yet" body="Candidates appear here once they are PEEPs Ready and assessed against this vacancy." />;
  }
  return (
    <div className="grid gap-6">
      {entries.map((e) => (
        <TalentReport
          key={e.app.id}
          candidate={e.c}
          checks={e.checks}
          assessments={e.assessments}
          showContact={e.showContact}
          summary={e.app.shortlistSummary}
          matchScore={e.app.matchScore}
        />
      ))}
      <p className="text-center text-[11px] text-muted-foreground">
        Each candidate has been verified and assessed under the published PEEPs methodology. Full names and contact details are
        released when you request an interview. Confidential: do not distribute.
      </p>
    </div>
  );
}
