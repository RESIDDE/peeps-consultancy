import { and, eq, inArray } from "drizzle-orm";
import { Briefcase, MapPin } from "lucide-react";
import { db } from "@/db";
import { applications, vacancies } from "@/db/schema";
import { EmptyState } from "@/components/peeps/blocks";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { applyToVacancy } from "@/server/actions/portal";
import { currentCandidate } from "@/server/portal";
import { scoreMatch } from "@/lib/matching";
import { OPEN_VACANCY_STATUSES } from "@/lib/pipeline";
import { EMPLOYMENT_TYPES, labelOf, sectorName } from "@/lib/taxonomy";
import { formatDate, salaryRange } from "@/lib/format";

export const metadata = { title: "Opportunities" };

export default async function JobsPage() {
  const { candidate: c } = await currentCandidate();
  const [open, mine] = await Promise.all([
    db.select().from(vacancies).where(and(eq(vacancies.published, true), inArray(vacancies.status, OPEN_VACANCY_STATUSES))),
    db.select({ vacancyId: applications.vacancyId }).from(applications).where(eq(applications.candidateId, c.id)),
  ]);
  const applied = new Set(mine.map((m) => m.vacancyId));
  const ranked = open.map((v) => ({ v, score: scoreMatch(c, v).total })).sort((a, b) => b.score - a.score);

  return (
    <>
      <h1 className="font-display text-3xl font-medium sm:text-4xl">Opportunities</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Open roles PEEPs is recruiting for, ranked by how closely they match your profile. Employer names are shared once you&apos;re
        shortlisted.
      </p>
      {ranked.length === 0 ? (
        <EmptyState icon={Briefcase} title="No open roles right now" body="We'll also put you forward for roles that match your profile." className="mt-8" />
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {ranked.map(({ v, score }) => (
            <li key={v.id} className="flex flex-col rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{sectorName(v.sectorCode)} · {v.ref}</p>
                  <h2 className="mt-1 text-lg font-semibold">{v.title}</h2>
                </div>
                <span className="shrink-0 rounded-lg bg-secondary px-2 py-1 text-center text-secondary-foreground">
                  <span className="block text-lg font-semibold leading-none">{score}%</span>
                  <span className="text-[10px]">match</span>
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{v.city}</span>
                <span>{labelOf(EMPLOYMENT_TYPES, v.employmentType)}</span>
                <span>{salaryRange(v.salaryMin, v.salaryMax)} /mo</span>
                <span>{v.experienceMin}+ yrs</span>
              </div>
              {v.description && <p className="mt-3 line-clamp-3 text-sm">{v.description}</p>}
              {v.requiredSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {v.requiredSkills.map((s) => {
                    const has = [...c.skills, ...c.software].some((x) => x.toLowerCase() === s.toLowerCase());
                    return (
                      <span key={s} className={has ? "rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary" : "rounded-md bg-muted px-2 py-0.5 text-xs"}>
                        {s}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-xs text-muted-foreground">{v.deadline ? `Closes ${formatDate(v.deadline)}` : ""}</span>
                {applied.has(v.id) ? (
                  <Badge variant="solid">Applied</Badge>
                ) : (
                  <ActionForm action={applyToVacancy}>
                    <input type="hidden" name="vacancyId" value={v.id} />
                    <SubmitButton size="sm" pendingText="Applying…">Apply</SubmitButton>
                  </ActionForm>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
