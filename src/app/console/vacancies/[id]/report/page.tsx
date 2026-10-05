import { notFound } from "next/navigation";
import { PageHeader } from "@/components/peeps/blocks";
import { PrintButton } from "@/components/print-button";
import { loadShortlist, ShortlistBody, ShortlistHeader } from "@/components/peeps/shortlist-report";

export const metadata = { title: "Shortlist report" };

export default async function ShortlistReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadShortlist(id);
  if (!data) notFound();
  return (
    <>
      <div className="no-print">
        <PageHeader
          back={{ href: `/console/vacancies/${id}`, label: `${data.v.ref} pipeline` }}
          title="Shortlist report"
          description="Exactly what the employer sees in their portal. Print or save as PDF to send."
          actions={<PrintButton />}
        />
      </div>
      <div className="print-sheet mx-auto max-w-4xl rounded-3xl border bg-background p-6 shadow-sm sm:p-10">
        <ShortlistHeader v={data.v} employer={data.employer} />
        <ShortlistBody entries={data.entries} />
      </div>
    </>
  );
}
