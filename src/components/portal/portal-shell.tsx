import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { LagosClock } from "@/components/site/studio/lagos-clock";
import { PortalNav } from "./portal-nav";
import { initials } from "@/lib/format";

export function PortalShell({
  name,
  subtitle,
  nav,
  children,
}: {
  name: string;
  subtitle: string;
  nav: { href: string; label: string; exact?: boolean }[];
  children: React.ReactNode;
}) {
  return (
    <div className="studio min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/20">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[4px] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to content
      </a>

      {/* Studio Portal Chrome */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-[var(--shell)]">
          {/* Brand mark & Identity */}
          <div className="flex items-center gap-4">
            <Link href={nav[0].href} aria-label="Portal home" className="transition-opacity hover:opacity-80">
              <Logo compact />
            </Link>
            <span aria-hidden className="hidden sm:inline-block h-4 w-px bg-border" />
            <span className="hidden sm:inline-block font-mono text-[0.72rem] uppercase tracking-wider text-muted-foreground">
              {subtitle}
            </span>
          </div>

          {/* Right instrument controls */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden lg:flex items-center gap-2 rounded-[4px] border border-border px-3 py-1 font-mono text-[0.75rem] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Abuja / Lagos · <LagosClock /></span>
            </div>

            <ThemeToggle />

            <div className="hidden text-right sm:block">
              <p className="label text-[0.8rem] text-foreground leading-tight">{name}</p>
              <p className="font-mono text-[0.68rem] text-muted-foreground">{subtitle}</p>
            </div>

            <span
              className="inline-flex size-8 items-center justify-center rounded-[4px] border border-border bg-muted font-mono text-xs font-semibold text-foreground"
              aria-hidden
            >
              {initials(name)}
            </span>

            <SignOutButton className="text-muted-foreground hover:text-foreground text-xs" />
          </div>
        </div>

        {/* Studio Sub-Navigation */}
        <div className="border-t border-border/60 bg-muted/20 px-[var(--shell)]">
          <PortalNav items={nav} />
        </div>
      </header>

      {/* Main Workspace */}
      <main id="main" className="flex-1 w-full max-w-[1360px] mx-auto px-[var(--shell)] py-10 md:py-14">
        {children}
      </main>

      {/* Studio Portal Base Footer */}
      <footer className="border-t border-border bg-muted/15 py-6 px-[var(--shell)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-muted-foreground">
          <p className="label text-[0.72rem] tracking-wider">
            PEEPs Consultancy Services · Verified Quality Framework · Nigeria
          </p>
          <p className="font-mono text-[0.7rem]">
            NDPA 2023 Compliant · Candidate & Employer Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
