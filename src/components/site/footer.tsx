import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { COMPANY, DIVISIONS, VERTICALS } from "@/lib/content";

const COLUMNS = [
  {
    title: "Services",
    links: DIVISIONS.map((d) => ({ href: `/services/${d.slug}`, label: d.name })),
  },
  {
    title: "Sectors",
    links: VERTICALS.map((v) => ({ href: `/sectors/${v.slug}`, label: v.name })),
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About PEEPs" },
      { href: "/how-we-select", label: "How we select talent" },
      { href: "/academy", label: "PEEPs Academy" },
      { href: "/partners", label: "Partner with us" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/employers#request", label: "Request talent" },
      { href: "/register/candidate", label: "Join the talent registry" },
      { href: "/register/employer", label: "Create employer account" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="grain relative overflow-hidden bg-ink text-ink-foreground">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo className="[&_.text-muted-foreground]:text-white/60 [&_.text-primary]:text-gold" />
            <p className="mt-5 text-sm leading-relaxed text-white/70">{COMPANY.positioning}</p>
            <p className="mt-6 font-display text-lg italic text-gold">{COMPANY.tagline}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{col.title}</h2>
                <ul className="mt-4 grid gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-white/80 transition-colors hover:text-gold">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. {COMPANY.city}.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <span>Employers pay for recruitment. Candidates never pay placement fees.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
