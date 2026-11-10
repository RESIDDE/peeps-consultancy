"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { getLenis } from "@/components/motion/smooth-scroll";
import { TalentProfileCard } from "@/components/site/talent-profile-card";
import { COMPANY, LIVE_VERTICALS, SOON_VERTICALS, VERTICALS } from "@/lib/content";
import { AUTO_CHECK, OFFERINGS } from "@/lib/services";
import { homeFor } from "@/lib/roles";
import { isAudience } from "@/lib/sign-in";
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

interface MenuChild {
  href: string;
  label: string;
}

interface MenuItem {
  href: string;
  label: string;
  /** The second line, so the menu says what is behind the word. */
  note: string;
  /**
   * The sub-options the row opens. The first is always the section's own page, because the
   * word itself toggles the row rather than navigating — so this is how you still reach it.
   * Every destination here is a real page or a real anchor on one; nothing is a placeholder.
   */
  children: MenuChild[];
}

/**
 * The menu, two levels deep.
 *
 * Each row collapses to its word, and opens on hover or on click to show what is under it.
 * That keeps six rows and twenty-nine destinations legible at once, and it means every
 * service stays reachable from the top menu on every page, as the brief asks.
 */
const ITEMS: MenuItem[] = [
  {
    href: "/employers",
    label: "Employers",
    note: "Request a shortlist",
    children: [
      { href: "/employers", label: "For employers" },
      { href: "/employers#request", label: "Request a shortlist" },
      { href: "/employers#packages", label: "Recruitment packages" },
      { href: "/how-we-select", label: "How we select" },
      { href: "/sign-in/employer", label: "Employer sign-in" },
    ],
  },
  {
    href: "/candidates",
    label: "Talent",
    note: "Join the registry",
    children: [
      { href: "/candidates", label: "For talent" },
      { href: "/register/candidate", label: "Register your profile" },
      { href: "/candidates#career-services", label: "Career services" },
      { href: "/academy", label: "PEEPs Academy" },
      { href: "/sign-in/candidate", label: "Candidate sign-in" },
    ],
  },
  {
    href: "/services",
    label: "Services",
    note: `${OFFERINGS.length} services`,
    children: [
      { href: "/services", label: "All services" },
      ...OFFERINGS.map((o) => ({ href: o.href, label: o.short })),
    ],
  },
  {
    href: "/sectors",
    // The count says live and growing separately: two of the pools have not launched.
    label: "Sectors",
    note: `${LIVE_VERTICALS.length} live, ${SOON_VERTICALS.length} growing`,
    children: [
      { href: "/sectors", label: "All sectors" },
      ...VERTICALS.map((v) => ({ href: `/sectors/${v.slug}`, label: v.name })),
    ],
  },
  {
    href: "/how-we-select",
    label: "Method",
    note: "How we select",
    children: [
      { href: "/how-we-select", label: "The method in full" },
      { href: "/how-we-select#steps", label: "The eight steps" },
      { href: "/how-we-select#framework", label: "Quality framework" },
      { href: "/how-we-select#ladder", label: "The quality ladder" },
      { href: "/how-we-select#assessment", label: "Sector assessment" },
    ],
  },
  {
    href: "/contact",
    label: "Contact",
    note: "Say hello",
    children: [
      { href: "/contact", label: "Contact PEEPs" },
      { href: "/contact#message", label: "Send a message" },
      { href: "/partners", label: "Partnerships" },
      { href: "/about", label: "About PEEPs" },
    ],
  },
];

export function StudioNav() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [accountHref, setAccountHref] = useState<string | null>(null);
  /**
   * Which menu row is showing its sub-options. Two pieces of state rather than one so
   * hover and click never fight: a click pins a row open, a mouse passing over another
   * previews it, and leaving the list falls back to whatever was pinned.
   */
  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const openRow = hovered ?? pinned;

  /** Closing forgets which row was open, so the menu never reopens half-unfolded. */
  const closeMenu = useCallback(() => {
    setOpen(false);
    setPinned(null);
    setHovered(null);
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/auth/get-session", { signal: ctrl.signal, credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { user?: { role?: string } } | null) => {
        // Only employers and candidates have a dashboard on this site.
        if (s?.user?.role && isAudience(s.user.role)) setAccountHref(homeFor(s.user.role));
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

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
        <Link href="/" aria-label={`${COMPANY.name} home`} onClick={closeMenu}>
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
          {/* The bar carries nothing else. Request talent and Book Auto Check now live in
              the menu — in its footer and under Employers and Services — so the header
              stays two controls wide at every size and the logo keeps the room. */}
          <button
            type="button"
            onClick={() => (open ? closeMenu() : setOpen(true))}
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
          <nav aria-label="Main" onMouseLeave={() => setHovered(null)}>
            <ul>
              {ITEMS.map((item, i) => {
                const expanded = openRow === item.href;
                const subId = `menu-sub-${item.label.toLowerCase()}`;
                return (
                  <li
                    key={item.href}
                    className="menu-row"
                    style={{ "--i": i } as React.CSSProperties}
                    // A mouse opens the row on the way past; a finger does not, because on
                    // touch the same gesture is the tap that opens it deliberately.
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setHovered(item.href);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPinned((p) => (p === item.href ? null : item.href));
                        setHovered(null);
                      }}
                      tabIndex={open ? 0 : -1}
                      aria-expanded={expanded}
                      aria-controls={subId}
                      className="menu-link"
                      data-active={pathname === item.href || undefined}
                    >
                      <span className="menu-word">{item.label}</span>
                      <span className="menu-note label">{item.note}</span>
                      <span aria-hidden className="menu-caret" data-open={expanded || undefined}>
                        <ChevronDown className="size-full" />
                      </span>
                    </button>

                    <div id={subId} className="menu-sub" data-open={expanded || undefined} aria-hidden={!expanded}>
                      {/* The inner wrapper is what overflow hides: the grid row animates from
                          0fr to 1fr, so the list opens to its own height without a magic number. */}
                      <div>
                        <ul className="menu-sub__list">
                          {item.children.map((c) => (
                            <li key={`${item.href}${c.href}`}>
                              <Link
                                href={c.href}
                                onClick={closeMenu}
                                // Not reachable by tab while the row is folded away.
                                tabIndex={open && expanded ? 0 : -1}
                                aria-current={pathname === c.href ? "page" : undefined}
                                className="menu-sub__link"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          <aside className="menu-row hidden lg:block" style={{ "--i": ITEMS.length } as React.CSSProperties}>
            <TalentProfileCard className="w-full max-w-md" />
            <p className="label mt-6 text-muted-foreground">A sample talent profile</p>
          </aside>
        </div>

        <div className="menu-foot shell">
          <span onClick={closeMenu} className="flex flex-wrap gap-x-10 gap-y-4">
            <CtaLine href="/employers#request">Request talent</CtaLine>
            <CtaLine href={AUTO_CHECK.action.href}>Book Auto Check</CtaLine>
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
