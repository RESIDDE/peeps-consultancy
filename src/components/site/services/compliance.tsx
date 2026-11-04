"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  Building2,
  CircleHelp,
  Cpu,
  Fuel,
  GraduationCap,
  type LucideIcon,
  PiggyBank,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { getLenis } from "@/components/motion/smooth-scroll";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { COMPLIANCE, COMPLIANCE_AREAS, type ComplianceAreaSlug } from "@/lib/services";
import { requestComplianceCheck } from "@/server/actions/public";
import { cn } from "@/lib/utils";
import { CheckboxGroup, Consent, ContactFields, Honeypot } from "./shared";

/**
 * The compliance cards and the check form share one selection: pressing Get help on a card
 * ticks that area in the form below and takes you to it, which is what the brief asks for.
 * Both sit inside this provider, so the page can keep them in separate sections.
 */
const Selection = createContext<{
  chosen: readonly string[];
  toggle: (slug: string) => void;
  pick: (slug: string) => void;
} | null>(null);

function useSelection() {
  const ctx = useContext(Selection);
  if (!ctx) throw new Error("Compliance cards and form must sit inside <ComplianceProvider>");
  return ctx;
}

export function ComplianceProvider({ children }: { children: React.ReactNode }) {
  const [chosen, setChosen] = useState<readonly string[]>([]);

  const toggle = useCallback((slug: string) => {
    setChosen((list) => (list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]));
  }, []);

  /** From a card: tick it if it isn't already, then go to the form. */
  const pick = useCallback((slug: string) => {
    setChosen((list) => (list.includes(slug) ? list : [...list, slug]));
    const target = document.getElementById("check");
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: -96 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(() => ({ chosen, toggle, pick }), [chosen, toggle, pick]);
  return <Selection.Provider value={value}>{children}</Selection.Provider>;
}

const ICONS: Record<ComplianceAreaSlug, LucideIcon> = {
  cac: Building2,
  nsitf: ShieldCheck,
  itf: GraduationCap,
  pencom: PiggyBank,
  tax: Receipt,
  "oil-gas": Fuel,
  tech: Cpu,
  other: CircleHelp,
};

/** The compliance areas as cards: icon, short description, and the way into the form. */
export function ComplianceCards() {
  const { chosen, pick } = useSelection();
  return (
    <ul className="shell mt-16 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
      {COMPLIANCE_AREAS.map((area) => {
        const Icon = ICONS[area.slug];
        const on = chosen.includes(area.slug);
        return (
          <li key={area.slug}>
            <button
              type="button"
              onClick={() => pick(area.slug)}
              aria-pressed={on}
              className={cn(
                "group flex h-full w-full flex-col items-start gap-5 p-7 text-left transition-colors duration-300",
                on ? "bg-foreground text-background" : "bg-background hover:bg-secondary",
              )}
            >
              <Icon className="size-7 shrink-0" strokeWidth={1.25} aria-hidden />
              <div className="flex-1">
                <h3 className="font-display text-[1.5rem] leading-none tracking-[-0.04em]">{area.name}</h3>
                <p className={cn("label mt-2", on ? "text-background/70" : "text-muted-foreground")}>{area.full}</p>
                <p className={cn("mt-5 text-[0.9rem] leading-snug", on ? "text-background/80" : "text-muted-foreground")}>
                  {area.body}
                </p>
              </div>
              <span className="label mt-2 flex items-center gap-2">
                {on ? "Added to your check" : "Get help"}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** How many areas are ticked, for the heading beside the form. */
export function ComplianceCount() {
  const { chosen } = useSelection();
  if (chosen.length === 0) return null;
  return (
    <p className="label mt-7 text-primary">
      {chosen.length} area{chosen.length === 1 ? "" : "s"} selected
    </p>
  );
}

export function ComplianceCheckForm() {
  const { chosen, toggle } = useSelection();
  return (
    <ActionForm action={requestComplianceCheck} resetOnSuccess className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <ContactFields />

      <Field label="RC number" name="rcNumber" hint="Optional — if the company is registered.">
        <Input id="rcNumber" name="rcNumber" placeholder="RC 1234567" />
      </Field>

      <Field label="Industry" name="industry" required>
        <Select id="industry" name="industry" defaultValue="" required>
          <option value="" disabled>
            Select industry
          </option>
          {COMPLIANCE.form.industries.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </Select>
      </Field>

      <CheckboxGroup
        legend="Compliance areas needed"
        name="areas"
        hint="Pick as many as apply, or choose Other and we will work it out with you."
        options={COMPLIANCE_AREAS.map((a) => ({ value: a.slug, label: a.name }))}
        checked={chosen}
        onToggle={toggle}
      />

      <Field label="Deadline or urgency" name="urgency" required className="sm:col-span-2">
        <Select id="urgency" name="urgency" defaultValue={COMPLIANCE.form.urgency[2]} required>
          {COMPLIANCE.form.urgency.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </Select>
      </Field>

      <Field
        label="Anything else?"
        name="message"
        className="sm:col-span-2"
        hint="Certificates you already hold, filings you know are outstanding, a deadline you are working to."
      >
        <Textarea id="message" name="message" rows={4} />
      </Field>

      <p className="text-xs text-muted-foreground sm:col-span-2">
        Have your CAC certificate or previous compliance certificates to hand? Don&apos;t attach them here — your
        consultant will ask for them over a secure channel once your check is open.
      </p>

      <Consent what="carry out your compliance check and contact you about it" />

      <div className="sm:col-span-2">
        <FormMessage />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">The check is free. We respond within 24 hours.</p>
        <SubmitButton pendingText="Sending…">Book my compliance check</SubmitButton>
      </div>
    </ActionForm>
  );
}
