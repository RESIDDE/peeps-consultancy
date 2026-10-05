import { Panel } from "@/components/peeps/blocks";
import { VacancyFields } from "@/components/peeps/vacancy-fields";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { postVacancy } from "@/server/actions/portal";

export const metadata = { title: "Request talent" };

export default function PostVacancyPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-medium sm:text-4xl">Request talent</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Tell us about the role. Your consultant will call to run a vacancy analysis and agree what success looks like before
        sourcing begins.
      </p>
      <Panel className="mt-8 max-w-4xl">
        <ActionForm action={postVacancy} className="grid gap-4 sm:grid-cols-2">
          <VacancyFields />
          <div className="sm:col-span-2"><FormMessage /></div>
          <div><SubmitButton size="lg" pendingText="Submitting…">Submit request</SubmitButton></div>
        </ActionForm>
      </Panel>
    </>
  );
}
