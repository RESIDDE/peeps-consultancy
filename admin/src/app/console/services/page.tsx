import { redirect } from "next/navigation";

/**
 * The Service Desk was merged into the Forms page, where Payroll, Compliance and Auto Check
 * each have their own tab with the same answer columns. Old links and bookmarks land on the
 * matching tab rather than a 404.
 */
const TABS: Record<string, string> = { payroll: "payroll", compliance: "compliance", "auto-check": "auto-check" };

export default async function ServiceDeskRedirect({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  redirect(`/console/enquiries?tab=${TABS[service ?? ""] ?? "payroll"}`);
}
