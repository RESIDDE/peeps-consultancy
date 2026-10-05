import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/portal-shell";
import { currentEmployer } from "@/server/portal";

export const metadata: Metadata = { title: { default: "Employer portal", template: "%s · PEEPs Employer" }, robots: { index: false } };

export default async function EmployerPortalLayout({ children }: { children: React.ReactNode }) {
  const { employer, contact } = await currentEmployer();
  return (
    <PortalShell
      name={contact.name}
      subtitle={employer.name}
      nav={[
        { href: "/portal/employer", label: "Overview", exact: true },
        { href: "/portal/employer/vacancies/new", label: "Request talent" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
