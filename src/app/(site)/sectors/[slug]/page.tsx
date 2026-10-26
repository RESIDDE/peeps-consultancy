import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaLine } from "@/components/site/studio/cta-line";
import { Block, Boxes, MarkRule, MoreLinks, PageOpening, Pronouncement, SectionHead, Tone } from "@/components/site/studio/page-kit";
import { WordMarquee } from "@/components/site/studio/word-marquee";
import { VERTICALS } from "@/lib/content";
import { SECTOR_BY_CODE } from "@/lib/taxonomy";

export function generateStaticParams() {
  return VERTICALS.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = VERTICALS.find((x) => x.slug === slug);
  return v ? { title: `${v.name} Talent`, description: v.blurb } : {};
}

const pad = (n: number) => String(n).padStart(2, "0");

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = VERTICALS.find((x) => x.slug === slug);
  if (!v) notFound();
  const others = VERTICALS.filter((x) => x.slug !== v.slug);

  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label={v.launch ? "Launch vertical" : "Growing talent pool"}
          title={`${v.name} talent.`}
          lede={v.blurb}
          actions={
            <>
              <CtaLine href="/employers#request">Request talent</CtaLine>
              <CtaLine href="/register/candidate">Join this pool</CtaLine>
            </>
          }
          facts={[
            { value: pad(v.roles.length), label: "Role types in this pool" },
            { value: pad(v.assessment.length), label: "Things every candidate here is assessed on" },
            { value: pad(v.sectors.length), label: v.sectors.map((c) => SECTOR_BY_CODE[c].name).join(" · ") },
          ]}
        />

        <WordMarquee
          words={v.assessment}
          lead={
            <>
              Assessed on,
              <br />
              not asked about.
            </>
          }
          foot={`✦ ${v.name}, tested before you meet them.`}
        />
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="Roles we place"
            title="Who you'll find in this pool."
            lede="Every one of them reaches you screened, verified and assessed, with the evidence on file."
          />

          <ul className="shell mt-16 grid sm:grid-cols-2 sm:gap-x-12">
            {v.roles.map((r, i) => (
              <li key={r} className="hairline flex items-baseline gap-6 py-5">
                <span className="label text-muted-foreground">{pad(i + 1)}</span>
                <span className="text-[1.15rem] leading-snug">{r}</span>
              </li>
            ))}
          </ul>
          <div aria-hidden className="shell">
            <div className="hairline" />
          </div>
        </Block>
      </Tone>

      <Tone tone="dark">
        <Pronouncement
          foot={
            <>
              <p className="text-[0.95rem] leading-snug text-muted-foreground">{v.why}</p>
              <CtaLine href="/how-we-select" className="mt-12">
                Read the full method
              </CtaLine>
            </>
          }
        >
          Why PEEPs for {v.name.toLowerCase()}.
        </Pronouncement>

        <Block className="pt-0">
          <div className="shell">
            <p className="label text-muted-foreground">Candidates here are assessed on</p>
            <Boxes className="mt-7" items={v.assessment} />
          </div>
          <MarkRule className="mt-24 w-[80%]" mark="cross" />
        </Block>
      </Tone>

      <Tone tone="light">
        <MoreLinks
          label="Other talent pools"
          items={others.map((o) => ({
            href: `/sectors/${o.slug}`,
            label: o.name,
            note: o.launch ? "Launch vertical" : "Growing pool",
          }))}
        />
      </Tone>
    </>
  );
}
