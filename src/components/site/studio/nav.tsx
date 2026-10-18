"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Moon, Sun, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { TalentProfileCard } from "@/components/site/talent-profile-card";
import { COMPANY, DIVISIONS, VERTICALS } from "@/lib/content";
import { homeFor } from "@/lib/roles";
import { cn } from "@/lib/utils";

/** The theme lives on <html> and in localStorage, where the blocking script in the root
 *  layout reads it back before first paint. Both controls go through here. */
function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("peeps-theme", dark ? "dark" : "light");
  } catch {
    /* storage unavailable — the choice still applies for this visit */
  }
}

/** Each entry carries a second line, so the menu says what is behind the word. */
const ITEMS = [
  { href: "/employers", label: "Employers", note: "Request a shortlist" },
  { href: "/candidates", label: "Talent", note: "Join the registry" },
  { href: "/services", label: "Services", note: `${DIVISIONS.length} divisions` },
  { href: "/sectors", label: "Sectors", note: `${VERTICALS.length} sectors` },
  { href: "/how-we-select", label: "Method", note: "How we select" },
  { href: "/contact", label: "Contact", note: "Say hello" },
] as const;

export function StudioNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [xray, setXray] = useState(false);
  const [accountHref, setAccountHref] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/auth/get-session", { signal: ctrl.signal, credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { user?: { role?: string } } | null) => {
        if (s?.user) setAccountHref(homeFor(s.user.role));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  // The menu covers the page, so the page behind it must not scroll.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // The pill only appears once the page has moved. Written straight to the DOM, because a
  // scroll must not cost a render.
  useEffect(() => {
    const scope = document.querySelector(".studio");
    if (!scope) return;
    const onScroll = () => scope.toggleAttribute("data-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // X-ray inverts the whole scope, so the class belongs on the scope, not here.
  useEffect(() => {
    document.querySelector(".studio")?.classList.toggle("xray", xray);
  }, [xray]);

  return (
    <>
      <header className="studio-nav">
        <Link href="/" aria-label={`${COMPANY.name} home`} className="nav-pill" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <div className="nav-pill nav-pill--group">
          <button
            type="button"
            onClick={() => setTheme(!document.documentElement.classList.contains("dark"))}
            aria-label="Toggle dark mode"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            {/* Swapped in CSS rather than from state: the server cannot know the theme, and
                the blocking script sets the class before React ever runs. */}
            <Sun className="hidden size-4 dark:block" aria-hidden />
            <Moon className="size-4 dark:hidden" aria-hidden />
          </button>
          <Link href="/employers#request" className="chars hidden px-2 py-1 sm:inline-flex">
            Request talent
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="studio-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="nav-key"
          >
            {open ? (
              <X className="size-4" aria-hidden />
            ) : (
              <span aria-hidden className="flex w-4 flex-col gap-[3px]">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
              </span>
            )}
          </button>
        </div>
      </header>

      <div id="studio-menu" className="menu-sheet" data-open={open || undefined} aria-hidden={!open}>
        <div className="shell grid h-full grid-cols-1 content-start gap-12 pb-44 pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-36">
          <nav aria-label="Main">
            <ul>
              {ITEMS.map((item, i) => (
                <li key={item.href} className="menu-row" style={{ "--i": i } as React.CSSProperties}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="menu-link"
                  >
                    <span className="menu-word">{item.label}</span>
                    <span className="menu-note">{item.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <aside className="menu-row hidden lg:block" style={{ "--i": ITEMS.length } as React.CSSProperties}>
            <TalentProfileCard className="w-full max-w-md" />
            <p className="label mt-6">A sample talent profile</p>
          </aside>
        </div>

        <div className="menu-foot shell">
          <Link
            href="/employers#request"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="group inline-flex items-center gap-3 font-medium"
          >
            Request talent
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-white">
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>

          <div className="label flex flex-col gap-1 normal-case tracking-normal">
            <a href={`mailto:${COMPANY.email}`} tabIndex={open ? 0 : -1} className="hover:text-foreground">
              {COMPANY.email}
            </a>
            <span>{COMPANY.city}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setXray((on) => !on)}
              aria-pressed={xray}
              className="label hover:text-foreground"
            >
              X-ray
            </button>
            <ThemeSwitch open={open} />
            <Link href={accountHref ?? "/sign-in"} tabIndex={open ? 0 : -1} className="label hover:text-foreground">
              {accountHref ? "Dashboard" : "Sign in"}
            </Link>
            <Link href="/privacy" tabIndex={open ? 0 : -1} className="label hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/** The segmented Light / Dark control, on the same storage key as the rest of the app. */
function ThemeSwitch({ open }: { open: boolean }) {
  return (
    <span className="theme-switch">
      {[
        { label: "Light", dark: false },
        { label: "Dark", dark: true },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => setTheme(o.dark)}
          className={cn("theme-switch__option", o.dark ? "dark:bg-background dark:text-foreground" : "bg-background text-foreground dark:bg-transparent dark:text-inherit")}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}
