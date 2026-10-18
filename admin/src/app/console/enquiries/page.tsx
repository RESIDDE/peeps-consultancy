import Link from "next/link";
import { desc } from "drizzle-orm";
import { Inbox, Mail, Phone } from "lucide-react";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { EmptyState, PageHeader } from "@/components/peeps/blocks";
import { ActionForm } from "@/components/ui/action-form";
import { AutoSubmitSelect } from "@/components/ui/auto-submit-select";
import { Badge } from "@/components/ui/badge";
import { setEnquiryStatus } from "@/server/actions/console";
import { ENQUIRY_TYPES } from "@/lib/pipeline";
import { labelOf } from "@/lib/taxonomy";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Enquiries" };

const STATUSES = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "open" } = await searchParams;
  const all = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  const rows = all.filter((e) => (status === "open" ? e.status !== "closed" : status === "all" ? true : e.status === status));

  return (
    <>
      <PageHeader title="Enquiries" description="Talent requests, pilots, partnerships, Academy and career-service requests from the website and portals." />
      <nav className="mb-4 flex gap-1" aria-label="Enquiry filter">
        {[
          ["open", "Open"],
          ["new", "New"],
          ["closed", "Closed"],
          ["all", "All"],
        ].map(([k, label]) => (
          <Link key={k} href={`/console/enquiries?status=${k}`} aria-current={status === k ? "page" : undefined} className={cn("rounded-full px-3 py-1.5 text-sm font-medium", status === k ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted")}>
            {label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <EmptyState icon={Inbox} title="Inbox zero" body="Nothing waiting here." />
      ) : (
        <ul className="grid gap-3">
          {rows.map((e) => (
            <li key={e.id} className={cn("rounded-2xl border bg-card p-5", e.status === "new" && "border-gold/60")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={e.type === "talent_request" || e.type === "pilot" ? "gold" : "outline"}>{labelOf(ENQUIRY_TYPES, e.type)}</Badge>
                    {e.status === "new" && <Badge variant="solid">New</Badge>}
                    <span className="text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</span>
                  </div>
                  <h2 className="mt-2 font-semibold">{e.subject ?? "(no subject)"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {e.name}{e.organisation ? ` · ${e.organisation}` : ""}
                  </p>
                </div>
                <ActionForm action={setEnquiryStatus}>
                  <input type="hidden" name="enquiryId" value={e.id} />
                  <AutoSubmitSelect name="status" defaultValue={e.status} aria-label="Enquiry status" className="h-8 w-32 text-xs">
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </AutoSubmitSelect>
                </ActionForm>
              </div>
              {e.message && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{e.message}</p>}
              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject ?? "Your enquiry"}`)}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail className="size-3.5" />{e.email}</a>
                {e.phone && <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone className="size-3.5" />{e.phone}</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
