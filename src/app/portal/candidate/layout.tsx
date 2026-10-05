import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { currentCandidate } from "@/server/portal";

export const metadata: Metadata = { title: { default: "My PEEPs", template: "%s · My PEEPs" }, robots: { index: false } };

export default async function CandidatePortalLayout({ children }: { children: React.ReactNode }) {
  const { candidate } = await currentCandidate();
  return (
    <PortalShell
      name={`${candidate.firstName} ${candidate.lastName}`}
      subtitle={candidate.pepId}
      nav={[
        { href: "/portal/candidate", label: "Dashboard", exact: true },
        { href: "/portal/candidate/profile", label: "My profile" },
        { href: "/portal/candidate/jobs", label: "Opportunities" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
