import { BadgeCheck, MapPin, Clock } from "lucide-react";
import { SAMPLE_PROFILE } from "@/lib/content";
import { cn } from "@/lib/utils";

/** The PEEPs Talent Profile — what an employer sees instead of a raw CV. */
export function TalentProfileCard({ className }: { className?: string }) {
  const p = SAMPLE_PROFILE;
  return (
    <div className={cn("relative", className)}>
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-gold/10 to-transparent blur-2xl" />
      <div className="anim-rise overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-black/10">
        <div className="flex items-center justify-between border-b bg-ink px-5 py-3.5 text-ink-foreground">
          <span className="font-mono text-xs tracking-wider text-white/70">{p.pepId}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-gold-foreground">
            <BadgeCheck className="size-3" /> PEEPs Ready
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Sample talent profile</p>
          <h3 className="font-display mt-1 text-2xl font-medium">{p.profession}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {p.location}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {p.availability}</span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              ["Experience", p.experience],
              ["Qualification", p.qualification],
              ["Professional", p.professional],
              ["Classification", p.classification],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 rounded-2xl bg-muted/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence on file</p>
            <ul className="mt-3 grid gap-2">
              {p.checks.map((c, i) => (
                <li
                  key={c.label}
                  className="anim-rise flex items-center justify-between text-sm"
                  style={{ animationDelay: `${600 + i * 120}ms` }}
                >
                  <span>{c.label}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <BadgeCheck className="size-3.5" />
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div
        className="anim-rise absolute -bottom-5 -left-4 hidden rounded-2xl border bg-card px-4 py-3 shadow-xl sm:block"
        style={{ animationDelay: "1500ms" }}
      >
        <p className="text-xs text-muted-foreground">Employer receives</p>
        <p className="font-display text-lg font-medium">5 candidates, not 100 CVs</p>
      </div>
    </div>
  );
}
