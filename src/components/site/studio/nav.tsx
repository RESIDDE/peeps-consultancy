"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { getLenis } from "@/components/motion/smooth-scroll";
import { TalentProfileCard } from "@/components/site/talent-profile-card";
import { COMPANY, DIVISIONS, VERTICALS } from "@/lib/content";
import { homeFor } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { CtaLine, Roll } from "./cta-line";

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
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
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

  // The menu covers the page, so the page behind it must not scroll, smoothly or otherwise.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) getLenis()?.stop();
    else getLenis()?.start();
    return () => {
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // The nav takes its colours from whatever is beneath it: a section's fixed tone where it
  // has one, the theme where it does not. Sampled at the nav's own height, once a frame at
  // most, and written straight to the DOM so a scroll never costs a render.
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const under = document
        .elementsFromPoint(window.innerWidth / 2, Math.min(48, window.innerHeight - 1))
        .map((hit) => hit.closest<HTMLElement>("[data-tone]"))
        .find(Boolean);
      const tone = under?.dataset.tone ?? (document.documentElement.classList.contains("dark") ? "dark" : "light");
      if (el.dataset.tone !== tone) el.dataset.tone = tone;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      theme.disconnect();
    };
  }, [pathname, open]);

  return (
    <>
      <header ref={header} className="studio-nav" data-tone="dark">
        <Link href="/" aria-label={`${COMPANY.name} home`} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(!document.documentElement.classList.contains("dark"))}
            aria-label="Toggle dark mode"
            className="nav-dot"
          >
            {/* Swapped in CSS rather than from state: the server cannot know the theme, and
                the blocking script sets the class before React ever runs. */}
            <Sun className="hidden size-3.5 dark:block" aria-hidden />
            <Moon className="size-3.5 dark:hidden" aria-hidden />
          </button>
          <Link href="/employers#request" className="pill pill--solid hidden sm:inline-flex">
            <Roll>Request talent</Roll>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="studio-menu"
            className="pill"
          >
            <Roll>{open ? "Close" : "Menu"}</Roll>
            <span aria-hidden className={cn("flex w-3.5 flex-col gap-[3px] transition-transform duration-300", open && "rotate-45")}>
              <span className={cn("h-px w-full bg-current transition-transform duration-300", open && "translate-y-[2px]")} />
              <span className={cn("h-px w-full bg-current transition-transform duration-300", open && "-translate-y-[2px] -rotate-90")} />
            </span>
          </button>
        </div>
      </header>

      <div
        id="studio-menu"
        data-tone="dark"
        data-lenis-prevent
        data-lens-omit
        className="menu-sheet tone-dark"
        data-open={open || undefined}
        aria-hidden={!open}
      >
        <div className="shell grid h-full grid-cols-1 content-start gap-12 pb-44 pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-40">
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
                    <span className="menu-note label">{item.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <aside className="menu-row hidden lg:block" style={{ "--i": ITEMS.length } as React.CSSProperties}>
            <TalentProfileCard className="w-full max-w-md" />
            <p className="label mt-6 text-muted-foreground">A sample talent profile</p>
          </aside>
        </div>

        <div className="menu-foot shell">
          <span onClick={() => setOpen(false)}>
            <CtaLine href="/employers#request">Request talent</CtaLine>
          </span>

          <div className="label flex flex-col gap-1 normal-case">
            <a href={`mailto:${COMPANY.email}`} tabIndex={open ? 0 : -1} className="hover:text-muted-foreground">
              {COMPANY.email}
            </a>
            <span className="text-muted-foreground">{COMPANY.city}</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitch open={open} />
            <Link href={accountHref ?? "/sign-in"} tabIndex={open ? 0 : -1} className="label hover:text-muted-foreground">
              {accountHref ? "Dashboard" : "Sign in"}
            </Link>
            <Link href="/privacy" tabIndex={open ? 0 : -1} className="label hover:text-muted-foreground">
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
    <span className="theme-switch label">
      {[
        { label: "Light", dark: false },
        { label: "Dark", dark: true },
      ].map((o) => (
        <button
          key={o.label}
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => setTheme(o.dark)}
          className={cn(
            "theme-switch__option",
            o.dark ? "dark:bg-foreground dark:text-background" : "bg-foreground text-background dark:bg-transparent dark:text-inherit",
          )}
        >
          {o.label}
        </button>
      ))}
    </span>
  );
}
