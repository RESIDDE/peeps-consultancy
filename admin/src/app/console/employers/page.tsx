import Link from "next/link";
import { count, inArray } from "drizzle-orm";
import { CalendarClock } from "lucide-react";
import { db } from "@/db";
import { employers, vacancies } from "@/db/schema";
import { PageHeader } from "@/components/peeps/blocks";
import { ActionForm } from "@/components/ui/action-form";
import { AutoSubmitSelect } from "@/components/ui/auto-submit-select";
import { buttonVariants } from "@/components/ui/button";
import { moveEmployerStage } from "@/server/actions/console";
import { CRM_STAGES, OPEN_VACANCY_STATUSES } from "@/lib/pipeline";
import { isPast, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Employers" };

export default async function EmployersBoard() {
  const [rows, open] = await Promise.all([
    db.select().from(employers).orderBy(employers.nextActionAt),
    db
      .select({ employerId: vacancies.employerId, n: count() })
      .from(vacancies)
      .where(inArray(vacancies.status, OPEN_VACANCY_STATUSES))
      .groupBy(vacancies.employerId),
  ]);
  const openBy = Object.fromEntries(open.map((o) => [o.employerId, o.n]));

  return (
    <>
      <PageHeader
        title="Employer pipeline"
        description="Target → Research → Contact → Discovery → Proposal → Pilot → Placement → Retention → Repeat business."
        actions={<Link href="/console/employers/new" className={buttonVariants({ size: "sm" })}>Add employer</Link>}
      />
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex min-w-max gap-3">
          {CRM_STAGES.map((stage) => {
            const items = rows.filter((r) => r.crmStage === stage.value);
            return (
              <section key={stage.value} className="flex w-64 shrink-0 flex-col rounded-2xl bg-muted/60 p-2.5" aria-label={stage.label}>
                <header className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
                  <div>
                    <h2 className="text-sm font-semibold">{stage.label}</h2>
                    <p className="text-[11px] text-muted-foreground">{stage.hint}</p>
                  </div>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium tabular-nums">{items.length}</span>
                </header>
                <ul className="grid gap-2">
                  {items.map((e) => {
                    const overdue = isPast(e.nextActionAt);
                    return (
                      <li key={e.id} className="rounded-xl border bg-card p-3 shadow-xs">
                        <Link href={`/console/employers/${e.id}`} className="block text-sm font-semibold hover:text-primary">
                          {e.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {[e.industry, e.city].filter(Boolean).join(" · ")}
                        </p>
                        {e.nextAction && (
                          <p className="mt-2 flex items-start gap-1.5 text-xs">
                            <CalendarClock className={cn("mt-0.5 size-3.5 shrink-0", overdue ? "text-destructive" : "text-muted-foreground")} />
                            <span>
                              {e.nextAction}{" "}
                              <span className={overdue ? "font-medium text-destructive" : "text-muted-foreground"}>· {relativeDays(e.nextActionAt)}</span>
                            </span>
                          </p>
                        )}
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          {openBy[e.id] ? (
                            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                              {openBy[e.id]} open role{openBy[e.id] > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span />
                          )}
                          <ActionForm action={moveEmployerStage}>
                            <input type="hidden" name="employerId" value={e.id} />
                            <AutoSubmitSelect name="crmStage" defaultValue={e.crmStage} aria-label={`Move ${e.name}`} className="h-7 w-28 rounded-md px-2 pr-7 text-xs">
                              {CRM_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </AutoSubmitSelect>
                          </ActionForm>
                        </div>
                      </li>
                    );
                  })}
                  {items.length === 0 && <li className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">Empty</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
