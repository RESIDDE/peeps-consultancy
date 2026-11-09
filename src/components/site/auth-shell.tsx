import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * The shell every sign-in and registration screen sits in, across both apps: the marketing
 * site's `(auth)` routes and the admin console's staff sign-in.
 *
 * It is set in the site's language — the `studio` scope, the fixed tones and the display
 * face — because signing in is the handover from the marketing site into the product and
 * should not look like a different piece of software. The dark half states the promise and
 * carries a motif; the light half takes the details.
 *
 * `aside` and `footnote` are what each caller varies: the public screens draw the quality
 * ladder and the candidates-never-pay line, the console draws the stages staff move people
 * through and names itself staff-only.
 */
export function AuthShell({
  statement,
  aside,
  footnote,
  homeHref = "/",
  orbits = false,
  children,
}: {
  /** The large quoted or stated line in the dark half. */
  statement: React.ReactNode;
  /** The motif drawn under the statement. */
  aside?: React.ReactNode;
  /** The small line that closes the dark half. */
  footnote: React.ReactNode;
  /** Where the wordmark points. The console sets it to the public site. */
  homeHref?: string;
  /** Draw the landing hero's orbits behind the dark half. The console's sign-in asks for
   *  them, to tie it to the marketing site; the public auth pages sit a click from that
   *  site already and keep their plain field. */
  orbits?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="studio grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <aside
        data-tone="dark"
        className="tone-dark haze relative hidden flex-col justify-between overflow-hidden p-[var(--shell)] lg:flex"
      >
        {orbits && <Orbits />}

        <Link href={homeHref} aria-label="PEEPs home" className="relative z-10 w-fit">
          <Logo />
        </Link>

        <div className="relative z-10">
          <p className="headline max-w-[15ch] text-[clamp(2rem,2.9vw,3.1rem)]">{statement}</p>
          {aside}
        </div>

        <p className="label relative z-10 text-muted-foreground">{footnote}</p>
      </aside>

      <div data-tone="light" className="tone-light wash flex flex-col">
        <div className="flex items-center justify-between gap-4 px-[var(--shell)] py-6">
          <Link href={homeHref} className="lg:invisible" aria-label="PEEPs home">
            <Logo compact />
          </Link>
          <div className="flex items-center gap-5">
            {/* Said in words as well as by the wordmark: a way out of the form is always in view. */}
            <Link
              href={homeHref}
              className="label -my-2 inline-flex items-center gap-2 py-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="size-3.5" />
              Back to website
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <main id="main" className="flex flex-1 items-start justify-center px-[var(--shell)] pb-20 pt-4 sm:items-center">
          <div className="w-full max-w-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

/**
 * A ramp of bars: each rung stands taller and reads a shade stronger. The ladder on the
 * public screens and the staff pipeline in the console are the same drawing.
 */
export function AuthLadder({ rungs }: { rungs: readonly string[] }) {
  return (
    <div className="mt-20 flex h-36 items-end gap-2" aria-hidden>
      {rungs.map((label, i) => (
        <div key={label} className="flex h-full flex-1 flex-col items-center gap-3">
          {/* The bar needs a parent with a definite height, or its % height collapses to zero. */}
          <div className="flex w-full flex-1 items-end">
            <div
              className="reveal-grow w-full bg-foreground"
              style={{ height: `${30 + i * (70 / Math.max(rungs.length - 1, 1))}%`, opacity: 0.3 + i * (0.7 / Math.max(rungs.length - 1, 1)) }}
            />
          </div>
          <span className="label text-[0.65rem] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

/** The same faint orbits as the landing hero, turning very slowly. Decorative. */
function Orbits() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full text-foreground"
      fill="none"
    >
      <g className="orbit" style={{ transformOrigin: "720px 450px" }}>
        <ellipse cx="720" cy="450" rx="980" ry="260" transform="rotate(-24 720 450)" stroke="currentColor" strokeOpacity="0.1" />
        <ellipse cx="720" cy="450" rx="760" ry="420" transform="rotate(38 720 450)" stroke="currentColor" strokeOpacity="0.07" />
        <ellipse cx="720" cy="450" rx="1180" ry="150" transform="rotate(-8 720 450)" stroke="currentColor" strokeOpacity="0.06" />
      </g>
    </svg>
  );
}
