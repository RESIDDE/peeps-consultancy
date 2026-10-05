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
  Users,
  Wallet,
  X,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/console", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/console/talent", label: "Talent Registry", icon: Users },
  { href: "/console/employers", label: "Employers", icon: Building2 },
  { href: "/console/vacancies", label: "Vacancies", icon: Briefcase },
  { href: "/console/placements", label: "Placements & revenue", icon: Wallet },
  { href: "/console/partners", label: "Partners", icon: Handshake },
  { href: "/console/enquiries", label: "Enquiries", icon: Inbox, badgeKey: "enquiries" as const },
];

export function ConsoleSidebar({
  user,
  counts,
  footer,
}: {
  user: { name: string; role: string };
  counts: { enquiries: number };
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Console" className="grid gap-0.5">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const badge = item.badgeKey ? counts[item.badgeKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className={cn("size-4", active ? "text-gold" : "")} />
            <span className="flex-1">{item.label}</span>
            {badge > 0 && (
              <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold leading-none text-gold-foreground">{badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const body = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/console" className="px-2 pt-2" onClick={() => setOpen(false)}>
        <Logo className="[&_.text-muted-foreground]:text-white/50 [&_.text-primary]:text-gold" />
      </Link>
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">PEEPs Console</p>
      {nav}
      <div className="mt-auto grid gap-3">
        <Link href="/" className="flex items-center gap-2 px-3 text-xs text-white/50 hover:text-white">
          <ExternalLink className="size-3.5" /> View public site
        </Link>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs capitalize text-white/50">{user.role}</p>
          <div className="mt-3">{footer}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink text-ink-foreground lg:block">{body}</aside>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-ink px-4 text-ink-foreground lg:hidden">
        <Link href="/console">
          <Logo compact className="[&_.text-primary]:text-gold" />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open console menu"
          aria-expanded={open}
          className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
        >
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Console menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink text-ink-foreground shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 inline-flex size-9 items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
