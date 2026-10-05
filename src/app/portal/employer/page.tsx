import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { ArrowRight, Briefcase, PartyPopper, Star } from "lucide-react";
import { db } from "@/db";
import { applications, candidates, placements, vacancies } from "@/db/schema";
import { EmptyState, Panel, StatCard } from "@/components/peeps/blocks";
import { PlacementFeedbackForm } from "@/components/portal/feedback-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { currentEmployer } from "@/server/portal";
import { OPEN_VACANCY_STATUSES, SHORTLISTED_OR_LATER, VACANCY_STATUSES } from "@/lib/pipeline";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Overview" };

export default async function EmployerDashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { employer, contact } = await currentEmployer();
  const vacs = await db.select().from(vacancies).where(eq(vacancies.employerId, employer.id)).orderBy(desc(vacancies.createdAt));
  const ids = vacs.map((v) => v.id);
  const [shortlisted, pls] = await Promise.all([
    ids.length
      ? db.select({ vacancyId: applications.vacancyId, stage: applications.stage }).from(applications).where(inArray(applications.vacancyId, ids))
      : Promise.resolve([] as { vacancyId: string; stage: string }[]),
    db
      .select({ p: placements, first: candidates.firstName, last: candidates.lastName, title: vacancies.title })
      .from(placements)
      .innerJoin(candidates, eq(candidates.id, placements.candidateId))
      .innerJoin(vacancies, eq(vacancies.id, placements.vacancyId))
      .where(eq(placements.employerId, employer.id))
      .orderBy(desc(placements.startDate)),
  ]);
  const shortlistBy = (vid: string) => shortlisted.filter((s) => s.vacancyId === vid && SHORTLISTED_OR_LATER.includes(s.stage as never)).length;
  const open = vacs.filter((v) => OPEN_VACANCY_STATUSES.includes(v.status));
  const awaitingFeedback = pls.filter((p) => !p.p.feedback);

  return (
    <>
      {welcome && (
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-gold/50 bg-gold-soft p-5">
          <PartyPopper className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Welcome to PEEPs, {contact.name.split(" ")[0]}.</span> Request talent whenever you&apos;re
            ready. A consultant will call you to run the vacancy analysis.
          </p>
        </div>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">{employer.name}</p>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">Your talent pipeline</h1>
        </div>
        <Link href="/portal/employer/vacancies/new" className={buttonVariants()}>
          Request talent <ArrowRight />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Open vacancies" value={open.length} />
        <StatCard label="Candidates shortlisted" value={vacs.reduce((s, v) => s + shortlistBy(v.id), 0)} tone="gold" />
        <StatCard label="Hires through PEEPs" value={pls.length} />
        <StatCard label="Membership" value={employer.membershipTier === "corporate" ? "Corporate" : "Standard"} />
      </div>

      {awaitingFeedback.length > 0 && (
        <Panel className="mt-6 border-gold/50" title="How are your PEEPs hires doing?" description="Two minutes of feedback improves how we train and select talent for you.">
          <div className="grid gap-6">
            {awaitingFeedback.map(({ p, first, last, title }) => (
              <div key={p.id}>
                <p className="mb-3 text-sm font-medium">
                  {first} {last}: {title}, started {formatDate(p.startDate)}
                </p>
                <PlacementFeedbackForm placementId={p.id} />
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="mt-6" title="Vacancies" bodyClassName="p-0">
        {vacs.length === 0 ? (
          <EmptyState icon={Briefcase} title="No vacancies yet" body="Tell us who you need and we'll start with a vacancy analysis." className="m-5" action={<Link href="/portal/employer/vacancies/new" className={buttonVariants({ size: "sm" })}>Request talent</Link>} />
        ) : (
          <ul className="divide-y">
            {vacs.map((v) => {
              const n = shortlistBy(v.id);
              return (
                <li key={v.id}>
                  <Link href={`/portal/employer/vacancies/${v.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{v.title} {v.headcount > 1 && <span className="text-muted-foreground">× {v.headcount}</span>}</p>
                      <p className="text-xs text-muted-foreground">{v.ref} · opened {formatDate(v.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {n > 0 && <Badge variant="gold">{n} shortlisted</Badge>}
                      <Badge variant={v.status === "filled" ? "solid" : "outline"}>{VACANCY_STATUSES.find((s) => s.value === v.status)?.label}</Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {pls.some((p) => p.p.feedback) && (
        <Panel className="mt-6" title="Your hires" bodyClassName="p-0">
          <ul className="divide-y">
            {pls.filter((p) => p.p.feedback).map(({ p, first, last, title }) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{first} {last} · <span className="text-muted-foreground">{title}</span></span>
                <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-gold text-gold" />{p.feedback!.rating}/5</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
