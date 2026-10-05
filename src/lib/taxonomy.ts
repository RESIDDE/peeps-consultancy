/**
 * PEEPs Talent Taxonomy — the 13 talent categories, the public-facing
 * verticals that group them, and the assessment rubric templates each
 * category is measured against.
 */

export const SECTOR_CODES = [
  "ACC",
  "AUD",
  "HRA",
  "SAL",
  "ITD",
  "ENG",
  "AUT",
  "HOS",
  "DRV",
  "HLT",
  "CON",
  "EXE",
  "INT",
] as const;
export type SectorCode = (typeof SECTOR_CODES)[number];

export type TemplateKey =
  | "accounting"
  | "admin"
  | "sales"
  | "it"
  | "mechanic"
  | "driver"
  | "chef"
  | "general";

export type VerticalSlug =
  | "finance-professional"
  | "business-administration"
  | "automotive-technical"
  | "technology"
  | "hospitality";

export interface Sector {
  code: SectorCode;
  name: string;
  vertical: VerticalSlug | null;
  template: TemplateKey;
  roles: string[];
}

export const SECTORS: Sector[] = [
  {
    code: "ACC",
    name: "Finance & Accounting",
    vertical: "finance-professional",
    template: "accounting",
    roles: [
      "Accountant",
      "Financial Analyst",
      "Financial Controller",
      "Accounts Officer",
      "CFO-track Professional",
    ],
  },
  {
    code: "AUD",
    name: "Audit & Tax",
    vertical: "finance-professional",
    template: "accounting",
    roles: ["Audit Associate", "Internal Auditor", "Tax Officer", "Tax Consultant"],
  },
  {
    code: "HRA",
    name: "HR & Administration",
    vertical: "business-administration",
    template: "admin",
    roles: [
      "HR Officer",
      "Administrative Officer",
      "Executive Assistant",
      "Office Manager",
      "Receptionist",
    ],
  },
  {
    code: "SAL",
    name: "Sales & Marketing",
    vertical: "business-administration",
    template: "sales",
    roles: [
      "Sales Executive",
      "Customer Service Officer",
      "Business Development Officer",
      "Marketing Officer",
    ],
  },
  {
    code: "ITD",
    name: "IT & Digital",
    vertical: "technology",
    template: "it",
    roles: [
      "Software Developer",
      "IT Support Officer",
      "Data Analyst",
      "Network Engineer",
      "Cybersecurity Analyst",
    ],
  },
  {
    code: "ENG",
    name: "Engineering & Technical",
    vertical: "automotive-technical",
    template: "general",
    roles: ["Maintenance Technician", "Electrical Technician", "Facilities Engineer"],
  },
  {
    code: "AUT",
    name: "Automotive",
    vertical: "automotive-technical",
    template: "mechanic",
    roles: [
      "Mechanic",
      "Auto Electrician",
      "Diagnostic Technician",
      "Panel Beater",
      "Auto Painter",
      "PPF Installer",
      "Vehicle Detailer",
      "Window-film Technician",
      "Service Advisor",
      "Parts Officer",
      "Automobile Sales Executive",
      "EV Technician",
      "CNG Technician",
    ],
  },
  {
    code: "HOS",
    name: "Hospitality",
    vertical: "hospitality",
    template: "chef",
    roles: [
      "Chef",
      "Cook",
      "Waiter",
      "Hotel Manager",
      "Front-desk Officer",
      "Housekeeping",
      "Restaurant Supervisor",
    ],
  },
  {
    code: "DRV",
    name: "Drivers & Domestic Services",
    vertical: "automotive-technical",
    template: "driver",
    roles: ["Driver", "Fleet Manager", "Dispatch Rider", "Domestic Staff"],
  },
  {
    code: "HLT",
    name: "Healthcare",
    vertical: null,
    template: "general",
    roles: ["Nurse", "Pharmacist", "Medical Laboratory Scientist", "Healthcare Administrator"],
  },
  {
    code: "CON",
    name: "Construction",
    vertical: null,
    template: "general",
    roles: ["Site Engineer", "Quantity Surveyor", "Site Supervisor", "Foreman"],
  },
  {
    code: "EXE",
    name: "Management & Executive",
    vertical: "business-administration",
    template: "general",
    roles: [
      "CEO",
      "COO",
      "CFO",
      "General Manager",
      "Finance Director",
      "HR Director",
      "Operations Manager",
    ],
  },
  {
    code: "INT",
    name: "International Specialists",
    vertical: null,
    template: "general",
    roles: ["Specialist Engineer", "Technical Consultant", "Industry Specialist"],
  },
];

export const SECTOR_BY_CODE = Object.fromEntries(SECTORS.map((s) => [s.code, s])) as Record<
  SectorCode,
  Sector
>;

export function sectorName(code: string): string {
  return SECTOR_BY_CODE[code as SectorCode]?.name ?? code;
}

export function isSectorCode(value: string): value is SectorCode {
  return (SECTOR_CODES as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------ */
/* Assessment rubrics                                                  */
/* ------------------------------------------------------------------ */

export const RUBRIC_LEVELS = [
  { value: 1, label: "Developing", hint: "Gaps that would need training before the role" },
  { value: 2, label: "Working knowledge", hint: "Can perform with supervision" },
  { value: 3, label: "Proficient", hint: "Performs independently to standard" },
  { value: 4, label: "Advanced", hint: "Performs beyond standard; could guide others" },
] as const;

export interface RubricCriterion {
  key: string;
  label: string;
  focus: string;
}

export interface AssessmentTemplate {
  key: TemplateKey;
  name: string;
  criteria: RubricCriterion[];
}

export const INTERVIEW_TEMPLATE: AssessmentTemplate = {
  key: "general",
  name: "PEEPs Preliminary Interview",
  criteria: [
    { key: "communication", label: "Communication", focus: "Clarity, listening, structure" },
    { key: "professionalism", label: "Professionalism", focus: "Presentation, punctuality, conduct" },
    { key: "knowledge", label: "Knowledge", focus: "Grasp of the profession's fundamentals" },
    { key: "experience", label: "Experience", focus: "Depth and relevance of past work" },
    { key: "attitude", label: "Attitude", focus: "Motivation, coachability, ownership" },
    { key: "problem_solving", label: "Problem solving", focus: "Reasoning through scenarios" },
    { key: "role_suitability", label: "Role suitability", focus: "Fit for the target role family" },
  ],
};

export const ASSESSMENT_TEMPLATES: Record<TemplateKey, AssessmentTemplate> = {
  accounting: {
    key: "accounting",
    name: "Accounting & Finance Technical",
    criteria: [
      { key: "excel", label: "Excel", focus: "Lookups, pivots, modelling hygiene" },
      { key: "principles", label: "Accounting principles", focus: "Double entry, accruals, IFRS basics" },
      { key: "reporting", label: "Financial reporting", focus: "Preparing and reading statements" },
      { key: "tax", label: "Tax", focus: "VAT, WHT, PAYE, CIT fundamentals" },
      { key: "analysis", label: "Financial analysis", focus: "Ratios, variance, commentary" },
    ],
  },
  admin: {
    key: "admin",
    name: "Administration Technical",
    criteria: [
      { key: "office", label: "Office software", focus: "Word, Excel, email, calendars" },
      { key: "organisation", label: "Organisation", focus: "Prioritising and record keeping" },
      { key: "writing", label: "Business writing", focus: "Memos, minutes, correspondence" },
      { key: "etiquette", label: "Corporate etiquette", focus: "Front-of-house and confidentiality" },
    ],
  },
  sales: {
    key: "sales",
    name: "Sales & Customer Technical",
    criteria: [
      { key: "prospecting", label: "Prospecting", focus: "Finding and qualifying leads" },
      { key: "pitch", label: "Pitch & negotiation", focus: "Handling objections, closing" },
      { key: "service", label: "Customer service", focus: "Resolving complaints well" },
      { key: "crm", label: "CRM discipline", focus: "Pipeline hygiene and follow-up" },
    ],
  },
  it: {
    key: "it",
    name: "Technology Technical",
    criteria: [
      { key: "fundamentals", label: "Technical fundamentals", focus: "Core concepts for the role" },
      { key: "tools", label: "Tools & stack", focus: "Hands-on with the stated stack" },
      { key: "practical", label: "Practical task", focus: "Timed exercise result" },
      { key: "troubleshooting", label: "Troubleshooting", focus: "Debugging and root cause" },
    ],
  },
  mechanic: {
    key: "mechanic",
    name: "Automotive Technical",
    criteria: [
      { key: "diagnostics", label: "Diagnostics", focus: "Scan tools, fault isolation" },
      { key: "mechanical", label: "Mechanical knowledge", focus: "Engine, drivetrain, brakes" },
      { key: "practical", label: "Practical experience", focus: "Observed workshop task" },
      { key: "safety", label: "Workshop safety", focus: "Safe practice and tool care" },
    ],
  },
  driver: {
    key: "driver",
    name: "Driver Assessment",
    criteria: [
      { key: "experience", label: "Driving experience", focus: "Years, vehicle classes" },
      { key: "vehicle", label: "Vehicle knowledge", focus: "Daily checks, basic faults" },
      { key: "safety", label: "Safety", focus: "Defensive driving, record" },
      { key: "routes", label: "Route knowledge", focus: "City and inter-state routes" },
      { key: "documentation", label: "Documentation", focus: "Licence, permits, logbook" },
    ],
  },
  chef: {
    key: "chef",
    name: "Hospitality & Culinary",
    criteria: [
      { key: "technique", label: "Technical ability", focus: "Knife skills, cooking methods" },
      { key: "menu", label: "Menu knowledge", focus: "Local and continental range" },
      { key: "hygiene", label: "Hygiene", focus: "Food safety and kitchen standards" },
      { key: "practical", label: "Practical assessment", focus: "Timed cook or service test" },
    ],
  },
  general: {
    key: "general",
    name: "General Competency",
    criteria: [
      { key: "domain", label: "Domain knowledge", focus: "Fundamentals of the profession" },
      { key: "practical", label: "Practical application", focus: "Scenario or work-sample task" },
      { key: "tools", label: "Tools & methods", focus: "Equipment, software, standards" },
      { key: "leadership", label: "Leadership", focus: "Ownership and influence" },
    ],
  },
};

export function templateForSector(code: string): AssessmentTemplate {
  const sector = SECTOR_BY_CODE[code as SectorCode];
  return ASSESSMENT_TEMPLATES[sector?.template ?? "general"];
}

/* ------------------------------------------------------------------ */
/* Shared option lists                                                 */
/* ------------------------------------------------------------------ */

export const CLASSIFICATIONS = [
  {
    value: "entry",
    label: "Entry",
    description: "Trained and assessed, with limited workplace experience. Ready for structured junior roles.",
  },
  {
    value: "competent",
    label: "Competent",
    description: "Performs core tasks of the role independently, with evidence from assessment and history.",
  },
  {
    value: "experienced",
    label: "Experienced",
    description: "Several years of verified, relevant experience and strong assessment results.",
  },
  {
    value: "specialist",
    label: "Specialist",
    description: "Deep expertise in a niche or senior capability, evidenced and referenced.",
  },
] as const;
export type Classification = (typeof CLASSIFICATIONS)[number]["value"];

export const AVAILABILITY = [
  { value: "immediate", label: "Immediate" },
  { value: "two_weeks", label: "2 weeks" },
  { value: "one_month", label: "1 month" },
  { value: "three_months", label: "3 months" },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "remote", label: "Remote" },
] as const;

export const EMPLOYMENT_STATUS = [
  { value: "employed", label: "Employed" },
  { value: "unemployed", label: "Not currently employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Student / trainee" },
  { value: "nysc", label: "NYSC" },
] as const;

export const CANDIDATE_SOURCES = [
  { value: "training_school", label: "Training school" },
  { value: "partner", label: "Partner institution" },
  { value: "university", label: "University / polytechnic" },
  { value: "association", label: "Professional association" },
  { value: "referral", label: "Referral" },
  { value: "website", label: "Website" },
  { value: "social", label: "Social media" },
  { value: "campaign", label: "Job campaign" },
] as const;

export const NIGERIAN_CITIES = [
  "Abuja",
  "Lagos",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Enugu",
  "Benin City",
  "Kaduna",
  "Warri",
  "Uyo",
] as const;

export function labelOf<T extends readonly { value: string; label: string }[]>(
  list: T,
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return list.find((o) => o.value === value)?.label ?? value;
}
