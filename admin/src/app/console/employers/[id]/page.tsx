import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, inArray } from "drizzle-orm";
import { Mail, Phone, Star } from "lucide-react";
import { db } from "@/db";
import { candidates, employerContacts, employers, placements, user, vacancies } from "@/db/schema";
import { PageHeader, Panel } from "@/components/peeps/blocks";
import { NotesPanel, TimelinePanel } from "@/components/console/panels";
import { VacancyFields } from "@/components/peeps/vacancy-fields";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { addContact, createVacancy, updateEmployer } from "@/server/actions/console";
import { COMPANY_SIZES, CRM_STAGES, INDUSTRIES, VACANCY_STATUSES } from "@/lib/pipeline";
import { formatDate, naira } from "@/lib/format";
import { STAFF } from "@/lib/permissions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e] = await db.select({ name: employers.name }).from(employers).where(eq(employers.id, id));
  return { title: e?.name ?? "Employer" };
}

const toDateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function EmployerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [e] = await db.select().from(employers).where(eq(employers.id, id));
  if (!e) notFound();
  const [contacts, vacs, pls, staff] = await Promise.all([
    db.select().from(employerContacts).where(eq(employerContacts.employerId, id)),
    db.select().from(vacancies).where(eq(vacancies.employerId, id)).orderBy(desc(vacancies.createdAt)),
    db
      .select({ p: placements, first: candidates.firstName, last: candidates.lastName, pepId: candidates.pepId, title: vacancies.title })
      .from(placements)
      .innerJoin(candidates, eq(candidates.id, placements.candidateId))
      .innerJoin(vacancies, eq(vacancies.id, placements.vacancyId))
      .where(eq(placements.employerId, id)),
    db.select({ id: user.id, name: user.name }).from(user).where(inArray(user.role, STAFF)),
  ]);
  const stage = CRM_STAGES.find((s) => s.value === e.crmStage);

  return (
    <>
      <PageHeader
        back={{ href: "/console/employers", label: "Employer pipeline" }}
        eyebrow={<span>{[e.industry, e.city, e.size && `${e.size} staff`].filter(Boolean).join(" · ")}</span>}
        title={e.name}
        actions={
          <>
            <Badge variant="solid" className="h-8 px-3 text-sm">{stage?.label}</Badge>
            {e.membershipTier === "corporate" && <Badge variant="gold" className="h-8 px-3 text-sm">Corporate member</Badge>}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid content-start gap-6">
          <Panel
            title="Vacancies"
            bodyClassName="p-0"
            actions={
              <Dialog trigger="New vacancy" triggerVariant="default" title="New vacancy" description={`For ${e.name}. Starts at vacancy analysis.`}>
                <ActionForm action={createVacancy} className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="employerId" value={e.id} />
                  <VacancyFields />
                  <div className="sm:col-span-2"><FormMessage /></div>
                  <div><SubmitButton pendingText="Creating…">Create vacancy</SubmitButton></div>
                </ActionForm>
              </Dialog>
            }
          >
            {vacs.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No vacancies yet.</p>
            ) : (
              <ul className="divide-y">
                {vacs.map((v) => (
                  <li key={v.id}>
                    <Link href={`/console/vacancies/${v.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{v.title} {v.headcount > 1 && <span className="text-muted-foreground">× {v.headcount}</span>}</p>
                        <p className="text-xs text-muted-foreground">{v.ref} · opened {formatDate(v.createdAt)}</p>
                      </div>
                      <Badge variant={v.status === "filled" ? "solid" : v.status === "closed" ? "muted" : "outline"}>
                        {VACANCY_STATUSES.find((s) => s.value === v.status)?.label}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Placements & feedback" bodyClassName="p-0">
            {pls.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No placements yet.</p>
            ) : (
              <ul className="divide-y">
                {pls.map(({ p, first, last, pepId, title }) => (
                  <li key={p.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {first} {last} <span className="font-mono text-xs text-muted-foreground">{pepId}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{title} · started {formatDate(p.startDate)} · fee {naira(p.fee)}</p>
                    </div>
                    {p.feedback ? (
                      <div className="mt-2 rounded-xl bg-muted/50 p-3 text-sm">
                        <p className="flex items-center gap-1 font-medium">
                          <Star className="size-3.5 fill-gold text-gold" /> {p.feedback.rating}/5 · {p.feedback.wouldHireAgain ? "Would hire again" : "Would not hire again"}
                        </p>
                        <p className="mt-1 text-muted-foreground">Strong: {p.feedback.strengths}</p>
                        {p.feedback.missingSkills && <p className="text-muted-foreground">Missing: {p.feedback.missingSkills}</p>}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-warning">Awaiting employer feedback</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Contacts"
            bodyClassName="p-0"
            actions={
              <Dialog trigger="Add contact" title="Add contact">
                <ActionForm action={addContact} className="grid gap-3">
                  <input type="hidden" name="employerId" value={e.id} />
                  <Field label="Name" name="name" required><Input id="c-name" name="name" required /></Field>
                  <Field label="Role" name="role"><Input id="c-role" name="role" /></Field>
                  <Field label="Email" name="email"><Input id="c-email" name="email" type="email" /></Field>
                  <Field label="Phone" name="phone"><Input id="c-phone" name="phone" type="tel" /></Field>
                  <FormMessage />
                  <div><SubmitButton pendingText="Adding…">Add contact</SubmitButton></div>
                </ActionForm>
              </Dialog>
            }
          >
            <ul className="divide-y">
              {contacts.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {c.name} {c.isPrimary && <Badge variant="muted" className="ml-1">Primary</Badge>} {c.userId && <Badge className="ml-1">Portal user</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="size-3.5" />{c.email}</a>}
                    {c.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="size-3.5" />{c.phone}</a>}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Account">
            <ActionForm action={updateEmployer} className="grid gap-3">
              <input type="hidden" name="employerId" value={e.id} />
              <Field label="Pipeline stage" name="crmStage">
                <Select id="crmStage" name="crmStage" defaultValue={e.crmStage}>{CRM_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
              </Field>
              <div className="grid grid-cols-[1.4fr_1fr] gap-3">
                <Field label="Next action" name="nextAction"><Input id="nextAction" name="nextAction" defaultValue={e.nextAction ?? ""} /></Field>
                <Field label="Due" name="nextActionAt"><Input id="nextActionAt" name="nextActionAt" type="date" defaultValue={toDateInput(e.nextActionAt)} /></Field>
              </div>
              <Field label="Account owner" name="ownerId">
                <Select id="ownerId" name="ownerId" defaultValue={e.ownerId ?? ""}>
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Industry" name="industry">
                  <Select id="industry" name="industry" defaultValue={e.industry ?? ""}><option value="">—</option>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</Select>
                </Field>
                <Field label="Size" name="size">
                  <Select id="size" name="size" defaultValue={e.size ?? ""}><option value="">—</option>{COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}</Select>
                </Field>
                <Field label="City" name="city"><Input id="city" name="city" defaultValue={e.city ?? ""} /></Field>
                <Field label="Membership" name="membershipTier">
                  <Select id="membershipTier" name="membershipTier" defaultValue={e.membershipTier}><option value="none">None</option><option value="corporate">Corporate</option></Select>
                </Field>
              </div>
              <Field label="Website" name="website"><Input id="website" name="website" defaultValue={e.website ?? ""} /></Field>
              <FormMessage />
              <div><SubmitButton size="sm" pendingText="Saving…">Save</SubmitButton></div>
            </ActionForm>
          </Panel>
          <NotesPanel entity="employer" entityId={e.id} />
          <TimelinePanel entity="employer" entityId={e.id} />
        </div>
      </div>
    </>
  );
}
