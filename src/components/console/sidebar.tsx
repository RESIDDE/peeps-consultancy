"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Briefcase,
  Handshake,
  Inbox,
  LayoutDashboard,
  Menu,
  LifeBuoy,
  Users,
  Wallet,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LagosClock } from "@/components/site/studio/lagos-clock";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

const NAV = [
  { href: "/console", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/console/enquiries", label: "Inbox", icon: Inbox, badgeKey: "enquiries" as const },
  { href: "/console/services", label: "Service Desk", icon: LifeBuoy, badgeKey: "services" as const },
  { href: "/console/talent", label: "Talent Registry", icon: Users },
  { href: "/console/employers", label: "Employers & CRM", icon: Building2 },
  { href: "/console/vacancies", label: "Client Vacancies", icon: Briefcase },
  { href: "/console/placements", label: "Placements & Revenue", icon: Wallet },
  { href: "/console/partners", label: "Training Partners", icon: Handshake },
];

export function ConsoleSidebar({
  user,
  counts,
  footer,
}: {
  user: { name: string; role: string };
  /** Unanswered counts for the badges, keyed to NAV's `badgeKey`. */
  counts: { enquiries: number; services: number };
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Console" className="grid gap-1">
      {NAV.map((item, idx) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const badge = item.badgeKey ? counts[item.badgeKey] : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-[5px] px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors",
              active
                ? "bg-white/12 text-white font-medium shadow-xs"
                : "text-white/60 hover:bg-white/6 hover:text-white",
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
              />
            )}
            <span
              className={cn(
                "text-[10px] w-4 font-mono transition-colors",
                active ? "text-primary font-bold" : "text-white/40 group-hover:text-white/70",
              )}
            >
              {pad(idx + 1)}
            </span>
            <item.icon className={cn("size-3.5 shrink-0", active ? "text-primary" : "text-white/60")} />
            <span className="flex-1 truncate normal-case font-sans text-sm tracking-normal">
              {item.label}
            </span>
            {badge > 0 && (
              <span className="rounded-[3px] bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-primary-foreground">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const body = (
    <div className="flex h-full flex-col gap-5 p-5">
      {/* Brand & Mode Identification */}
      <div>
        <Link href="/console" className="block pt-1 transition-opacity hover:opacity-85" onClick={() => setOpen(false)}>
          <Logo tone="onDark" />
        </Link>
        <div className="mt-3 flex items-center justify-between border-b border-white/10 pb-3">
          <p className="label text-[0.68rem] tracking-wider text-white/50">Staff Operations</p>
          <span className="rounded-[3px] border border-primary/40 bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary uppercase">
            Admin v2
          </span>
        </div>
      </div>

      {/* Clock indicator */}
      <div className="flex items-center gap-2 rounded-[4px] border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-white/70">
        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        <span>Abuja / Lagos · <LagosClock /></span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <p className="label mb-2 text-[0.68rem] tracking-wider text-white/40 px-1">Navigation Index</p>
        {nav}
      </div>

      {/* Bottom User Coordinates */}
      <div className="mt-auto grid gap-3 border-t border-white/10 pt-4">
        <Link
          href={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}
          className="flex items-center gap-2 px-1 font-mono text-xs text-white/50 hover:text-white transition-colors"
        >
          <ExternalLink className="size-3.5" />
          <span>View Public Platform</span>
        </Link>

        <div className="rounded-[6px] border border-white/10 bg-white/[0.04] p-3.5">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-[4px] border border-white/20 bg-white/10 font-mono text-xs font-semibold text-white"
              aria-hidden
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">{user.role}</p>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">{footer}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#06100e] text-ink-foreground lg:block">
        {body}
      </aside>

      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#06100e] px-4 text-ink-foreground lg:hidden">
        <Link href="/console">
          <Logo compact tone="onDark" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/70">
            <LagosClock />
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open console menu"
            aria-expanded={open}
            className="inline-flex size-9 items-center justify-center rounded-[4px] border border-white/20 hover:bg-white/10 text-white"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Console menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#06100e] text-ink-foreground shadow-2xl border-r border-white/10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 inline-flex size-8 items-center justify-center rounded-[4px] border border-white/20 hover:bg-white/10 text-white"
            >
              <X className="size-4" />
            </button>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
