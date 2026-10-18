import Link from "next/link";
import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Search, Users } from "lucide-react";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { EmptyState, PageHeader } from "@/components/peeps/blocks";
import { ClassificationBadge, LadderBar, StageBadge } from "@/components/peeps/stage";
import { Input, Select } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AVAILABILITY, CLASSIFICATIONS, NIGERIAN_CITIES, SECTORS, labelOf, sectorName } from "@/lib/taxonomy";
import { STAGES, STAGE_META } from "@/lib/quality";
import { salaryRange } from "@/lib/format";

export const metadata = { title: "Talent Registry" };

type SP = { q?: string; sector?: string; stage?: string; classification?: string; city?: string; availability?: string };

export default async function TalentRegistry({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const where: SQL[] = [];
  if (sp.q) {
    const q = `%${sp.q.trim()}%`;
    where.push(or(ilike(candidates.firstName, q), ilike(candidates.lastName, q), ilike(candidates.pepId, q), ilike(candidates.profession, q), ilike(candidates.email, q))!);
  }
  if (sp.sector) where.push(eq(candidates.sectorCode, sp.sector));
  if (sp.stage) where.push(eq(candidates.stage, sp.stage));
  if (sp.classification) where.push(eq(candidates.classification, sp.classification));
  if (sp.city) where.push(eq(candidates.city, sp.city));
  if (sp.availability) where.push(eq(candidates.availability, sp.availability));

  const rows = await db
    .select()
    .from(candidates)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(candidates.updatedAt))
    .limit(300);
  const filtered = Object.values(sp).some(Boolean);

  return (
    <>
      <PageHeader
        title="Talent Registry"
        description="Every candidate, their PEEPs ID and where they stand on the quality ladder. Stages update automatically from recorded evidence."
        actions={
          <Link href="/console/talent/new" className={buttonVariants({ size: "sm" })}>
            Register candidate
          </Link>
        }
      />

      <form className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(5,1fr)_auto]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={sp.q} placeholder="Name, PEP ID, profession…" className="pl-9" aria-label="Search talent" />
        </div>
        <Select name="sector" defaultValue={sp.sector ?? ""} aria-label="Sector">
          <option value="">All sectors</option>
          {SECTORS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </Select>
        <Select name="stage" defaultValue={sp.stage ?? ""} aria-label="Stage">
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
        </Select>
        <Select name="classification" defaultValue={sp.classification ?? ""} aria-label="Classification">
          <option value="">Any class</option>
          {CLASSIFICATIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
        <Select name="city" defaultValue={sp.city ?? ""} aria-label="City">
          <option value="">Any city</option>
          {NIGERIAN_CITIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select name="availability" defaultValue={sp.availability ?? ""} aria-label="Availability">
          <option value="">Any availability</option>
          {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </Select>
        <div className="flex gap-2">
          <Button type="submit" size="default" variant="ink">Filter</Button>
          {filtered && (
            <Link href="/console/talent" className={buttonVariants({ variant: "ghost" })}>
              Clear
            </Link>
          )}
        </div>
      </form>

      <p className="mb-3 text-xs text-muted-foreground">
        {rows.length} candidate{rows.length === 1 ? "" : "s"}
        {filtered ? " match your filters" : ""}
      </p>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="No candidates found" body="Try widening your filters, or register a new candidate." />
      ) : (
        <div className="rounded-2xl border bg-card">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Candidate</TH>
                <TH>Sector</TH>
                <TH className="min-w-44">Quality stage</TH>
                <TH>Class</TH>
                <TH>Location</TH>
                <TH>Expectation /mo</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((c) => (
                <TR key={c.id} className="relative">
                  <TD>
                    <Link href={`/console/talent/${c.id}`} className="font-medium after:absolute after:inset-0 hover:text-primary">
                      {c.firstName} {c.lastName}
                    </Link>
                    <p className="font-mono text-[11px] text-muted-foreground">{c.pepId}</p>
                  </TD>
                  <TD>
                    <p className="text-sm">{c.profession}</p>
                    <p className="text-xs text-muted-foreground">{sectorName(c.sectorCode)} · {c.yearsExperience} yrs</p>
                  </TD>
                  <TD>
                    <StageBadge stage={c.stage} />
                    <LadderBar stage={c.stage} className="mt-2 max-w-40" />
                  </TD>
                  <TD><ClassificationBadge value={c.classification} /></TD>
                  <TD>
                    <p className="text-sm">{c.city ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{labelOf(AVAILABILITY, c.availability)}</p>
                  </TD>
                  <TD className="whitespace-nowrap text-sm tabular-nums">{salaryRange(c.salaryMin, c.salaryMax)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </>
  );
}
