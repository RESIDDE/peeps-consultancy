import { cn } from "@/lib/utils";

/**
 * Where the visitor is in a short form: what this step is for, "Step 1 of 2", and a bar per
 * step. The newest filled bar draws in from the left as the step is reached.
 */
export function StepHeader({
  step,
  of = 2,
  title,
  className,
}: {
  step: number;
  of?: number;
  /** What this step asks for, e.g. "Your email". */
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3", className)}>
      <p className="label flex items-baseline justify-between gap-4 text-muted-foreground">
        <span className="text-foreground">{title}</span>
        <span>
          Step {step} of {of}
        </span>
      </p>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: of }, (_, i) => (
          <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-border">
            {i < step && <span className={cn("block h-full bg-foreground", i > 0 && i === step - 1 && "anim-fill")} />}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The address a code went to, with the way back to change it. Sits at the top of a code
 * step, so going back is the first thing in view rather than a link at the bottom.
 */
export function SentTo({ email, onChange, changeLabel }: { email: string; onChange: () => void; changeLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[7px] border border-border px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">Code sent to</p>
        <p className="truncate text-[0.95rem] font-medium">{email}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="-my-2 shrink-0 py-2 text-sm underline underline-offset-4 transition-opacity duration-200 hover:opacity-60"
      >
        {changeLabel}
      </button>
    </div>
  );
}
