import { ProfileForm } from "@/components/peeps/profile-form";
import { DocumentsPanel } from "@/components/console/panels";
import { Panel } from "@/components/peeps/blocks";
import { updateMyProfile } from "@/server/actions/portal";
import { currentCandidate } from "@/server/portal";
import { formatDate } from "@/lib/format";

export const metadata = { title: "My profile" };

export default async function MyProfilePage() {
  const { candidate } = await currentCandidate();
  return (
    <>
      <h1 className="font-display text-3xl font-medium sm:text-4xl">My profile</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Employers see an evidence-based profile, not a raw CV. Keep this accurate. We verify what you tell us, and we never
        exaggerate it.
      </p>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel>
          <ProfileForm candidate={candidate} action={updateMyProfile} />
        </Panel>
        <div className="grid content-start gap-6">
          <DocumentsPanel candidateId={candidate.id} />
          <Panel title="Your data">
            <p className="text-sm text-muted-foreground">
              Consent recorded {formatDate(candidate.consentAt)} (version {candidate.consentVersion}). You can ask us to export or
              delete your data at any time under the Nigeria Data Protection Act 2023.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
