import type { Metadata } from "next";
import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { typesInGroup } from "@/lib/submissions";
import { requireRole, STAFF } from "@/lib/permissions";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LagosClock } from "@/components/site/studio/lagos-clock";

export const metadata: Metadata = {
  title: { default: "Console", template: "%s · PEEPs Console" },
  robots: { index: false },
};

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(STAFF);
  // Badges count only what is still unanswered, so they mean "pick these up", not "look here".
  const [[{ n }], [{ s: serviceCount }]] = await Promise.all([
    db.select({ n: count() }).from(enquiries).where(eq(enquiries.status, "new")),
    db
      .select({ s: count() })
      .from(enquiries)
      .where(and(eq(enquiries.status, "new"), inArray(enquiries.type, typesInGroup("services")))),
  ]);

  return (
    <div className="studio min-h-dvh flex flex-col bg-background text-foreground selection:bg-primary/20">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[4px] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to content
      </a>

      <ConsoleSidebar
        user={{ name: session.user.name, role: session.role }}
        counts={{ enquiries: n, services: serviceCount }}
        footer={
          <div className="flex items-center justify-between">
            <SignOutButton className="text-white/70 hover:text-white text-xs font-mono" />
            <ThemeToggle className="size-7 text-white/60 hover:bg-white/10 hover:text-white" />
          </div>
        }
      />

      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Operational Bar (Desktop) */}
        <header className="sticky top-0 z-20 hidden lg:flex h-14 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="label text-[0.72rem] text-muted-foreground">OPERATIONS DESK // CENTRAL REGISTRY</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-[4px] border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span>Lagos / Abuja · <LagosClock /></span>
            </div>
            <ThemeToggle className="size-8" />
          </div>
        </header>

        <main id="main" className="flex-1">
          <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10 lg:py-12">{children}</div>
        </main>

        <footer className="border-t border-border bg-muted/10 px-8 py-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-muted-foreground">
            <p className="label text-[0.68rem] tracking-wider">
              PEEPs Consultancy Services · Internal Administrative System
            </p>
            <p className="font-mono text-[0.68rem]">
              Confidential Staff Operations · NDPA 2023 Compliant
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
