import { ProfileForm } from "@/components/peeps/profile-form";
import { DocumentsPanel } from "@/components/console/panels";
import { PortalPageHeader, PortalPanel } from "@/components/portal/portal-kit";
import { updateMyProfile } from "@/server/actions/portal";
import { currentCandidate } from "@/server/portal";
import { formatDate } from "@/lib/format";

export const metadata = { title: "My profile" };

export default async function MyProfilePage() {
  const { candidate } = await currentCandidate();

  return (
    <>
      <PortalPageHeader
        label={`PROFILE ID: ${candidate.pepId} // EVIDENCE DOSSIER`}
        title="Candidate Profile"
        lede="Employers see an evidence-backed dossier, not an unvetted resume. Every credential, certification, and stated software competence is cross-referenced with your documentation."
      />

      <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">
        <PortalPanel
          label="COMPETENCY RECORD"
          title="Verified Professional Record"
          description="Update your professional background, contact coordinates, salary range, and software proficiencies."
        >
          <ProfileForm candidate={candidate} action={updateMyProfile} />
        </PortalPanel>

        <div className="space-y-6">
          <DocumentsPanel candidateId={candidate.id} />

          <PortalPanel
            label="DATA PROTECTION COMPLIANCE"
            title="Privacy & Data Registry"
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              Consent recorded {formatDate(candidate.consentAt)} (Version {candidate.consentVersion}). Under the Nigeria Data Protection Act 2023 (NDPA), you hold statutory rights to inspect, export, or request deletion of your verified records at any time.
            </p>
          </PortalPanel>
        </div>
      </div>
    </>
  );
}
