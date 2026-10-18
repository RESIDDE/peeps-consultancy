import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { requireRole, STAFF } from "@/lib/permissions";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = { title: { default: "Console", template: "%s · PEEPs Console" }, robots: { index: false } };

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(STAFF);
  const [{ n }] = await db.select({ n: count() }).from(enquiries).where(eq(enquiries.status, "new"));

  return (
    <div className="min-h-dvh bg-background">
      <ConsoleSidebar
        user={{ name: session.user.name, role: session.role }}
        counts={{ enquiries: n }}
        footer={
          <div className="flex items-center justify-between">
            <SignOutButton className="text-white/70 hover:text-white" />
            <ThemeToggle className="size-7 text-white/60 hover:bg-white/10 hover:text-white" />
          </div>
        }
      />
      <main id="main" className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
