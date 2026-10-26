import type { Metadata } from "next";
import { RequestTalentForm } from "@/components/site/forms";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  FormBlock,
  IndexRows,
  MarkRule,
  MoreLinks,
  PageOpening,
  Panel,
  Pronouncement,
  SectionHead,
  Tone,
} from "@/components/site/studio/page-kit";
import { EMPLOYER_PROCESS } from "@/lib/content";
import { PACKAGES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "For Employers",
  description: "Recruitment solutions, executive search, contract staffing and employer membership from PEEPs.HR Partners.",
};

const pad = (n: number) => String(n).padStart(2, "0");

const MEMBERSHIP = [
  "Vacancy posting and priority sourcing",
  "Access to PEEPs Ready talent pools",
  "Candidate screening and interview support",
  "Discounts on Academy training",
  "HR advisory hours",
  "Quarterly workforce reports",
];

const NEXT_STEPS = [
  "A consultant calls within one working day",
  "Vacancy analysis: we agree what success looks like",
  "You receive a proposal and timeline",
  "We begin sourcing from the registry and partners",
];

export default function EmployersPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="For employers"
          title="A recruitment solution, not a CV service."
          lede="Tell us the role. We'll work out who will actually succeed in your organisation, then find, verify and assess them. You get a short list where every candidate comes with evidence."
          actions={
            <>
              <CtaLine href="#request">Request talent</CtaLine>
              <CtaLine href="/register/employer">Create an account</CtaLine>
            </>
          }
          facts={[
            { value: pad(EMPLOYER_PROCESS.length), label: "Steps from vacancy analysis to onboarding" },
            { value: "~5", label: "Candidates per shortlist, each with an assessment report" },
            { value: "0%", label: "Up front. Permanent placements are success-based" },
          ]}
        />

        <Pronouncement
          foot={
            <p className="text-[0.95rem] leading-snug text-muted-foreground">
              We analyse the vacancy before we look at a single CV. That is the whole difference between a shortlist and a
              pile of applications.
            </p>
          }
        >
          A hundred CVs is not a shortlist.
        </Pronouncement>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="How it works"
            title="Eight steps from vacancy to onboarding."
            lede="Yours and ours, in the order they happen. Nothing is skipped and nothing is hurried."
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <IndexRows className="mt-6" items={EMPLOYER_PROCESS.map((s) => ({ title: s.title, body: s.body }))} />
        </Block>
      </Tone>

      <Tone tone="dark">
        <Block id="packages">
          <SectionHead
            label="Recruitment packages"
            title="Choose the depth of support you need."
            lede="Fees depend on role, seniority and volume, and every engagement starts with a proposal. Permanent placements are success-based, with retained options for executive search."
          />

          <ul className="shell mt-20 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((p, i) => {
              const picked = p.value === "professional";
              return (
                <li
                  key={p.value}
                  className={cn(
                    "flex flex-col rounded-[7px] border p-7",
                    picked ? "border-foreground bg-foreground text-background" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className={cn("label", picked ? "opacity-60" : "text-muted-foreground")}>{pad(i + 1)}</span>
                    {picked && <span className="label border border-current px-3 py-1.5">Most chosen</span>}
                  </div>

                  <h3 className="subhead mt-12 text-[clamp(1.35rem,1.9vw,1.75rem)]">{p.short}</h3>
                  <p className={cn("mt-4 text-[0.95rem] leading-snug", picked ? "opacity-70" : "text-muted-foreground")}>
                    {p.tagline}
                  </p>

                  <ul className="mt-8 grid">
                    {p.includes.map((inc) => (
                      <li
                        key={inc}
                        className={cn(
                          "border-t py-3 text-[0.95rem] leading-snug last:border-b",
                          picked ? "border-background/20" : "border-border text-muted-foreground",
                        )}
                      >
                        {inc}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-10">
                    <CtaLine href="#request" className="w-full">
                      Request a proposal
                    </CtaLine>
                  </div>
                </li>
              );
            })}
          </ul>
        </Block>
      </Tone>

      <Tone tone="light">
        <Block>
          <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-x-16">
            <div>
              <p className="label text-muted-foreground">Contract &amp; workforce</p>
              <h2 className="headline mt-7 max-w-[14ch] text-[clamp(2rem,3.6vw,3.2rem)]">
                Need twenty accountants for six months?
              </h2>
              <p className="mt-8 max-w-[34ch] text-[0.95rem] leading-snug text-muted-foreground">
                PEEPs Workforce recruits the team, deploys them to you and manages the arrangement under one contract with
                one monthly invoice. You pay the employee cost plus a transparent PEEPs service margin.
              </p>
              <CtaLine href="/services/workforce" className="mt-12">
                Explore PEEPs Workforce
              </CtaLine>
            </div>

            <Panel>
              <p className="label text-muted-foreground">PEEPs Employer Membership</p>
              <h3 className="subhead mt-6">Recruitment support on subscription.</h3>
              <p className="mt-5 max-w-[36ch] text-[0.95rem] leading-snug text-muted-foreground">
                If you hire regularly, pay a monthly or annual subscription instead of paying for each vacancy.
              </p>
              <ul className="mt-8 grid">
                {MEMBERSHIP.map((m) => (
                  <li key={m} className="border-t border-border py-3 text-[0.95rem] leading-snug last:border-b">
                    {m}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </Block>

        <FormBlock
          id="request"
          label="Request talent"
          title="Tell us who you need."
          lede="Your request goes straight to a PEEPs consultant, who will contact you to start the vacancy analysis. If this is your first time working with us, ask for a pilot engagement."
          aside={
            <ol className="mt-12 max-w-[34ch]">
              {NEXT_STEPS.map((s, i) => (
                <li key={s} className="hairline flex items-baseline gap-5 py-3.5 text-[0.95rem] leading-snug last:border-b">
                  <span className="label text-muted-foreground">{pad(i + 1)}</span>
                  {s}
                </li>
              ))}
            </ol>
          }
        >
          <RequestTalentForm />
        </FormBlock>

        <MoreLinks
          label="Before you ask"
          items={[
            { href: "/how-we-select", label: "Method", note: "What happens before a name reaches you" },
            { href: "/sectors", label: "Sectors", note: "The pools we recruit from" },
            { href: "/services/workforce", label: "Workforce", note: "Contract and outsourced teams" },
          ]}
        />
      </Tone>
    </>
  );
}
