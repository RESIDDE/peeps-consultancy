import Link from "next/link";
import { COMPANY, DIVISIONS, VERTICALS } from "@/lib/content";
import { CtaLine } from "./cta-line";
import { LagosClock } from "./lagos-clock";
import { LineWordmark } from "./line-wordmark";

const COLUMNS = [
  { title: "Services", links: DIVISIONS.map((d) => ({ label: d.name, href: `/services/${d.slug}` })) },
  { title: "Sectors", links: VERTICALS.map((v) => ({ label: v.name, href: `/sectors/${v.slug}` })) },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How we select", href: "/how-we-select" },
      { label: "Partner with us", href: "/partners" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

/**
 * The closing call to action and the footer in one, dark whatever the theme: the ask, the
 * ways to reach a person, the site's map, and the wordmark drawn in lines along the bottom.
 */
export function StudioFooter() {
  return (
    <footer data-tone="dark" className="tone-dark haze relative overflow-hidden">
      <div className="shell pt-24 md:pt-28">
        <div className="label flex justify-between gap-6">
          <p>Let&apos;s find your next hire.</p>
          <p className="text-muted-foreground">
            WAT → <LagosClock />
          </p>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="display max-w-[12ch]">Give us one vacancy.</h2>
            <p className="mt-8 max-w-[34ch] text-[0.95rem] leading-snug text-muted-foreground">
              We will run the whole process, and you decide if it was worth it.
            </p>
          </div>
          <div className="flex flex-col gap-7">
            <CtaLine href="/employers#request">Request talent</CtaLine>
            <CtaLine href="/register/candidate">Join the registry</CtaLine>
          </div>
        </div>

        <div className="mt-24 grid gap-12 md:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto_auto] xl:gap-16">
          <div className="label flex flex-col justify-between gap-8">
            <p>
              © {COMPANY.name} {new Date().getFullYear()}
            </p>
            <p className="text-muted-foreground">Candidates never pay placement fees.</p>
          </div>

          <div>
            <p className="label text-muted-foreground">Business enquiry</p>
            <p className="mt-4 text-[1.05rem]">
              <span className="text-muted-foreground">E.</span>{" "}
              <a href={`mailto:${COMPANY.email}`} className="hover:text-muted-foreground">
                {COMPANY.email}
              </a>
            </p>
            <p className="mt-1.5 text-[1.05rem]">
              <span className="text-muted-foreground">P.</span>{" "}
              <a href={`tel:${COMPANY.phone.replace(/\s+/g, "")}`} className="hover:text-muted-foreground">
                {COMPANY.phone}
              </a>
            </p>
            <p className="mt-1.5 text-[1.05rem] text-muted-foreground">{COMPANY.city}</p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="label text-muted-foreground">{col.title}</p>
              <ul className="mt-4 grid gap-1.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[1.05rem] transition-colors hover:text-muted-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <p className="label shell mt-20 hidden text-muted-foreground pointer-fine:block">Sweep across the lines.</p>
      <div className="shell mt-6 pb-[var(--shell)]">
        <LineWordmark />
      </div>
    </footer>
  );
}
