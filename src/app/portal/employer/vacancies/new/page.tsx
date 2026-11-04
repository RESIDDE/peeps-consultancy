import { PortalPageHeader, PortalPanel } from "@/components/portal/portal-kit";
import { VacancyFields } from "@/components/peeps/vacancy-fields";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { postVacancy } from "@/server/actions/portal";

export const metadata = { title: "Request talent" };

export default function PostVacancyPage() {
  return (
    <>
      <PortalPageHeader
        label="CLIENT MANDATE // SPECIFICATION"
        title="Request Talent Shortlist"
        lede="Provide your vacancy requirements. Your designated PEEPs consultant will schedule a vacancy analysis call to calibrate competencies, compensation benchmarks, and timeline before shortlist sourcing commences."
      />

      <PortalPanel
        label="JOB SPECIFICATION"
        title="Role Definition & Parameters"
        description="Detail headcount, seniority, required competencies, and compensation parameters."
        className="max-w-4xl"
      >
        <ActionForm action={postVacancy} className="grid gap-5 sm:grid-cols-2">
          <VacancyFields />
          <div className="sm:col-span-2">
            <FormMessage />
          </div>
          <div className="pt-2">
            <SubmitButton
              size="lg"
              pendingText="Submitting Request…"
              className="rounded-[5px] font-mono text-xs uppercase tracking-wider"
            >
              Submit Mandate Request
            </SubmitButton>
          </div>
        </ActionForm>
      </PortalPanel>
    </>
  );
}
