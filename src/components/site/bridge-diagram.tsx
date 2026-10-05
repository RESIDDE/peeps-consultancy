import { ArrowDown, ArrowRight, Building2, GraduationCap, ShieldCheck } from "lucide-react";

const COLUMNS = [
  {
    icon: GraduationCap,
    title: "Training ecosystem",
    caption: "Where talent is developed",
    items: ["ACCA, ICAN & modelling schools", "Automotive & technical centres", "IT academies", "Universities & polytechnics"],
  },
  {
    icon: ShieldCheck,
    title: "PEEPs quality layer",
    caption: "Where talent is proven",
    items: ["Screen & verify", "Interview & assess", "Classify with evidence", "Match to the vacancy"],
    highlight: true,
  },
  {
    icon: Building2,
    title: "Employers",
    caption: "Where talent is deployed",
    items: ["SMEs & professional firms", "Banks & audit firms", "Dealerships & fleets", "Hotels, NGOs, manufacturers"],
  },
];

/** PEEPs as the bridge between education and employment, with the feedback loop. */
export function BridgeDiagram() {
  return (
    <div className="relative">
      <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr] lg:gap-4">
        {COLUMNS.map((c, i) => (
          <div key={c.title} className="contents">
            <div
              className={
                c.highlight
                  ? "rounded-3xl bg-gold p-6 text-gold-foreground shadow-xl shadow-gold/20"
                  : "rounded-3xl border border-white/10 bg-white/[0.04] p-6"
              }
            >
              <c.icon className={c.highlight ? "size-6" : "size-6 text-gold"} />
              <p className={c.highlight ? "mt-5 text-xs font-semibold uppercase tracking-[0.14em] opacity-70" : "mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-white/50"}>
                {c.caption}
              </p>
              <h3 className="font-display mt-1 text-2xl font-medium">{c.title}</h3>
              <ul className="mt-4 grid gap-2 text-sm">
                {c.items.map((it) => (
                  <li key={it} className={c.highlight ? "" : "text-white/75"}>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
            {i < COLUMNS.length - 1 && (
              <div className="flex items-center justify-center text-gold" aria-hidden>
                <ArrowRight className="hidden size-6 lg:block" />
                <ArrowDown className="size-5 lg:hidden" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-white/20 px-5 py-4 text-sm text-white/75">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">↺</span>
        <p>
          <span className="font-semibold text-white">Employer feedback loop.</span> After every placement we ask what was strong,
          what was weak and which skills were missing. We share that with training partners so they can strengthen the next cohort.
        </p>
      </div>
    </div>
  );
}
