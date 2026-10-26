import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { STAGES, STAGE_META } from "@/lib/quality";

/**
 * Sign-in and registration are the handover from the marketing site into the product, so
 * they are set in the site's language: the scope, the fixed tones and the display face.
 * The dark half states the promise and draws the ladder; the light half takes the details.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside
        data-tone="dark"
        className="tone-dark haze relative hidden flex-col justify-between overflow-hidden p-[var(--shell)] lg:flex"
      >
        <Link href="/" aria-label="PEEPs home" className="w-fit">
          <Logo />
        </Link>

        <div>
          <p className="headline max-w-[15ch] text-[clamp(2rem,2.9vw,3.1rem)]">
            &ldquo;We don&apos;t just give employers CVs. We help them access talent that has been identified, screened,
            assessed and prepared.&rdquo;
          </p>

          {/* The ladder, drawn as a ramp: each rung stands taller and reads a shade stronger. */}
          <div className="mt-20 flex h-36 items-end gap-2" aria-hidden>
            {STAGES.map((s, i) => (
              <div key={s} className="flex h-full flex-1 flex-col items-center gap-3">
                {/* The bar needs a parent with a definite height, or its % height collapses to zero. */}
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="reveal-grow w-full bg-foreground"
                    style={{ height: `${30 + i * 11}%`, opacity: 0.3 + i * 0.117 }}
                  />
                </div>
                <span className="label text-[0.65rem] text-muted-foreground">{STAGE_META[s].short}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="label text-muted-foreground">Candidates never pay placement fees.</p>
      </aside>

      <div data-tone="light" className="tone-light wash flex flex-col">
        <div className="flex items-center justify-between px-[var(--shell)] py-6">
          <Link href="/" className="lg:invisible" aria-label="PEEPs home">
            <Logo compact />
          </Link>
          <ThemeToggle />
        </div>
        <main id="main" className="flex flex-1 items-start justify-center px-[var(--shell)] pb-20 pt-4 sm:items-center">
          <div className="w-full max-w-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
