import { ArrowDown, ArrowRight, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = [
  {
    caption: "Where talent is developed",
    title: "Training ecosystem",
    items: ["ACCA, ICAN & modelling schools", "Automotive & technical centres", "IT academies", "Universities & polytechnics"],
    pick: false,
  },
  {
    caption: "Where talent is proven",
    title: "The PEEPs quality layer",
    items: ["Screen & verify", "Interview & assess", "Classify with evidence", "Match to the vacancy"],
    pick: true,
  },
  {
    caption: "Where talent is deployed",
    title: "Employers",
    items: ["SMEs & professional firms", "Banks & audit firms", "Dealerships & fleets", "Hotels, NGOs, manufacturers"],
    pick: false,
  },
] as const;

/**
 * PEEPs as the span between education and employment: three ruled columns with the
 * quality layer inverted in the middle, and the feedback loop running back underneath.
 */
export function Bridge() {
  return (
    <div>
      <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr] lg:gap-5">
        {COLUMNS.map((col, i) => (
          <div key={col.title} className="contents">
            <div
              className={cn(
                "flex flex-col rounded-[7px] border p-7",
                col.pick ? "border-foreground bg-foreground text-background" : "border-border",
              )}
            >
              <p className={cn("label", col.pick ? "opacity-60" : "text-muted-foreground")}>{col.caption}</p>
              <h3 className="subhead mt-6 text-[clamp(1.35rem,1.9vw,1.8rem)]">{col.title}</h3>
              <ul className="mt-8 grid">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className={cn(
                      "border-t py-3 text-[0.95rem] leading-snug last:border-b",
                      col.pick ? "border-background/20" : "border-border text-muted-foreground",
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {i < COLUMNS.length - 1 && (
              <div aria-hidden className="flex items-center justify-center py-2 lg:py-0">
                <ArrowRight className="hidden size-5 lg:block" strokeWidth={1.25} />
                <ArrowDown className="size-5 lg:hidden" strokeWidth={1.25} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-5 border-t border-border pt-6">
        <Undo2 aria-hidden className="mt-0.5 size-5 shrink-0 scale-x-[-1]" strokeWidth={1.25} />
        <p className="max-w-[72ch] text-[0.95rem] leading-snug text-muted-foreground">
          <span className="label text-foreground">The employer feedback loop.</span> After every placement we ask what was
          strong, what was weak and which skills were missing, then share that with training partners so they can strengthen
          the next cohort.
        </p>
      </div>
    </div>
  );
}
