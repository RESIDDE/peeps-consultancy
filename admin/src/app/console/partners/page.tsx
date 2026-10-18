import { count, eq } from "drizzle-orm";
import { GraduationCap } from "lucide-react";
import { db } from "@/db";
import { candidates, partners } from "@/db/schema";
import { EmptyState, PageHeader } from "@/components/peeps/blocks";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { AutoSubmitSelect } from "@/components/ui/auto-submit-select";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { createPartner, setPartnerStatus } from "@/server/actions/console";
import { MOU_STATUSES, PARTNER_TYPES } from "@/lib/pipeline";
import { labelOf } from "@/lib/taxonomy";

export const metadata = { title: "Partners" };

export default async function PartnersConsole() {
  const [rows, pool, ready] = await Promise.all([
    db.select().from(partners).orderBy(partners.name),
    db.select({ partnerId: candidates.partnerId, n: count() }).from(candidates).groupBy(candidates.partnerId),
    db.select({ partnerId: candidates.partnerId, n: count() }).from(candidates).where(eq(candidates.stage, "peeps_ready")).groupBy(candidates.partnerId),
  ]);
  const poolBy = Object.fromEntries(pool.map((p) => [p.partnerId, p.n]));
  const readyBy = Object.fromEntries(ready.map((p) => [p.partnerId, p.n]));

  return (
    <>
      <PageHeader
        title="Partner ecosystem"
        description="Training institutions and associations that feed the talent pipeline, and where employer feedback is sent back."
        actions={
          <Dialog trigger="Add partner" triggerVariant="default" title="Add partner">
            <ActionForm action={createPartner} className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" name="name" required className="sm:col-span-2"><Input id="p-name" name="name" required /></Field>
              <Field label="Type" name="type">
                <Select id="p-type" name="type" defaultValue="training_school">{PARTNER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select>
              </Field>
              <Field label="City" name="city"><Input id="p-city" name="city" /></Field>
              <Field label="Contact name" name="contactName"><Input id="p-cn" name="contactName" /></Field>
              <Field label="Contact email" name="contactEmail"><Input id="p-ce" name="contactEmail" type="email" /></Field>
              <Field label="Programmes" name="programmes" hint="Comma-separated" className="sm:col-span-2"><Input id="p-prog" name="programmes" /></Field>
              <Field label="MOU status" name="mouStatus">
                <Select id="p-mou" name="mouStatus" defaultValue="prospect">{MOU_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
              </Field>
              <Field label="Notes" name="notes" className="sm:col-span-2"><Textarea id="p-notes" name="notes" rows={2} /></Field>
              <div className="sm:col-span-2"><FormMessage /></div>
              <div><SubmitButton pendingText="Adding…">Add partner</SubmitButton></div>
            </ActionForm>
          </Dialog>
        }
      />
      {rows.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No partners yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <article key={p.id} className="flex flex-col rounded-2xl border bg-card p-5">
              <p className="text-xs text-muted-foreground">{labelOf(PARTNER_TYPES, p.type)} · {p.city}</p>
              <h2 className="mt-1 font-semibold">{p.name}</h2>
              {p.programmes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.programmes.map((x) => <span key={x} className="rounded-md bg-muted px-2 py-0.5 text-xs">{x}</span>)}
                </div>
              )}
              {p.notes && <p className="mt-3 text-sm text-muted-foreground">{p.notes}</p>}
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                <div><dt className="text-xs text-muted-foreground">Talent sourced</dt><dd className="text-xl font-semibold">{poolBy[p.id] ?? 0}</dd></div>
                <div><dt className="text-xs text-muted-foreground">PEEPs Ready now</dt><dd className="text-xl font-semibold">{readyBy[p.id] ?? 0}</dd></div>
              </dl>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <p className="truncate text-xs text-muted-foreground">{p.contactName}{p.contactEmail ? ` · ${p.contactEmail}` : ""}</p>
                <ActionForm action={setPartnerStatus}>
                  <input type="hidden" name="partnerId" value={p.id} />
                  <AutoSubmitSelect name="mouStatus" defaultValue={p.mouStatus} aria-label={`MOU status for ${p.name}`} className="h-8 w-36 text-xs">
                    {MOU_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </AutoSubmitSelect>
                </ActionForm>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
