import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { assessments, candidates, verificationChecks } from "@/db/schema";
import { PageHeader } from "@/components/peeps/blocks";
import { TalentReport } from "@/components/peeps/talent-report";
import { PrintButton } from "@/components/print-button";
import { Logo } from "@/components/brand/logo";
import type { CheckRecord } from "@/lib/quality";
import { formatDate } from "@/lib/format";

export const metadata = { title: "PEEPs CV" };

export default async function PeepsCv({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [c] = await db.select().from(candidates).where(eq(candidates.id, id));
  if (!c) notFound();
  const [checks, as] = await Promise.all([
    db.select({ type: verificationChecks.type, status: verificationChecks.status, notes: verificationChecks.notes }).from(verificationChecks).where(eq(verificationChecks.candidateId, id)),
    db.select().from(assessments).where(eq(assessments.candidateId, id)).orderBy(desc(assessments.assessedAt)),
  ]);
  return (
    <>
      <div className="no-print">
        <PageHeader back={{ href: `/console/talent/${id}`, label: "Candidate record" }} title="PEEPs Professional CV" description="An evidence-based profile, ready to print or save as PDF." actions={<PrintButton />} />
      </div>
      <div className="print-sheet mx-auto max-w-4xl rounded-3xl border bg-background p-6 shadow-sm sm:p-10">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <Logo />
          <p className="text-right text-xs text-muted-foreground">
            PEEPs Talent Profile
            <br />
            Generated {formatDate(new Date())}
          </p>
        </div>
        <TalentReport candidate={c} checks={checks as CheckRecord[]} assessments={as} showContact />
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Every &ldquo;Verified&rdquo; and &ldquo;Assessed&rdquo; label is backed by a record in the PEEPs Talent Registry. Confidential.
        </p>
      </div>
    </>
  );
}
