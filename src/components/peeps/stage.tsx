import { Check, Circle, X, Minus } from "lucide-react";
import { STAGES, STAGE_META, stageIndex, type Stage, type CheckStatus } from "@/lib/quality";
import { CLASSIFICATIONS, labelOf } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  const meta = STAGE_META[stage as Stage];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        borderColor: `color-mix(in oklab, var(--stage-${stage}) 45%, transparent)`,
        background: `color-mix(in oklab, var(--stage-${stage}) 12%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: `var(--stage-${stage})` }} />
      {meta?.label ?? stage}
    </span>
  );
}

/** Compact seven-segment ladder used in tables, cards and dashboards. */
export function LadderBar({ stage, className, showLabels = false }: { stage: string; className?: string; showLabels?: boolean }) {
  const idx = stageIndex(stage);
  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-1" role="img" aria-label={`Quality stage: ${STAGE_META[stage as Stage]?.label ?? stage}`}>
        {STAGES.map((s, i) => (
          <span
            key={s}
            className="h-1.5 flex-1 rounded-full bg-muted"
            style={i <= idx ? { background: `var(--stage-${s})` } : undefined}
          />
        ))}
      </div>
      {showLabels && (
        <div className="mt-2 flex gap-1">
          {STAGES.map((s, i) => (
            <span key={s} className={cn("flex-1 truncate text-[10px]", i === idx ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {STAGE_META[s].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Vertical step list with what each stage needs — candidate portal & record. */
export function LadderSteps({ stage }: { stage: string }) {
  const idx = stageIndex(stage);
  return (
    <ol className="grid gap-0">
      {STAGES.map((s, i) => {
        const done = i <= idx;
        const current = i === idx;
        return (
          <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
            {i < STAGES.length - 1 && (
              <span className={cn("absolute left-[11px] top-6 h-[calc(100%-1rem)] w-0.5", i < idx ? "bg-primary" : "bg-border")} />
            )}
            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                done ? "border-transparent text-white" : "border-border bg-card text-muted-foreground",
                current && "ring-4 ring-primary/15",
              )}
              style={done ? { background: `var(--stage-${s})` } : undefined}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <div className="-mt-0.5">
              <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>
                {STAGE_META[s].label}
                {current && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Current</span>}
              </p>
              <p className="text-xs text-muted-foreground">{STAGE_META[s].description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const CHECK_STYLE: Record<CheckStatus, { label: string; cls: string; Icon: typeof Check }> = {
  passed: { label: "Passed", cls: "bg-primary/10 text-primary", Icon: Check },
  failed: { label: "Failed", cls: "bg-destructive/10 text-destructive", Icon: X },
  pending: { label: "Pending", cls: "bg-warning/10 text-warning", Icon: Circle },
  not_applicable: { label: "N/A", cls: "bg-muted text-muted-foreground", Icon: Minus },
};

export function CheckStatusBadge({ status }: { status: string | null | undefined }) {
  const s = CHECK_STYLE[(status as CheckStatus) ?? "pending"] ?? null;
  if (!status || !s) {
    return <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">Not started</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>
      <s.Icon className="size-3" /> {s.label}
    </span>
  );
}

export function ClassificationBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-xs text-muted-foreground">Unclassified</span>;
  return (
    <span className="inline-flex items-center rounded-md bg-gold-soft px-2 py-0.5 text-xs font-semibold text-[color-mix(in_oklab,var(--gold)_55%,var(--foreground))]">
      {labelOf(CLASSIFICATIONS, value)}
    </span>
  );
}
