import { BadgeCheck, Minus } from "lucide-react";
import type { Assessment, Candidate } from "@/db/schema";
import { ScoreGrid } from "./scores";
import { CHECK_META, CHECK_TYPES, STAGE_META, type CheckRecord, type Stage } from "@/lib/quality";
import { ASSESSMENT_TEMPLATES, AVAILABILITY, CLASSIFICATIONS, INTERVIEW_TEMPLATE, labelOf, sectorName, type TemplateKey } from "@/lib/taxonomy";
import { salaryRange } from "@/lib/format";

const EVIDENCE_LABEL: Record<string, string> = {
  passed: "Verified",
  not_applicable: "Not applicable",
};

/**
 * The PEEPs evidence profile — what an employer sees instead of a CV.
 * `showContact` is false on shortlists until an interview is agreed.
 */
export function TalentReport({
  candidate: c,
  checks,
  assessments,
  showContact,
  summary,
  matchScore,
}: {
  candidate: Candidate;
  checks: CheckRecord[];
  assessments: Assessment[];
  showContact: boolean;
  summary?: string | null;
  matchScore?: number | null;
}) {
  const latest = (kind: "interview" | "technical") => assessments.find((a) => a.kind === kind && a.outcome === "recommend");
  const interview = latest("interview");
  const technical = latest("technical");
  const techTemplate = technical ? ASSESSMENT_TEMPLATES[technical.template as TemplateKey] : null;
  const shownChecks = CHECK_TYPES.filter((t) => t !== "cv_review" && t !== "readiness");

  return (
    <article className="print-avoid overflow-hidden rounded-2xl border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b bg-muted/40 px-6 py-5">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{c.pepId}</p>
          <h2 className="font-display mt-1 text-2xl font-medium">
            {showContact ? `${c.firstName} ${c.lastName}` : `${c.firstName} ${c.lastName.charAt(0)}.`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {c.profession} · {sectorName(c.sectorCode)} · {c.yearsExperience} yrs · {c.city}
          </p>
          {showContact && (
            <p className="mt-1 text-sm">
              {c.email}
              {c.phone ? ` · ${c.phone}` : ""}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Classification</p>
          <p className="font-display text-xl font-medium">{labelOf(CLASSIFICATIONS, c.classification)}</p>
          <p className="text-xs text-muted-foreground">{STAGE_META[c.stage as Stage]?.label}</p>
          {matchScore != null && <p className="mt-1 text-xs font-medium text-primary">{matchScore}% vacancy match</p>}
        </div>
      </header>

      <div className="grid gap-6 px-6 py-5 md:grid-cols-[1.3fr_1fr]">
        <div className="grid content-start gap-5">
          {summary && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why this candidate</h3>
              <p className="mt-1.5 text-sm leading-relaxed">{summary}</p>
            </section>
          )}
          {c.classificationRationale && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Classification rationale</h3>
              <p className="mt-1.5 text-sm leading-relaxed">{c.classificationRationale}</p>
            </section>
          )}
          {techTemplate && technical && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{techTemplate.name}</h3>
              <ScoreGrid template={techTemplate} scores={technical.scores} />
              {technical.evidence && <p className="mt-2 text-xs text-muted-foreground">{technical.evidence}</p>}
            </section>
          )}
          {interview && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">PEEPs interview</h3>
              <ScoreGrid template={INTERVIEW_TEMPLATE} scores={interview.scores} />
            </section>
          )}
          {c.experience.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience</h3>
              <ul className="mt-1.5 grid gap-1.5 text-sm">
                {c.experience.map((e, i) => (
                  <li key={i}>
                    <span className="font-medium">{e.title}</span>, {showContact ? e.employer : "employer disclosed at interview"}
                    <span className="text-muted-foreground"> · {[e.start, e.end].filter(Boolean).join("–")}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="grid content-start gap-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence on file</h3>
            <ul className="mt-2 grid gap-1.5">
              {shownChecks.map((t) => {
                const ch = checks.find((x) => x.type === t);
                const ok = ch && (ch.status === "passed" || ch.status === "not_applicable");
                return (
                  <li key={t} className="flex items-center justify-between gap-2 text-sm">
                    <span>{CHECK_META[t].label}</span>
                    {ok ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        {ch.status === "passed" ? <BadgeCheck className="size-3.5" /> : <Minus className="size-3.5" />}
                        {EVIDENCE_LABEL[ch.status]}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not yet</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Availability</p>
              <p className="font-medium">{labelOf(AVAILABILITY, c.availability)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expectation /mo</p>
              <p className="font-medium">{salaryRange(c.salaryMin, c.salaryMax)}</p>
            </div>
          </section>
          {[
            ["Qualifications", c.qualifications],
            ["Skills", [...c.skills, ...c.software]],
          ].map(([k, v]) =>
            (v as string[]).length ? (
              <section key={k as string}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k as string}</h3>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(v as string[]).map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              </section>
            ) : null,
          )}
          {c.education.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Education</h3>
              <ul className="mt-1.5 grid gap-1 text-sm">
                {c.education.map((e, i) => (
                  <li key={i}>
                    {e.qualification} <span className="text-muted-foreground">· {e.institution}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
