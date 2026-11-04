/**
 * Payroll, Business Compliance and Auto Check — the three services added by the PEEPs
 * developer brief of 3 November 2026 — and the single list of everything PEEPs offers
 * that the nav, the footer, the services page and the landing page's arc all read from.
 *
 * Everything the brief asked PEEPs staff to be able to change without a developer lives
 * in this one file: card wording, what each package covers, prices, FAQs, and the options
 * in every form. Edit here and the whole site follows. Prices and any figure PEEPs has
 * not confirmed are left `null`, and the pages say "Price on request" in their place
 * rather than inventing a number.
 */

import { DIVISIONS } from "./content";

/** Who a service is sold to. Auto Check is the only one bought by an individual. */
export type Audience = "business" | "individual";

export interface Offering {
  slug: string;
  href: string;
  /** The full name, as the services page and the footer set it. */
  name: string;
  /** One word for the arc, the nav and anywhere tight. */
  short: string;
  /** Three letters, in the manner of a record reference, for the cards. */
  code: string;
  kicker: string;
  /** The brief's "in one sentence". */
  summary: string;
  /** Shorter still, for a card the size of a postcard. */
  blurb: string;
  /** The brief's "main action for visitors". */
  action: { label: string; href: string };
  audience: Audience;
}

/* ------------------------------------------------------------------ */
/* Payroll Outsourcing                                                 */
/* ------------------------------------------------------------------ */

export const PAYROLL = {
  slug: "payroll",
  href: "/payroll",
  name: "Payroll Outsourcing",
  short: "Payroll",
  kicker: "Payroll & statutory remittances",
  headline: "Payroll done right, every month.",
  summary:
    "PEEPs runs payroll for businesses — salaries, payslips, PAYE tax, pension and other deductions — every month, on time.",
  lead: "Your staff get paid on the same day every month, and every statutory filing goes out behind them.",
  action: { label: "Request a payroll quote", href: "/payroll#quote" },
  audience: "business" as Audience,
  outcomes: [
    "Staff paid on time, every month",
    "Statutory remittances filed, not forgotten",
    "One schedule you can hand to an auditor",
  ],

  /** What we handle. */
  handles: [
    { title: "Salary calculation", body: "Gross to net for every employee, including allowances, overtime and pro-rated joiners and leavers." },
    { title: "Payslips", body: "An itemised payslip for each member of staff, issued the day they are paid." },
    { title: "PAYE remittance", body: "PAYE computed, filed and remitted to the relevant state internal revenue service." },
    { title: "Pension (PenCom)", body: "Employee and employer pension contributions deducted and remitted to the PFA." },
    { title: "NHF, NSITF and ITF", body: "Housing fund deductions and employee-compensation and training-fund contributions handled alongside the run." },
    { title: "Leave and overtime", body: "Leave balances, overtime and deductions tracked against the register month to month." },
    { title: "Year-end reports", body: "Annual returns, employee schedules and the reconciliations your auditor will ask for." },
  ],

  /** How it works, in three steps. */
  steps: [
    { title: "Send staff details", body: "You send the register once — names, salaries, bank details and any changes this month." },
    { title: "PEEPs processes payroll", body: "We compute gross to net, apply every statutory deduction, and send you the schedule to approve." },
    { title: "Staff paid, remittances filed", body: "Salaries go out, payslips are issued, and PAYE, pension, NHF, NSITF and ITF are remitted and evidenced." },
  ],

  /** Who it is for. */
  audiences: [
    { title: "Small businesses", body: "No payroll officer, and no wish to hire one. We are the payroll function." },
    { title: "Growing companies", body: "Headcount climbing faster than the spreadsheet can take. We take it off you before it breaks." },
    { title: "Multinationals with staff in Nigeria", body: "A local payroll run that satisfies Nigerian statutory obligations and reports back in your format." },
  ],

  /** Per employee, per month. PEEPs to confirm; until then the pages ask for a quote. */
  pricePerEmployee: null as number | null,
  pricingNote: "Priced per employee per month, and it falls as headcount rises. Send us your numbers and we will quote in one working day.",

  faqs: [
    { q: "How quickly can you take over our payroll?", a: "Usually within one pay cycle. We need your current register, your last payroll run and your statutory registration numbers to reconcile against before the first PEEPs run." },
    { q: "Do you handle the remittances as well as the calculation?", a: "Yes. The calculation on its own leaves you with the work that carries the penalties. We file and remit PAYE, pension, NHF, NSITF and ITF, and give you the evidence for each." },
    { q: "Who sees our salary data?", a: "A named consultant and their supervisor. Payroll data is handled under the same consent and confidentiality rules as candidate data, in line with the Nigeria Data Protection Act 2023." },
    { q: "Can you run payroll for staff PEEPs did not place?", a: "Yes. Payroll is a standalone service. Plenty of clients use it without ever having recruited through us." },
    { q: "What if an employee queries their payslip?", a: "Send the query to your consultant. We reconcile it against the register and respond to you with the calculation, usually the same day." },
  ],

  /** The quote form's options. */
  form: {
    employeeBands: ["1–10", "11–50", "51–200", "200+"],
    payFrequencies: ["Monthly", "Bi-weekly", "Weekly"],
    services: ["Payroll processing", "PAYE", "Pension", "NHF", "NSITF / ITF", "Payslips", "HR records"],
    currentMethods: ["In-house", "Payroll software", "Another provider", "None yet"],
  },
} as const;

/* ------------------------------------------------------------------ */
/* Business Compliance                                                 */
/* ------------------------------------------------------------------ */

/**
 * The compliance areas, as cards. Add, remove or reword an entry here and the cards, the
 * form's checkboxes and the pre-ticking all follow — the brief asked for exactly that.
 *
 * The compliance team is still to review this wording before launch.
 */
export const COMPLIANCE_AREAS = [
  {
    slug: "cac",
    name: "CAC",
    full: "Corporate Affairs Commission",
    body: "Business name and company registration, annual returns, changes to directors and shareholders.",
  },
  {
    slug: "nsitf",
    name: "NSITF",
    full: "Nigeria Social Insurance Trust Fund",
    body: "Employee Compensation Scheme registration, contributions and compliance certificate.",
  },
  {
    slug: "itf",
    name: "ITF",
    full: "Industrial Training Fund",
    body: "Industrial Training Fund registration, contributions and compliance certificate.",
  },
  {
    slug: "pencom",
    name: "PenCom",
    full: "National Pension Commission",
    body: "Pension registration, monthly remittance and Pension Clearance Certificate.",
  },
  {
    slug: "tax",
    name: "Tax",
    full: "PAYE & company tax",
    body: "Tax registration, monthly PAYE filings and Tax Clearance Certificate.",
  },
  {
    slug: "oil-gas",
    name: "Oil & Gas",
    full: "Industry permits & local content",
    body: "Industry permits, regulatory registrations, local content (NCDMB) documentation and vendor registration support.",
  },
  {
    slug: "tech",
    name: "Tech",
    full: "NITDA & data protection",
    body: "NITDA registration, data protection (NDPA / NDPC) compliance and audit filings, other tech licences.",
  },
  {
    slug: "other",
    name: "Other / Not sure",
    full: "Free compliance health check",
    body: "Free compliance health check — PEEPs reviews where you stand and advises.",
  },
] as const;

export type ComplianceAreaSlug = (typeof COMPLIANCE_AREAS)[number]["slug"];

export const COMPLIANCE = {
  slug: "compliance",
  href: "/compliance",
  name: "Business Compliance",
  short: "Compliance",
  kicker: "Registrations, filings & renewals",
  headline: "Every registration, filing and renewal, kept current.",
  summary:
    "PEEPs handles registrations, filings and renewals with regulators — CAC, NSITF, ITF, PenCom, tax, oil & gas and tech.",
  lead: "A certificate you cannot produce is a contract you cannot win.",
  action: { label: "Book a free compliance check", href: "/compliance#check" },
  audience: "business" as Audience,
  outcomes: [
    "Certificates current, not expired",
    "Filings made before the deadline",
    "One register of where you stand",
  ],

  steps: [
    { title: "Tell us where you stand", body: "Book the free check. We ask what you are registered for and what you hold." },
    { title: "We find the gaps", body: "A consultant reviews your filings and certificates against what your industry requires, and tells you plainly what is missing." },
    { title: "We file and renew", body: "We handle the registrations, filings and renewals, and hand back the certificates with the register kept up to date." },
  ],

  faqs: [
    { q: "What does the free compliance check cover?", a: "We review what you are registered for, what you hold, and what your industry requires, then send you a written summary of the gaps. There is no charge and no obligation to use us for the filings." },
    { q: "How long does a registration take?", a: "It depends on the regulator and how complete your documents are. CAC filings are usually the quickest; industry permits take longest. Your consultant gives you a timeline before any work starts." },
    { q: "We have missed filings from previous years. Can you help?", a: "Yes. Back-filing and regularisation is most of what we do. Tell us how far back it goes on the form and we will tell you what it takes to bring it current." },
    { q: "Do you work outside Abuja?", a: "Yes. Filings are made with the relevant federal and state regulators wherever your business operates." },
  ],

  /** The compliance check form's options. */
  form: {
    industries: ["Oil & Gas", "Tech", "Manufacturing", "Services", "Construction", "Retail", "Healthcare", "Other"],
    urgency: ["This week", "This month", "Just planning"],
  },
} as const;

/* ------------------------------------------------------------------ */
/* Auto Check Mechanic                                                 */
/* ------------------------------------------------------------------ */

export const AUTO_CHECK = {
  slug: "auto-check",
  href: "/auto-check",
  name: "Auto Check Mechanic",
  short: "Auto Check",
  kicker: "Pre-purchase vehicle inspection",
  headline: "Don't buy blind. Get the car checked by a certified mechanic first.",
  summary:
    "A PEEPs-certified mechanic inspects the car at the dealership before you pay, and sends you a clear report.",
  lead: "An hour with our mechanic costs less than the first thing you would have had to fix.",
  action: { label: "Book a vehicle inspection", href: "/auto-check#book" },
  audience: "individual" as Audience,
  outcomes: ["Inspected before you pay", "A written report, not an opinion", "Certified mechanics, assessed by PEEPs"],

  /** How it works, in four steps. */
  steps: [
    { title: "Book online", body: "Tell us the car, the dealership and when you want to be there. Two minutes on your phone." },
    { title: "The mechanic meets you", body: "A PEEPs-certified mechanic arrives at the dealership at the agreed time, with their own equipment." },
    { title: "Full inspection", body: "They work through the checklist for the package you chose, with the car in front of them." },
    { title: "Report sent", body: "A clear written report reaches your email and WhatsApp, with what they found and what it means for the price." },
  ],

  /** Prices are PEEPs' to set. Until a figure is confirmed, the cards ask for a quote. */
  packages: [
    {
      slug: "basic",
      name: "Basic",
      price: null as number | null,
      tagline: "The walk-around, done properly.",
      checks: ["Body and panel condition", "Paint and respray signs", "Tyres and wheels", "Lights and electrics", "Road test", "Dashboard warning lights"],
    },
    {
      slug: "standard",
      name: "Standard",
      price: null as number | null,
      tagline: "Everything in Basic, plus what is under the bonnet.",
      checks: ["Everything in Basic", "Engine condition", "Gearbox and transmission", "Suspension", "Brakes", "Computer diagnostic scan"],
    },
    {
      slug: "premium",
      name: "Premium",
      price: null as number | null,
      tagline: "Everything in Standard, plus the car's history and your negotiating position.",
      checks: ["Everything in Standard", "VIN and history check", "Accident and flood damage signs", "Document verification", "Written price advice"],
    },
  ],

  /**
   * Mechanic profiles. PEEPs is supplying names, photos, certifications and years of
   * experience; until they arrive this stays empty and the section does not render.
   * Nothing here is invented — a certification on this page has to be a real one.
   */
  mechanics: [] as readonly {
    name: string;
    certification: string;
    years: number;
    base: string;
    photo?: string;
  }[],

  /** Customer reviews, once PEEPs supplies real ones. Empty until then. */
  reviews: [] as readonly { quote: string; name: string; vehicle: string }[],

  /** A sample inspection report for download. PEEPs to supply the PDF; put it in /public. */
  sampleReport: null as string | null,

  faqs: [
    { q: "What if the dealership refuses the inspection?", a: "A dealer with nothing to hide will allow it, and most expect it. If they refuse, that is itself worth knowing — and we will not charge you for a booking the dealer blocked." },
    { q: "How long does an inspection take?", a: "Between forty minutes and two hours, depending on the package and how quickly the dealer can give the mechanic access to the car." },
    { q: "Do I need to be there?", a: "No, but it helps. If you cannot make it, the mechanic inspects the car and sends the report to you directly." },
    { q: "What is in the report?", a: "What was checked, what was found, photographs of anything that matters, and what it means. The Premium package adds written advice on what the car is worth given its condition." },
    { q: "Which areas do you cover?", a: "We start with Abuja and the surrounding area, and we are adding states as we certify more mechanics. Tell us where the dealership is and we will confirm before you pay." },
  ],

  /** The booking form's options. */
  form: {
    timeSlots: ["Morning (9am – 12pm)", "Afternoon (12pm – 3pm)", "Late afternoon (3pm – 6pm)"],
    states: ["FCT (Abuja)", "Lagos", "Rivers", "Kano", "Oyo", "Kaduna", "Enugu", "Delta", "Ogun", "Other"],
    /**
     * Payment is Paystack or Flutterwave once PEEPs supplies an account, and the booking
     * form shows the choice only when this is switched on. Until then every booking is
     * taken as pay-on-inspection, which is also the brief's fallback.
     */
    onlinePayment: false,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Everything PEEPs offers, in one list                                */
/* ------------------------------------------------------------------ */

/** The three new services, in the brief's order. */
export const NEW_SERVICES = [PAYROLL, COMPLIANCE, AUTO_CHECK] as const;

/**
 * Every offering: the four recruitment divisions first, then the three services the brief
 * adds. The nav, the footer, the services page and the landing page's arc all read this,
 * so a service added here appears everywhere without touching a component.
 */
/** What the recruitment divisions carry on a card, where their own summaries are too long. */
const DIVISION_CARD: Record<string, { code: string; blurb: string; action: { label: string; href: string } }> = {
  talent: {
    code: "TAL",
    blurb: "Recruitment, executive search and specialist placement.",
    action: { label: "Request talent", href: "/employers#request" },
  },
  academy: {
    code: "ACA",
    blurb: "Talent Ready programmes and employer-sponsored training.",
    action: { label: "Sponsor a cohort", href: "/services/academy#enquire" },
  },
  professional: {
    code: "PRO",
    blurb: "Accounting, tax, audit support and CFO advisory.",
    action: { label: "Talk to an adviser", href: "/services/professional#enquire" },
  },
  workforce: {
    code: "WRK",
    blurb: "Contract staffing, outsourced teams and administration.",
    action: { label: "Deploy a team", href: "/services/workforce#enquire" },
  },
};

/** What the three new services carry on a card. */
const SERVICE_CARD: Record<string, { code: string; blurb: string }> = {
  payroll: { code: "PAY", blurb: "Salaries, payslips, PAYE, pension and every remittance." },
  compliance: { code: "CMP", blurb: "CAC, NSITF, ITF, PenCom, tax and industry filings." },
  "auto-check": { code: "CHK", blurb: "A certified mechanic inspects the car before you pay." },
};

export const OFFERINGS: readonly Offering[] = [
  ...DIVISIONS.map((d): Offering => {
    const card = DIVISION_CARD[d.slug];
    return {
      slug: d.slug,
      href: `/services/${d.slug}`,
      name: d.name,
      short: d.name.replace(/^PEEPs\s+/, ""),
      code: card.code,
      kicker: d.kicker,
      summary: d.summary,
      blurb: card.blurb,
      action: card.action,
      audience: "business",
    };
  }),
  ...NEW_SERVICES.map((s): Offering => {
    const card = SERVICE_CARD[s.slug];
    return {
      slug: s.slug,
      href: s.href,
      name: s.name,
      short: s.short,
      code: card.code,
      kicker: s.kicker,
      summary: s.summary,
      blurb: card.blurb,
      action: s.action,
      audience: s.audience,
    };
  }),
];

/** The four actions the brief puts in the hero, in its order. */
export const HERO_ACTIONS = [
  { label: "Hire talent", href: "/employers#request" },
  { label: "Outsource payroll", href: PAYROLL.action.href },
  { label: "Check compliance", href: COMPLIANCE.action.href },
  { label: "Book Auto Check", href: AUTO_CHECK.action.href },
] as const;

/**
 * The WhatsApp number the floating chat button opens. PEEPs is supplying it; set
 * NEXT_PUBLIC_WHATSAPP to the number in international form without the +, e.g.
 * 2348012345678. Without it the button does not render.
 */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

/** Naira, as the site writes it. `null` means PEEPs has not confirmed the figure. */
export function naira(amount: number | null): string {
  return amount === null ? "Price on request" : `₦${amount.toLocaleString("en-NG")}`;
}
