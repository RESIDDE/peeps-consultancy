"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { getLenis } from "@/components/motion/smooth-scroll";
import { ActionForm, FormMessage } from "@/components/ui/action-form";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AUTO_CHECK, naira } from "@/lib/services";
import { bookAutoCheck } from "@/server/actions/public";
import { cn } from "@/lib/utils";
import { Consent, Honeypot } from "./shared";

type PackageSlug = (typeof AUTO_CHECK.packages)[number]["slug"];

/**
 * The package cards and the booking form share one choice, so pressing Book on a card
 * selects that package in the form below and takes you to it.
 */
const Choice = createContext<{ chosen: PackageSlug; choose: (slug: PackageSlug) => void; book: (slug: PackageSlug) => void } | null>(
  null,
);

function useChoice() {
  const ctx = useContext(Choice);
  if (!ctx) throw new Error("Auto Check packages and form must sit inside <AutoCheckProvider>");
  return ctx;
}

export function AutoCheckProvider({ children }: { children: React.ReactNode }) {
  const [chosen, setChosen] = useState<PackageSlug>("standard");

  const book = useCallback((slug: PackageSlug) => {
    setChosen(slug);
    const target = document.getElementById("book");
    if (!target) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: -96 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(() => ({ chosen, choose: setChosen, book }), [chosen, book]);
  return <Choice.Provider value={value}>{children}</Choice.Provider>;
}

/** The three inspection packages, side by side. The middle one is the one most people want. */
export function PackageCards() {
  const { chosen, book } = useChoice();
  return (
    <ul className="shell mt-16 grid gap-5 md:grid-cols-3">
      {AUTO_CHECK.packages.map((pkg, i) => {
        const on = chosen === pkg.slug;
        const featured = i === 1;
        return (
          <li
            key={pkg.slug}
            className={cn(
              "flex flex-col rounded-[7px] border p-7 transition-colors duration-300 md:p-8",
              on ? "border-primary" : "border-border",
              featured && "bg-secondary/60",
            )}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-[1.75rem] leading-none tracking-[-0.05em]">{pkg.name}</h3>
              {featured && <span className="label text-primary">Most booked</span>}
            </div>
            <p className="mt-4 text-[0.9rem] leading-snug text-muted-foreground">{pkg.tagline}</p>

            <p className="mt-8 font-display text-[clamp(1.75rem,3vw,2.4rem)] leading-none tracking-[-0.06em]">
              {naira(pkg.price)}
            </p>

            <ul className="mt-8 grid flex-1 gap-2.5">
              {pkg.checks.map((check) => (
                <li key={check} className="flex items-start gap-2.5 text-[0.9rem] leading-snug">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {check}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => book(pkg.slug)}
              className={cn(
                "mt-9 h-11 rounded-full border px-6 text-sm font-medium transition-colors duration-300",
                on
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground hover:bg-foreground hover:text-background",
              )}
            >
              {on ? `${pkg.name} selected` : `Book ${pkg.name}`}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function AutoCheckBookingForm() {
  const { chosen, choose } = useChoice();

  // The earliest bookable day is the reader's own today, which the page cannot know when it
  // is prerendered. Written straight to the input after mount rather than held in state: it
  // is a one-way update to the DOM, and re-rendering the form for it would be wasted work.
  useEffect(() => {
    const field = document.getElementById("preferredDate");
    if (!(field instanceof HTMLInputElement)) return;
    const now = new Date();
    field.min = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  }, []);

  return (
    <ActionForm action={bookAutoCheck} resetOnSuccess className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />

      <Field label="Full name" name="fullName" required>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </Field>
      <Field label="Phone (WhatsApp)" name="phone" required hint="This is where your report is sent.">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+234" required />
      </Field>
      <Field label="Email" name="email" required className="sm:col-span-2">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <fieldset className="grid gap-5 sm:col-span-2 sm:grid-cols-3">
        <legend className="mb-3 text-sm font-medium leading-none">The vehicle</legend>
        <Field label="Make" name="make" required>
          <Input id="make" name="make" placeholder="Toyota" required />
        </Field>
        <Field label="Model" name="model" required>
          <Input id="model" name="model" placeholder="Camry" required />
        </Field>
        <Field label="Year" name="year" required>
          <Input id="year" name="year" type="number" inputMode="numeric" min={1960} max={new Date().getFullYear() + 1} placeholder="2018" required />
        </Field>
        <Field label="VIN / chassis number" name="vin" hint="Optional." className="sm:col-span-2">
          <Input id="vin" name="vin" autoCapitalize="characters" />
        </Field>
        <Field label="Asking price (₦)" name="askingPrice" hint="Optional.">
          <Input id="askingPrice" name="askingPrice" inputMode="numeric" placeholder="12,500,000" />
        </Field>
      </fieldset>

      <fieldset className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-medium leading-none">Where the car is</legend>
        <Field label="Dealership name" name="dealership" required>
          <Input id="dealership" name="dealership" required />
        </Field>
        <Field label="State" name="state" required>
          <Select id="state" name="state" defaultValue="" required>
            <option value="" disabled>
              Select a state
            </option>
            {AUTO_CHECK.form.states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Area / address" name="area" className="sm:col-span-2" hint="Enough for the mechanic to find it.">
          <Input id="area" name="area" placeholder="Utako, off Ekukinam Street" />
        </Field>
      </fieldset>

      <Field label="Preferred date" name="preferredDate" required>
        <Input id="preferredDate" name="preferredDate" type="date" required />
      </Field>
      <Field label="Time slot" name="timeSlot" required>
        <Select id="timeSlot" name="timeSlot" defaultValue={AUTO_CHECK.form.timeSlots[0]} required>
          {AUTO_CHECK.form.timeSlots.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </Field>

      <Field label="Inspection package" name="package" required className="sm:col-span-2">
        <Select
          id="package"
          name="package"
          value={chosen}
          onChange={(e) => choose(e.target.value as PackageSlug)}
          required
        >
          {AUTO_CHECK.packages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} — {naira(p.price)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Anything else?" name="notes" className="sm:col-span-2">
        <Textarea id="notes" name="notes" rows={3} placeholder="What worries you about this car?" />
      </Field>

      {/* Online payment waits on a Paystack or Flutterwave account from PEEPs; until then
          every booking is pay-on-inspection, which the brief gives as the alternative. */}
      <p className="rounded-[7px] border border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground sm:col-span-2">
        <span className="font-medium text-foreground">Payment:</span> pay the mechanic on the day, once the inspection
        is done. {AUTO_CHECK.form.onlinePayment ? "You can also pay online when you book." : "Online payment is coming soon."}
      </p>

      <Consent what="arrange your inspection and send you the report" />

      <div className="sm:col-span-2">
        <FormMessage />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">We confirm on WhatsApp within 24 hours.</p>
        <SubmitButton pendingText="Booking…">Book my inspection</SubmitButton>
      </div>
    </ActionForm>
  );
}
