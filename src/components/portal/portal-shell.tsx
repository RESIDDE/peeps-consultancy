import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
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
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href={nav[0].href} aria-label="Portal home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{name}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-ink text-xs font-semibold text-ink-foreground" aria-hidden>
              {initials(name)}
            </span>
            <SignOutButton className="text-muted-foreground hover:text-foreground" />
          </div>
        </div>
        <div className="container-page">
          <PortalNav items={nav} />
        </div>
      </header>
      <main id="main" className="container-page py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
