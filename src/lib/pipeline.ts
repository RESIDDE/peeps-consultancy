/** Workflow vocabularies shared by the console, portals and seed data. */

export const CRM_STAGES = [
  { value: "target", label: "Target", hint: "On the 100-company list" },
  { value: "research", label: "Research", hint: "Decision-makers and needs identified" },
  { value: "contact", label: "Contact", hint: "First outreach made" },
  { value: "discovery", label: "Discovery", hint: "Talent needs conversation held" },
  { value: "proposal", label: "Proposal", hint: "Recruitment proposal sent" },
  { value: "pilot", label: "Pilot", hint: "Pilot recruitment engagement live" },
  { value: "placement", label: "Placement", hint: "First hire made" },
  { value: "retention", label: "Retention", hint: "Post-placement check-ins" },
  { value: "repeat", label: "Repeat", hint: "Repeat or retained client" },
] as const;
export type CrmStage = (typeof CRM_STAGES)[number]["value"];

export const VACANCY_STATUSES = [
  { value: "received", label: "Received" },
  { value: "analysis", label: "Vacancy analysis" },
  { value: "sourcing", label: "Sourcing" },
  { value: "shortlisting", label: "Shortlisting" },
  { value: "interviewing", label: "Client interviews" },
  { value: "offer", label: "Offer" },
  { value: "filled", label: "Filled" },
  { value: "closed", label: "Closed" },
] as const;
export const OPEN_VACANCY_STATUSES = ["received", "analysis", "sourcing", "shortlisting", "interviewing", "offer"];

export const APPLICATION_STAGES = [
  { value: "applied", label: "Applied" },
  { value: "sourced", label: "Sourced" },
  { value: "screened", label: "Screened" },
  { value: "interviewed", label: "Interviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "client_interview", label: "Client interview" },
  { value: "offer", label: "Offer" },
  { value: "placed", label: "Placed" },
  { value: "rejected", label: "Not progressed" },
] as const;
export type ApplicationStage = (typeof APPLICATION_STAGES)[number]["value"];

/** Board columns, in order. "applied" sits with "sourced" as an intake column. */
export const BOARD_COLUMNS: ApplicationStage[] = [
  "sourced",
  "screened",
  "interviewed",
  "shortlisted",
  "client_interview",
  "offer",
  "placed",
];

/** Application stages at which the candidate counts as shortlisted to the client. */
export const SHORTLISTED_OR_LATER: ApplicationStage[] = ["shortlisted", "client_interview", "offer", "placed"];

export const PACKAGES = [
  {
    value: "basic",
    label: "PEEPs Basic Recruitment",
    short: "Basic",
    tagline: "You provide the job specification. We find and filter.",
    includes: ["Vacancy advertising", "Candidate sourcing", "CV screening", "Shortlist of qualified candidates"],
  },
  {
    value: "professional",
    label: "PEEPs Professional Recruitment",
    short: "Professional",
    tagline: "The full PEEPs methodology, end to end.",
    includes: [
      "Job and vacancy analysis",
      "Candidate sourcing and screening",
      "PEEPs preliminary interview",
      "Sector technical assessment",
      "Reference checks",
      "Evidence-based shortlist report",
      "Interview coordination",
    ],
  },
  {
    value: "executive",
    label: "PEEPs Executive Search",
    short: "Executive",
    tagline: "Discreet search for leaders who shape the business.",
    includes: [
      "CEO, CFO, COO, GM and director roles",
      "Market mapping and direct approach",
      "Confidential candidate engagement",
      "In-depth competency and leadership assessment",
      "Comprehensive referencing",
      "Offer negotiation and onboarding support",
    ],
  },
  {
    value: "contract",
    label: "PEEPs Contract Staffing",
    short: "Contract",
    tagline: "Project teams and temporary workforce, managed by PEEPs.",
    includes: [
      "Rapid deployment of assessed staff",
      "Workforce administration",
      "Replacement guarantee",
      "Single monthly invoice",
    ],
  },
] as const;
export type PackageKey = (typeof PACKAGES)[number]["value"];

export const PARTNER_TYPES = [
  { value: "training_school", label: "Professional training school" },
  { value: "university", label: "University" },
  { value: "polytechnic", label: "Polytechnic" },
  { value: "technical", label: "Technical school" },
  { value: "automotive", label: "Automotive training centre" },
  { value: "it_academy", label: "IT academy" },
  { value: "association", label: "Professional association" },
  { value: "international", label: "International recruitment partner" },
] as const;

export const MOU_STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "in_discussion", label: "In discussion" },
  { value: "signed", label: "MOU signed" },
] as const;

export const REVENUE_STREAMS = [
  { value: "recruitment", label: "Recruitment" },
  { value: "training", label: "Training" },
  { value: "consulting", label: "Professional services" },
  { value: "workforce", label: "Workforce" },
  { value: "membership", label: "Membership" },
  { value: "career_services", label: "Career services" },
] as const;

export const ENQUIRY_TYPES = [
  { value: "talent_request", label: "Talent request" },
  { value: "pilot", label: "Pilot engagement" },
  { value: "partner", label: "Partnership" },
  { value: "career_service", label: "Career service" },
  { value: "academy", label: "Academy / training" },
  { value: "professional", label: "Professional services" },
  { value: "contact", label: "General" },
] as const;

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
] as const;

export const RETENTION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "retained", label: "Retained" },
  { value: "left", label: "Left" },
] as const;

export const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"] as const;

export const INDUSTRIES = [
  "Accounting & audit",
  "Banking & finance",
  "Automotive",
  "Hospitality",
  "Logistics",
  "Manufacturing",
  "Construction",
  "Healthcare",
  "Education",
  "NGO / development",
  "Professional services",
  "Technology",
  "Retail",
  "Oil & gas",
  "Other",
] as const;
