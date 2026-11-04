/**
 * Every form on the PEEPs site, in one list.
 *
 * This is the spine of the console inbox. A submission from anywhere — the marketing
 * pages, the candidate portal, the employer portal — is saved to `enquiries` with one of
 * the `value` tags below, and the console reads this file to label it, group it, count it,
 * colour its badge and link back to the page it came from.
 *
 * Adding a form to the site is therefore two steps: add an entry here, and send the
 * submission through `recordSubmission()` in `src/server/intake.ts` with that tag. The
 * inbox filters, the service desk, the dashboard panels and the sidebar badges all follow
 * without touching a component.
 */

/** Where a submission belongs in the console. */
export type SubmissionGroup = "recruitment" | "services" | "accounts" | "pipeline" | "general";

export interface SubmissionMeta {
  /** The tag stored in `enquiries.type`. */
  value: string;
  /** What the badge and the filter chip say. */
  label: string;
  /** Shorter, for a tight column. */
  short: string;
  group: SubmissionGroup;
  /** Key into the console's icon map. */
  icon: "inbox" | "briefcase" | "users" | "handshake" | "graduation" | "calculator" | "wallet" | "shield" | "car" | "userPlus" | "building" | "fileCheck" | "star";
  /** The page the form lives on, so staff can see what the visitor saw. */
  href: string;
  /** One line for the filter chip's title and the dashboard legend. */
  note: string;
  /**
   * Whether a human owes the sender a reply. `true` arrives as "new" and counts towards
   * the sidebar badge; `false` arrives as "logged" — recorded and tagged, but not
   * clamouring, because the thing it created (a candidate, an application) is the real work.
   */
  reply: boolean;
}

export const SUBMISSIONS: readonly SubmissionMeta[] = [
  /* ---------------- Recruitment ---------------- */
  {
    value: "talent_request",
    label: "Talent request",
    short: "Talent",
    group: "recruitment",
    icon: "briefcase",
    href: "/employers#request",
    note: "An employer asking PEEPs to fill a role. Creates the employer, contact and vacancy.",
    reply: true,
  },
  {
    value: "pilot",
    label: "Pilot engagement",
    short: "Pilot",
    group: "recruitment",
    icon: "briefcase",
    href: "/employers",
    note: "An employer wanting to try PEEPs on a small, defined brief first.",
    reply: true,
  },
  {
    value: "recruitment",
    label: "Recruitment enquiry",
    short: "Recruitment",
    group: "recruitment",
    icon: "users",
    href: "/services/talent",
    note: "A question from the PEEPs Talent division page, short of a full vacancy brief.",
    reply: true,
  },
  {
    value: "workforce",
    label: "Workforce & outsourcing",
    short: "Workforce",
    group: "recruitment",
    icon: "users",
    href: "/services/workforce",
    note: "Contract staffing, outsourced teams and workforce administration.",
    reply: true,
  },
  {
    value: "academy",
    label: "Academy / training",
    short: "Academy",
    group: "recruitment",
    icon: "graduation",
    href: "/academy",
    note: "Training programmes, Talent Ready cohorts and employer-sponsored courses.",
    reply: true,
  },
  {
    value: "professional",
    label: "Professional services",
    short: "Professional",
    group: "recruitment",
    icon: "calculator",
    href: "/services/professional",
    note: "Accounting, tax, audit support and CFO advisory.",
    reply: true,
  },

  /* ---------------- The three services ---------------- */
  {
    value: "payroll",
    label: "Payroll quote",
    short: "Payroll",
    group: "services",
    icon: "wallet",
    href: "/payroll#quote",
    note: "A business asking PEEPs to run its payroll and statutory remittances.",
    reply: true,
  },
  {
    value: "compliance",
    label: "Compliance check",
    short: "Compliance",
    group: "services",
    icon: "shield",
    href: "/compliance#check",
    note: "The free compliance health check: CAC, NSITF, ITF, PenCom, tax and industry filings.",
    reply: true,
  },
  {
    value: "auto_check",
    label: "Auto Check booking",
    short: "Auto Check",
    group: "services",
    icon: "car",
    href: "/auto-check#book",
    note: "A pre-purchase vehicle inspection, booked for a date and a dealership.",
    reply: true,
  },

  /* ---------------- Accounts ---------------- */
  {
    value: "candidate_registration",
    label: "Candidate registration",
    short: "Candidate",
    group: "accounts",
    icon: "userPlus",
    href: "/register/candidate",
    note: "Someone registered a talent profile. The dossier is in the Talent Registry.",
    reply: false,
  },
  {
    value: "employer_registration",
    label: "Employer registration",
    short: "Employer",
    group: "accounts",
    icon: "building",
    href: "/register/employer",
    note: "A company opened an employer account. The record is in the CRM at Discovery.",
    reply: false,
  },

  /* ---------------- Portal pipeline ---------------- */
  {
    value: "job_application",
    label: "Job application",
    short: "Application",
    group: "pipeline",
    icon: "fileCheck",
    href: "/portal/candidate/jobs",
    note: "A registered candidate applied to a published vacancy from their portal.",
    reply: false,
  },
  {
    value: "employer_decision",
    label: "Shortlist response",
    short: "Decision",
    group: "pipeline",
    icon: "fileCheck",
    href: "/portal/employer",
    note: "An employer's answer on a shortlisted candidate: interview, or decline.",
    reply: false,
  },
  {
    value: "profile_update",
    label: "Profile revision",
    short: "Profile",
    group: "pipeline",
    icon: "userPlus",
    href: "/portal/candidate/profile",
    note: "A candidate changed their own profile. Verified evidence may now be out of date.",
    reply: false,
  },
  {
    value: "placement_feedback",
    label: "Placement feedback",
    short: "Feedback",
    group: "pipeline",
    icon: "star",
    href: "/portal/employer",
    note: "Post-hire feedback from an employer. Feeds the §30 quality loop.",
    reply: false,
  },

  /* ---------------- General ---------------- */
  {
    value: "career_service",
    label: "Career service",
    short: "Career",
    group: "general",
    icon: "graduation",
    href: "/candidates#career-services",
    note: "A candidate asking for CV development, interview preparation or coaching.",
    reply: true,
  },
  {
    value: "partner",
    label: "Partnership",
    short: "Partner",
    group: "general",
    icon: "handshake",
    href: "/partners",
    note: "A school, university or association proposing a talent pipeline partnership.",
    reply: true,
  },
  {
    value: "contact",
    label: "General enquiry",
    short: "General",
    group: "general",
    icon: "inbox",
    href: "/contact",
    note: "Anything sent through the contact page.",
    reply: true,
  },
];

export type SubmissionType = (typeof SUBMISSIONS)[number]["value"];

const BY_VALUE = new Map(SUBMISSIONS.map((s) => [s.value, s]));

/** The entry for a tag, or a usable stand-in if the database holds one this build doesn't know. */
export function submissionMeta(type: string): SubmissionMeta {
  return (
    BY_VALUE.get(type) ?? {
      value: type,
      label: type.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()),
      short: type.replace(/_/g, " "),
      group: "general",
      icon: "inbox",
      href: "/",
      note: "Submitted by a form this version of the console does not recognise.",
      reply: true,
    }
  );
}

export function isSubmissionType(type: string): boolean {
  return BY_VALUE.has(type);
}

/** Tags that arrive needing a reply, i.e. the ones the "new" badge counts. */
export const REPLY_TYPES: readonly string[] = SUBMISSIONS.filter((s) => s.reply).map((s) => s.value);

export const SUBMISSION_GROUPS: readonly { value: SubmissionGroup; label: string; note: string }[] = [
  { value: "recruitment", label: "Recruitment", note: "Vacancies, pilots, training and advisory" },
  { value: "services", label: "Services", note: "Payroll, compliance and Auto Check" },
  { value: "accounts", label: "Registrations", note: "New candidate and employer accounts" },
  { value: "pipeline", label: "Portal activity", note: "Applications, decisions and feedback" },
  { value: "general", label: "General", note: "Contact, partnerships and career services" },
];

export function groupOf(type: string): SubmissionGroup {
  return submissionMeta(type).group;
}

export function typesInGroup(group: SubmissionGroup): string[] {
  return SUBMISSIONS.filter((s) => s.group === group).map((s) => s.value);
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

/**
 * What has happened to a submission.
 *
 * `logged` exists so the inbox can hold a complete, tagged record of every form filed
 * without burying the ones that need answering. Nothing is hidden: it is a filter, not a
 * bin, and staff can set any submission to any status.
 */
export const SUBMISSION_STATUSES = [
  { value: "new", label: "New", note: "Arrived, nobody has picked it up" },
  { value: "in_progress", label: "In progress", note: "A consultant is on it" },
  { value: "scheduled", label: "Scheduled", note: "Booked in — an inspection, a call, a filing" },
  { value: "closed", label: "Closed", note: "Answered or resolved" },
  { value: "logged", label: "Logged", note: "Recorded for the file; no reply owed" },
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]["value"];

export const SUBMISSION_STATUS_VALUES: readonly string[] = SUBMISSION_STATUSES.map((s) => s.value);

/** The statuses that still want somebody's attention. */
export const OPEN_STATUSES: readonly string[] = ["new", "in_progress", "scheduled"];

export function statusLabel(status: string): string {
  return SUBMISSION_STATUSES.find((s) => s.value === status)?.label ?? status;
}
