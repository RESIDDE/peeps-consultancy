import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/forms";
import { CtaLine } from "@/components/site/studio/cta-line";
import {
  Block,
  FormBlock,
  IndexRows,
  MarkRule,
  MoreLinks,
  PageOpening,
  Pronouncement,
  SectionHead,
  Tone,
} from "@/components/site/studio/page-kit";
import { StudioQualityLadder } from "@/components/site/studio/quality-ladder";
import { CAREER_SERVICES, SELECTION_STEPS } from "@/lib/content";
import { STAGES } from "@/lib/quality";

export const metadata: Metadata = {
  title: "For Talent",
  description: "Join the PEEPs Talent Registry: get verified, assessed and put forward to serious employers, free of charge.",
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function CandidatesPage() {
  return (
    <>
      <Tone tone="dark">
        <PageOpening
          label="For professionals"
          title="Get assessed. Get prepared. Get seen."
          lede="Join the PEEPs Talent Registry free of charge. We verify your credentials and assess your skills, then put you forward for roles where you're a genuine fit. Employers see the evidence, so they see you at your best."
          actions={
            <>
              <CtaLine href="/register/candidate">Register your profile</CtaLine>
              <CtaLine href="/sign-in">I have an account</CtaLine>
            </>
          }
          facts={[
            { value: "00", label: "Naira to register, be verified, be assessed and be put forward" },
            { value: pad(STAGES.length), label: "Stages on the quality ladder, tracked in your dashboard" },
            { value: "Never", label: "Do we charge a jobseeker a placement fee" },
          ]}
        />

        <Pronouncement
          foot={
            <p className="text-[0.95rem] leading-snug text-muted-foreground">
              Registering, verification, assessment for a vacancy and being put forward to employers are all free. We also
              offer optional career-development services, but you never need them to be considered for a role.
            </p>
          }
        >
          Employers pay for recruitment. You never pay to be placed.
        </Pronouncement>
      </Tone>

      <Tone tone="light">
        <Block>
          <SectionHead
            label="Your journey"
            title="Climb the quality ladder."
            lede="Each rung you reach makes your profile more credible to employers, and you can see exactly where you stand."
          />
          <div className="shell mt-20">
            <StudioQualityLadder />
          </div>
        </Block>

        <Block className="pt-0">
          <SectionHead
            label="What to expect"
            title="How we get to know you."
            lede="The same eight steps for everyone, whatever the role and whoever is hiring."
          />
          <MarkRule className="mt-20 w-[60%] md:mt-24" />
          <IndexRows className="mt-6" items={SELECTION_STEPS.map((s) => ({ title: s.title, body: s.body }))} />
        </Block>
      </Tone>

      <Tone tone="dark">
        <Block>
          <SectionHead
            label="Optional career services"
            title="Invest in yourself, if and when you choose."
            lede="These services are paid and entirely optional. They are career development, not a fee for being placed."
          />

          <ul className="shell mt-20 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CAREER_SERVICES.map((c, i) => (
              <li key={c.title} className="flex flex-col rounded-[7px] border border-border p-7">
                <span className="label text-muted-foreground">{pad(i + 1)}</span>
                <h3 className="subhead mt-12 text-[clamp(1.25rem,1.7vw,1.6rem)]">{c.title}</h3>
                <p className="mt-5 text-[0.95rem] leading-snug text-muted-foreground">{c.body}</p>
              </li>
            ))}
          </ul>

          <MarkRule className="mt-24 w-[80%]" mark="cross" />
        </Block>
      </Tone>

      <Tone tone="light">
        <FormBlock
          id="career-services"
          label="Book a career service"
          title="Tell us what you're working towards."
          lede="A PEEPs consultant will reply with options and availability. If you only want to be considered for roles, you don't need this form — register instead."
          aside={
            <CtaLine href="/register/candidate" className="mt-12">
              Register your profile
            </CtaLine>
          }
        >
          <EnquiryForm
            type="career_service"
            showOrganisation={false}
            subjectPlaceholder="e.g. CV development, interview preparation"
            submitLabel="Send request"
          />
        </FormBlock>

        <MoreLinks
          label="Elsewhere on the site"
          items={[
            { href: "/how-we-select", label: "Method", note: "What we check, and how" },
            { href: "/sectors", label: "Sectors", note: "Find your talent pool" },
            { href: "/academy", label: "Academy", note: "Training and exam preparation" },
          ]}
        />
      </Tone>
    </>
  );
}
