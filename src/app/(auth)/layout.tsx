import { AuthLadder, AuthShell } from "@/components/site/auth-shell";
import { STAGES, STAGE_META } from "@/lib/quality";

/**
 * Sign-in and registration are the handover from the marketing site into the product, so
 * they are set in the site's language. The shell is shared with the console's staff
 * sign-in; only the dark half's words and motif are this layout's own.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthShell
      statement={
        <>
          &ldquo;We don&apos;t just give employers CVs. We help them access talent that has been identified, screened,
          assessed and prepared.&rdquo;
        </>
      }
      aside={<AuthLadder rungs={STAGES.map((s) => STAGE_META[s].short)} />}
      footnote="Candidates never pay placement fees."
    >
      {children}
    </AuthShell>
  );
}
