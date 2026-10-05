import { RUBRIC_LEVELS, type AssessmentTemplate } from "@/lib/taxonomy";

/** Rubric scores as 4-step meters with the level named (never a bare number). */
export function ScoreGrid({ template, scores }: { template: AssessmentTemplate; scores: Record<string, number> }) {
  return (
    <dl className="grid gap-2.5 sm:grid-cols-2">
      {template.criteria.map((c) => {
        const v = scores[c.key] ?? 0;
        const level = RUBRIC_LEVELS.find((l) => l.value === v);
        return (
          <div key={c.key}>
            <dt className="flex items-baseline justify-between gap-2 text-xs">
              <span className="font-medium">{c.label}</span>
              <span className="text-muted-foreground">{level?.label ?? "—"}</span>
            </dt>
            <dd className="mt-1 flex gap-1" aria-label={`${c.label}: ${level?.label ?? "not scored"}`}>
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= v ? "var(--chart-1)" : "var(--muted)" }} />
              ))}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
