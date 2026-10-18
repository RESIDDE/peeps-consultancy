import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { STAGES, STAGE_META } from "@/lib/quality";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="grain relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-ink-foreground lg:flex">
        <Link href="/" aria-label="PEEPs home">
          <Logo tone="onDark" />
        </Link>
        <div>
          <p className="font-display max-w-md text-4xl leading-tight">
            &ldquo;We don&apos;t just give employers CVs. We help them access talent that has been identified, screened, assessed and
            prepared.&rdquo;
          </p>
          <div className="mt-12 flex h-40 items-end gap-2" aria-hidden>
            {STAGES.map((s, i) => (
              <div key={s} className="flex h-full flex-1 flex-col items-center gap-2">
                {/* The bar needs a parent with a definite height, or its % height collapses to zero. */}
                <div className="flex w-full flex-1 items-end">
                  {/* "Placed" is ink-coloured, the same as this panel, so it gets the light ink foreground here. */}
                  <div
                    className="reveal-grow w-full rounded-t-lg"
                    style={{ height: `${30 + i * 11}%`, background: s === "placed" ? "var(--ink-foreground)" : `var(--stage-${s})` }}
                  />
                </div>
                <span className="text-xs text-white/60">{STAGE_META[s].short}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/40">Candidates never pay placement fees.</p>
      </aside>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link href="/" className="lg:invisible" aria-label="PEEPs home">
            <Logo compact />
          </Link>
          <ThemeToggle />
        </div>
        <main id="main" className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:px-6">
          <div className="w-full max-w-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
