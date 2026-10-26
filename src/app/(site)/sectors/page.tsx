import type { Metadata } from "next";
import Link from "next/link";
import { CtaLine } from "@/components/site/studio/cta-line";
import { Block, IndexRows, MarkRule, MoreLinks, PageOpening, Pronouncement, SectionHead, Tone } from "@/components/site/studio/page-kit";
import { DIVISIONS, VERTICALS } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sectors", description: "PEEPs talent verticals and pools." };

const pad = (n: number) => String(n).padStart(2, "0");
const LAUNCHED = VERTICALS.filter((v) => v.launch);
const ROLE_COUNT = VERTICALS.reduce((n, v) => n + v.roles.length, 0);

export default function SectorsPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="Sectors"
          title="Deep talent pools, not a catch-all database."
          lede="Each vertical has its own talent pool, its own assessment criteria and its own partner network."
          actions={
            <>
              <CtaLine href="/employers#request">Request talent</CtaLine>
              <CtaLine href="/register/candidate">Join a pool</CtaLine>
            </>
          }
          facts={[
            { value: pad(VERTICALS.length), label: "Talent pools, each assessed on its own terms" },
            { value: pad(LAUNCHED.length), label: "Launch verticals, open and recruiting today" },
            { value: pad(ROLE_COUNT), label: "Role types across the pools" },
          ]}
        />
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="The pools"
            title="Five pools, built one at a time."
            lede="Three are open today. Technology and Hospitality are growing through partner academies."
          />

          <ul className="shell mt-20 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {VERTICALS.map((v, i) => (
              <li key={v.slug}>
                <Link
                  href={`/sectors/${v.slug}`}
                  className="group flex h-full min-h-[21rem] flex-col justify-between rounded-[7px] border border-border p-7 transition-colors duration-300 hover:bg-foreground hover:text-background"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="label text-muted-foreground transition-colors duration-300 group-hover:text-background/60">
                      {pad(i + 1)}
                    </span>
                    <span className={cn("label border px-3 py-1.5", v.launch ? "border-current" : "border-current opacity-55")}>
                      {v.launch ? "Launch vertical" : "Growing pool"}
                    </span>
                  </div>

                  <div className="mt-14">
                    <h3 className="subhead">{v.name}</h3>
                    <p className="mt-5 max-w-[32ch] text-[0.95rem] leading-snug text-muted-foreground transition-colors duration-300 group-hover:text-background/70">
                      {v.blurb}
                    </p>
                    <p className="label mt-8 flex items-center gap-2">
                      {v.roles.length} role types
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Block>
      </Tone>

      <Tone tone="dark">
        <Pronouncement
          foot={
            <p className="text-[0.95rem] leading-snug text-muted-foreground">
              An accountant&apos;s assessment looks nothing like a mechanic&apos;s. Each pool is tested on what the work
              actually asks for.
            </p>
          }
        >
          A pool is only as good as the test behind it.
        </Pronouncement>

        <Block className="pt-0">
          <SectionHead label="Assessment" title="What each pool is tested on." />
          <MarkRule className="mt-16 w-[60%]" />
          <IndexRows
            className="mt-6"
            items={VERTICALS.map((v) => ({
              title: v.name,
              body: v.assessment.join(" · "),
              note: v.launch ? "Open" : "Growing",
              href: `/sectors/${v.slug}`,
            }))}
          />
        </Block>
      </Tone>

      <Tone tone="light">
        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/how-we-select", label: "Method", note: "How we select" },
            { href: "/services", label: "Services", note: `${DIVISIONS.length} divisions` },
            { href: "/employers", label: "Employers", note: "Request a shortlist" },
          ]}
        />
      </Tone>
    </>
  );
}
