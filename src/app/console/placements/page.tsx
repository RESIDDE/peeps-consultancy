import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Star, Wallet } from "lucide-react";
import { db } from "@/db";
import { candidates, employers, placements, revenueEntries, vacancies } from "@/db/schema";
import { EmptyState, PageHeader, Panel, StatCard } from "@/components/peeps/blocks";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { BarList } from "@/components/charts/bar-list";
import { ChartTable } from "@/components/charts/chart-table";
import { addRevenue, updatePlacement } from "@/server/actions/console";
import { INVOICE_STATUSES, RETENTION_STATUSES, REVENUE_STREAMS } from "@/lib/pipeline";
import { formatDate, naira, nairaCompact } from "@/lib/format";

export const metadata = { title: "Placements & revenue" };

export default async function PlacementsPage() {
  const [pls, revenue, emps] = await Promise.all([
    db
      .select({ p: placements, first: candidates.firstName, last: candidates.lastName, cid: candidates.id, title: vacancies.title, ref: vacancies.ref, employer: employers.name, eid: employers.id })
      .from(placements)
      .innerJoin(candidates, eq(candidates.id, placements.candidateId))
      .innerJoin(vacancies, eq(vacancies.id, placements.vacancyId))
      .innerJoin(employers, eq(employers.id, placements.employerId))
      .orderBy(desc(placements.startDate)),
    db.select({ r: revenueEntries, employer: employers.name }).from(revenueEntries).leftJoin(employers, eq(employers.id, revenueEntries.employerId)).orderBy(desc(revenueEntries.date)),
    db.select({ id: employers.id, name: employers.name }).from(employers).orderBy(employers.name),
  ]);

  const total = revenue.reduce((s, r) => s + r.r.amount, 0);
  const outstanding = pls.filter((p) => p.p.invoiceStatus !== "paid").reduce((s, p) => s + p.p.fee, 0);
  const avgFee = pls.length ? Math.round(pls.reduce((s, p) => s + p.p.fee, 0) / pls.length) : 0;
  const byStream = REVENUE_STREAMS.map((s) => ({ label: s.label, value: revenue.filter((r) => r.r.stream === s.value).reduce((a, r) => a + r.r.amount, 0) }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHeader
        title="Placements & revenue"
        description="Every hire, its fee and retention, plus income from training, advisory, workforce and membership."
        actions={
          <Dialog trigger="Record revenue" triggerVariant="default" title="Record revenue" description="Training, advisory, workforce, membership or career-service income.">
            <ActionForm action={addRevenue} className="grid gap-3 sm:grid-cols-2">
              <Field label="Stream" name="stream">
                <Select id="stream" name="stream" defaultValue="training">{REVENUE_STREAMS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
              </Field>
              <Field label="Amount (₦)" name="amount" required><Input id="amount" name="amount" inputMode="numeric" required /></Field>
              <Field label="Date" name="date"><Input id="date" name="date" type="date" /></Field>
              <Field label="Client" name="employerId">
                <Select id="employerId" name="employerId" defaultValue=""><option value="">None / individual</option>{emps.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</Select>
              </Field>
              <Field label="Description" name="description" className="sm:col-span-2"><Input id="description" name="description" /></Field>
              <div className="sm:col-span-2"><FormMessage /></div>
              <div><SubmitButton pendingText="Saving…">Record</SubmitButton></div>
            </ActionForm>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total revenue" value={nairaCompact(total)} tone="primary" icon={Wallet} />
        <StatCard label="Placements" value={pls.length} />
        <StatCard label="Average placement fee" value={nairaCompact(avgFee)} />
        <StatCard label="Fees outstanding" value={nairaCompact(outstanding)} hint="Draft or sent invoices" />
      </div>

      <Panel title="Placements" className="mt-6" bodyClassName="p-0">
        {pls.length === 0 ? (
          <EmptyState icon={Wallet} title="No placements yet" body="Record a placement from a vacancy pipeline." className="m-5" />
        ) : (
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Hire</TH>
                <TH>Client</TH>
                <TH>Start</TH>
                <TH className="text-right">Fee</TH>
                <TH>Retention 3 · 6 · 12 mo</TH>
                <TH>Feedback</TH>
                <TH />
              </TR>
            </THead>
            <TBody>
              {pls.map(({ p, first, last, cid, title, ref, employer, eid }) => (
                <TR key={p.id}>
                  <TD>
                    <Link href={`/console/talent/${cid}`} className="font-medium hover:text-primary">{first} {last}</Link>
                    <p className="text-xs text-muted-foreground">{title} · {ref}</p>
                  </TD>
                  <TD className="text-sm"><Link href={`/console/employers/${eid}`} className="hover:text-primary">{employer}</Link></TD>
                  <TD className="whitespace-nowrap text-sm">{formatDate(p.startDate)}</TD>
                  <TD className="text-right">
                    <p className="text-sm font-medium tabular-nums">{naira(p.fee)}</p>
                    <p className="text-[11px] capitalize text-muted-foreground">{p.invoiceStatus}</p>
                  </TD>
                  <TD>
                    <div className="flex gap-1">
                      {[p.retention3m, p.retention6m, p.retention12m].map((r, i) => (
                        <span
                          key={i}
                          title={`${[3, 6, 12][i]} months: ${r}`}
                          className={r === "retained" ? "rounded bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary" : r === "left" ? "rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive" : "rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"}
                        >
                          {r === "retained" ? "✓" : r === "left" ? "✕" : "…"} {[3, 6, 12][i]}m
                        </span>
                      ))}
                    </div>
                  </TD>
                  <TD className="text-sm">
                    {p.feedback ? (
                      <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-gold text-gold" />{p.feedback.rating}/5</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Awaiting</span>
                    )}
                  </TD>
                  <TD>
                    <Dialog trigger="Update" triggerVariant="ghost" title="Update placement" description={`${first} ${last} at ${employer}`}>
                      <ActionForm action={updatePlacement} className="grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="placementId" value={p.id} />
                        <Field label="Invoice" name="invoiceStatus">
                          <Select id={`i-${p.id}`} name="invoiceStatus" defaultValue={p.invoiceStatus}>{INVOICE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
                        </Field>
                        {(["retention3m", "retention6m", "retention12m"] as const).map((k, i) => (
                          <Field key={k} label={`${[3, 6, 12][i]}-month retention`} name={k}>
                            <Select id={`${k}-${p.id}`} name={k} defaultValue={p[k]}>{RETENTION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
                          </Field>
                        ))}
                        <div className="sm:col-span-2"><FormMessage /></div>
                        <div><SubmitButton pendingText="Saving…">Save</SubmitButton></div>
                      </ActionForm>
                    </Dialog>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Panel title="Revenue by stream">
          <BarList data={byStream} format="naira" />
          <ChartTable data={byStream} format="naira" labelHeader="Stream" valueHeader="Revenue" />
        </Panel>
        <Panel title="Revenue ledger" bodyClassName="p-0">
          <ul className="max-h-96 divide-y overflow-y-auto">
            {revenue.map(({ r, employer }) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate">{r.description ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {REVENUE_STREAMS.find((s) => s.value === r.stream)?.label} · {employer ?? "Individual"} · {formatDate(r.date)}
                  </p>
                </div>
                <span className="shrink-0 font-medium tabular-nums">{naira(r.amount)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
