import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TheVetting } from "@/components/site/the-vetting";
import { StudioHero } from "@/components/site/studio/hero";
import { ShortlistFolders } from "@/components/site/studio/shortlist-folders";
import { COMPANY, DIVISIONS, VERTICALS } from "@/lib/content";
import { CHECK_META, STAGES } from "@/lib/quality";

/** Three promises the site already makes elsewhere; nothing here is a new claim. */
const PILLARS = [
  {
    title: "Published methodology",
    body: "Our selection process is public, step by step. You can read exactly what each stage requires before you hire a single person through us.",
  },
  {
    title: "Evidence on every shortlist",
    body: "Each candidate arrives with an assessment report. Identity, qualifications, history and readiness are recorded, not asserted.",
  },
  {
    title: "Free for candidates",
    body: "Employers pay for recruitment. Candidates never pay placement fees, which is why the registry attracts people who would not pay to be seen.",
  },
];

export default function HomePage() {
  const launch = VERTICALS.filter((v) => v.launch);

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <StudioHero />

      {/* ---------------- Sector folders ---------------- */}
      <ShortlistFolders />

      {/* ---------------- Statement ---------------- */}
      <section data-chapter="The difference" className="shell hairline py-24 md:py-40">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <h2 className="headline max-w-[20ch]">
            We help employers hire on evidence, not on CVs.
          </h2>
          <div>
            <p className="lede">{COMPANY.positioning}</p>
            <Link href="/about" className="chars mt-8 inline-flex items-center gap-2">
              Learn more <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <dl className="mt-20 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {[
            [String(STAGES.length), "evidence-gated quality stages"],
            [String(Object.keys(CHECK_META).length), "verification checks per candidate"],
            ["~5", "candidates per shortlist, not 100"],
          ].map(([value, label]) => (
            <div key={label} className="bg-background p-8">
              <dd className="display text-primary" style={{ fontSize: "clamp(2.5rem,5vw,4rem)" }}>
                {value}
              </dd>
              <dt className="label mt-3">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- Big statement ---------------- */}
      <section className="xxdark-gradient shell py-28 md:py-44">
        <h2 className="display max-w-[16ch]">
          A new kind of shortlist, built on <span className="text-primary">recorded evidence</span>.
        </h2>
      </section>

      {/* ---------------- Pillars ---------------- */}
      <section data-chapter="How it works" className="shell py-24 md:py-40">
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="hairline pt-6">
              <p className="label">[ {String(i + 1).padStart(2, "0")} ]</p>
              <h3 className="subhead mt-6">{p.title}</h3>
              <p className="lede mt-4">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- The vetting: pinned scroll sequence ---------------- */}
      <TheVetting />

      {/* ---------------- Divisions, as the reference's service blocks ---------------- */}
      <section data-chapter="What we do" className="shell py-24 md:py-40">
        {DIVISIONS.map((d, i) => (
          <div
            key={d.slug}
            className="hairline grid gap-10 py-16 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-24"
          >
            <div>
              <p className="label">[ {d.kicker} ]</p>
              <h3 className="headline mt-6 max-w-[14ch]">{d.summary}</h3>
            </div>
            <div className="flex flex-col justify-between gap-10">
              <div>
                <p className="label">{d.name}</p>
                <ul className="mt-6 grid gap-px overflow-hidden border-y border-border bg-border">
                  {d.services.map((s) => (
                    <li key={s.title} className="bg-background py-4">
                      <p className="font-medium">{s.title}</p>
                      <p className="lede mt-1 text-sm">{s.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={`/services/${d.slug}`} className="chars inline-flex items-center gap-2 self-start">
                Learn more <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
            <span className="label md:col-span-2">
              {String(i + 1).padStart(2, "0")} — {String(DIVISIONS.length).padStart(2, "0")}
            </span>
          </div>
        ))}
      </section>

      {/* ---------------- Sectors, as the reference's bordered preview rows ---------------- */}
      <section data-chapter="Sectors" className="py-24 md:py-40">
        <div className="shell mb-12 flex items-end justify-between gap-8">
          <h2 className="headline max-w-[16ch]">Where we go deep.</h2>
          <Link href="/sectors" className="chars inline-flex shrink-0 items-center gap-2">
            All sectors <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="hairline">
          {launch.map((v, i) => (
            <Link
              key={v.slug}
              href={`/sectors/${v.slug}`}
              className="row-item shell group flex items-center gap-6 py-8 md:gap-12"
            >
              <span className="label w-10 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span
                className="min-w-0 flex-1 font-medium leading-none"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem,3.5vw,3.5rem)" }}
              >
                {v.name}
              </span>
              <span className="label hidden max-w-[28ch] flex-1 md:block">{v.blurb}</span>
              <ArrowUpRight
                className="size-6 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Closing ---------------- */}
      <section data-chapter="Start" className="shell py-24 md:py-40">
        <div className="rounded-lg border border-border p-10 md:p-20">
          <p className="label">[ Start here ]</p>
          <h2 className="headline mt-8 max-w-[18ch]">
            Give us one vacancy. We will run the whole process and you decide if it was worth it.
          </h2>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/employers#request"
              className="chars inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground"
            >
              Request talent <ArrowUpRight className="size-4" aria-hidden />
            </Link>
            <Link href="/register/candidate" className="chars inline-flex items-center gap-2">
              Join the registry <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
