import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates } from "@/db/schema";
import { PageHeader, Panel } from "@/components/peeps/blocks";
import { ProfileForm } from "@/components/peeps/profile-form";
import { updateCandidate } from "@/server/actions/console";

export const metadata = { title: "Edit profile" };

export default async function EditCandidate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [c] = await db.select().from(candidates).where(eq(candidates.id, id));
  if (!c) notFound();
  return (
    <>
      <PageHeader back={{ href: `/console/talent/${id}`, label: `${c.firstName} ${c.lastName}` }} title="Edit profile" eyebrow={<span className="font-mono">{c.pepId}</span>} />
      <Panel className="max-w-4xl">
        <ProfileForm candidate={c} action={updateCandidate} hidden={{ candidateId: c.id }} />
      </Panel>
    </>
  );
}
