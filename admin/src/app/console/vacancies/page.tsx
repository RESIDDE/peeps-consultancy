import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Briefcase } from "lucide-react";
import { db } from "@/db";
import { applications, employers, vacancies } from "@/db/schema";
import { EmptyState, PageHeader } from "@/components/peeps/blocks";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { OPEN_VACANCY_STATUSES, PACKAGES, VACANCY_STATUSES } from "@/lib/pipeline";
import { sectorName } from "@/lib/taxonomy";
import { formatDate, salaryRange } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Vacancies" };

export default async function VacanciesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view = "open" } = await searchParams;
  const [rows, counts] = await Promise.all([
    db
      .select({ v: vacancies, employer: employers.name })
      .from(vacancies)
      .innerJoin(employers, eq(employers.id, vacancies.employerId))
      .orderBy(desc(vacancies.createdAt)),
    db.select({ vacancyId: applications.vacancyId, n: count() }).from(applications).groupBy(applications.vacancyId),
  ]);
  const byVacancy = Object.fromEntries(counts.map((c) => [c.vacancyId, c.n]));
  const list = rows.filter(({ v }) => (view === "open" ? OPEN_VACANCY_STATUSES.includes(v.status) : view === "closed" ? !OPEN_VACANCY_STATUSES.includes(v.status) : true));

  return (
    <>
      <PageHeader title="Vacancies" description="Every role PEEPs is working, from vacancy analysis to filled." />
      <nav className="mb-4 flex gap-1" aria-label="Vacancy filter">
        {[
          ["open", "Open"],
          ["closed", "Filled & closed"],
          ["all", "All"],
        ].map(([k, label]) => (
          <Link
            key={k}
            href={`/console/vacancies?view=${k}`}
            className={cn("rounded-full px-3 py-1.5 text-sm font-medium", view === k ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}
            aria-current={view === k ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      {list.length === 0 ? (
        <EmptyState icon={Briefcase} title="No vacancies here" body="Create vacancies from an employer's page, or they arrive from talent requests and the employer portal." />
      ) : (
        <div className="rounded-2xl border bg-card">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Role</TH>
                <TH>Employer</TH>
                <TH>Status</TH>
                <TH>Pipeline</TH>
                <TH>Budget /mo</TH>
                <TH>Opened</TH>
              </TR>
            </THead>
            <TBody>
              {list.map(({ v, employer }) => (
                <TR key={v.id} className="relative">
                  <TD>
                    <Link href={`/console/vacancies/${v.id}`} className="font-medium after:absolute after:inset-0 hover:text-primary">
                      {v.title} {v.headcount > 1 && <span className="text-muted-foreground">× {v.headcount}</span>}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {v.ref} · {sectorName(v.sectorCode)} · {PACKAGES.find((p) => p.value === v.package)?.short}
                    </p>
                  </TD>
                  <TD className="text-sm">{employer}</TD>
                  <TD>
                    <Badge variant={v.status === "filled" ? "solid" : v.status === "received" ? "gold" : "outline"}>
                      {VACANCY_STATUSES.find((s) => s.value === v.status)?.label}
                    </Badge>
                    {v.published && <span className="ml-1.5 text-[11px] text-muted-foreground">· on job board</span>}
                  </TD>
                  <TD className="text-sm tabular-nums">{byVacancy[v.id] ?? 0} candidates</TD>
                  <TD className="whitespace-nowrap text-sm tabular-nums">{salaryRange(v.salaryMin, v.salaryMax)}</TD>
                  <TD className="whitespace-nowrap text-sm text-muted-foreground">{formatDate(v.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </>
  );
}
