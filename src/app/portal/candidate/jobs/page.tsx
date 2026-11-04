import { and, eq, inArray } from "drizzle-orm";
import { Briefcase, MapPin } from "lucide-react";
import { db } from "@/db";
import { applications, vacancies } from "@/db/schema";
import { PortalPageHeader, PortalTag } from "@/components/portal/portal-kit";
import { ActionForm } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
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
    db
      .select()
      .from(vacancies)
      .where(and(eq(vacancies.published, true), inArray(vacancies.status, OPEN_VACANCY_STATUSES))),
    db.select({ vacancyId: applications.vacancyId }).from(applications).where(eq(applications.candidateId, c.id)),
  ]);

  const applied = new Set(mine.map((m) => m.vacancyId));
  const ranked = open.map((v) => ({ v, score: scoreMatch(c, v).total })).sort((a, b) => b.score - a.score);

  return (
    <>
      <PortalPageHeader
        label="NIGERIA & DIASPORA // MANDATES"
        title="Open Opportunities"
        lede="Vetted roles actively recruiting through PEEPs, ordered by algorithmic match with your verified profile. Client company identities are disclosed once your profile is shortlisted."
      />

      {ranked.length === 0 ? (
        <div className="rounded-[7px] border border-dashed border-border p-12 text-center">
          <Briefcase className="mx-auto size-6 text-muted-foreground mb-3" />
          <h2 className="font-display text-lg text-foreground">No open roles currently published</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-[42ch] mx-auto">
            PEEPs consultants will directly propose your profile when client mandates match your sector and verification level.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {ranked.map(({ v, score }) => (
            <li
              key={v.id}
              className="flex flex-col justify-between rounded-[7px] border border-border bg-card/60 p-6 md:p-7 backdrop-blur-xs transition-colors hover:border-foreground/30"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {sectorName(v.sectorCode)} · REF: {v.ref}
                    </p>
                    <h2 className="font-display text-xl font-medium mt-1 text-foreground">
                      {v.title}
                    </h2>
                  </div>

                  <span className="shrink-0 rounded-[4px] border border-primary/40 bg-primary/10 px-2.5 py-1 text-center font-mono text-primary">
                    <span className="block text-base font-bold leading-none">{score}%</span>
                    <span className="text-[9px] uppercase tracking-wider">match</span>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {v.city || "Nigeria"}
                  </span>
                  <span>·</span>
                  <span>{labelOf(EMPLOYMENT_TYPES, v.employmentType)}</span>
                  <span>·</span>
                  <span>{salaryRange(v.salaryMin, v.salaryMax)} /mo</span>
                  <span>·</span>
                  <span>{v.experienceMin}+ yrs exp</span>
                </div>

                {v.description && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {v.description}
                  </p>
                )}

                {v.requiredSkills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {v.requiredSkills.map((s) => {
                      const has = [...c.skills, ...c.software].some((x) => x.toLowerCase() === s.toLowerCase());
                      return (
                        <span
                          key={s}
                          className={
                            has
                              ? "rounded-[3px] border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[0.7rem] text-primary"
                              : "rounded-[3px] border border-border bg-muted/40 px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
                          }
                        >
                          {has ? "✓ " : ""}
                          {s}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="font-mono text-xs text-muted-foreground">
                  {v.deadline ? `Closes ${formatDate(v.deadline)}` : "Ongoing selection"}
                </span>

                {applied.has(v.id) ? (
                  <PortalTag variant="solid">Application Submitted</PortalTag>
                ) : (
                  <ActionForm action={applyToVacancy}>
                    <input type="hidden" name="vacancyId" value={v.id} />
                    <SubmitButton
                      size="sm"
                      pendingText="Submitting…"
                      className="rounded-[5px] font-mono text-xs uppercase tracking-wider"
                    >
                      Apply Now
                    </SubmitButton>
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
