"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

export function PortalNav({ items }: { items: { href: string; label: string; exact?: boolean }[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Portal Navigation" className="-mb-px flex gap-2 overflow-x-auto py-1">
      {items.map((i, index) => {
        const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);

        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-2 whitespace-nowrap rounded-[4px] px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200",
              active
                ? "bg-foreground/10 text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "text-[0.68rem] transition-colors",
                active ? "text-primary font-bold" : "text-muted-foreground/60 group-hover:text-foreground",
              )}
            >
              {pad(index + 1)}
            </span>
            <span>{i.label}</span>

            {active && (
              <span
                aria-hidden
                className="absolute inset-x-2 -bottom-1 h-0.5 bg-primary"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
