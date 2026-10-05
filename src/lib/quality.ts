/**
 * PEEPs Quality & Credibility Framework.
 *
 * A candidate's stage is never set by hand: it is derived from recorded
 * evidence (verification checks, classification, shortlists, placements).
 * Uploading a CV never makes anyone "Verified".
 */

export const STAGES = [
  "registered",
  "screened",
  "verified",
  "assessed",
  "peeps_ready",
  "recommended",
  "placed",
] as const;
export type Stage = (typeof STAGES)[number];

export const CHECK_TYPES = [
  "cv_review",
  "identity",
  "education",
  "professional_qualification",
  "employment_history",
  "skills_assessment",
  "interview",
  "references",
  "readiness",
] as const;
export type CheckType = (typeof CHECK_TYPES)[number];

export const CHECK_STATUSES = ["pending", "passed", "failed", "not_applicable"] as const;
export type CheckStatus = (typeof CHECK_STATUSES)[number];

export const CHECK_META: Record<CheckType, { label: string; description: string; allowNA: boolean }> = {
  cv_review: {
    label: "CV review",
    description: "Structure, career history, gaps, errors and role suitability reviewed.",
    allowNA: false,
  },
  identity: {
    label: "Identity",
    description: "Government ID matched to the person (NIN, passport or driver's licence).",
    allowNA: false,
  },
  education: {
    label: "Education",
    description: "Certificates sighted and, where possible, confirmed with the institution.",
    allowNA: true,
  },
  professional_qualification: {
    label: "Professional qualification",
    description: "ICAN, ACCA, CIPM or trade certification confirmed with the awarding body.",
    allowNA: true,
  },
  employment_history: {
    label: "Employment history",
    description: "Past roles and dates checked against records or employers.",
    allowNA: true,
  },
  skills_assessment: {
    label: "Skills assessment",
    description: "Sector-specific technical assessment completed and scored.",
    allowNA: true,
  },
  interview: {
    label: "Interview",
    description: "PEEPs preliminary interview completed and scored.",
    allowNA: false,
  },
  references: {
    label: "References",
    description: "Previous employer, professional referee or training institution contacted.",
    allowNA: true,
  },
  readiness: {
    label: "PEEPs readiness",
    description: "Availability, salary expectations and role preferences confirmed with the candidate.",
    allowNA: false,
  },
};

export interface StageMeta {
  label: string;
  short: string;
  description: string;
  requires: CheckType[];
}

export const STAGE_META: Record<Stage, StageMeta> = {
  registered: {
    label: "Registered",
    short: "REG",
    description: "Profile submitted with data-processing consent.",
    requires: [],
  },
  screened: {
    label: "Screened",
    short: "SCR",
    description: "CV reviewed by a PEEPs consultant.",
    requires: ["cv_review"],
  },
  verified: {
    label: "Verified",
    short: "VER",
    description: "Identity confirmed; education and professional qualifications verified where applicable.",
    requires: ["identity", "education", "professional_qualification"],
  },
  assessed: {
    label: "Assessed",
    short: "ASD",
    description: "Interviewed and, where applicable, technically assessed.",
    requires: ["interview", "skills_assessment"],
  },
  peeps_ready: {
    label: "PEEPs Ready",
    short: "RDY",
    description: "History and references checked, readiness confirmed, classification assigned.",
    requires: ["employment_history", "references", "readiness"],
  },
  recommended: {
    label: "Recommended",
    short: "REC",
    description: "Assessed against a specific employer's vacancy and shortlisted.",
    requires: [],
  },
  placed: {
    label: "Placed",
    short: "PLC",
    description: "Hired by a PEEPs client.",
    requires: [],
  },
};

export interface CheckRecord {
  type: CheckType;
  status: CheckStatus;
  notes?: string | null;
}

export interface StageEvidence {
  consented: boolean;
  checks: CheckRecord[];
  classification: string | null | undefined;
  /** Has at least one application at "shortlisted" or later. */
  shortlisted: boolean;
  /** Has at least one placement recorded. */
  placed: boolean;
}

function statusOf(checks: CheckRecord[], type: CheckType): CheckRecord | undefined {
  return checks.find((c) => c.type === type);
}

/** A check is resolved when it passed, or was marked N/A with a written reason. */
export function isResolved(checks: CheckRecord[], type: CheckType): boolean {
  const c = statusOf(checks, type);
  if (!c) return false;
  if (c.status === "passed") return true;
  return c.status === "not_applicable" && CHECK_META[type].allowNA && !!c.notes?.trim();
}

export interface Requirement {
  key: string;
  label: string;
  met: boolean;
}

/** The requirements a candidate must satisfy to hold `stage`. */
export function requirementsFor(stage: Stage, ev: StageEvidence): Requirement[] {
  const checkReq = (type: CheckType, label?: string): Requirement => ({
    key: type,
    label:
      label ??
      (CHECK_META[type].allowNA
        ? `${CHECK_META[type].label} passed (or N/A with reason)`
        : `${CHECK_META[type].label} passed`),
    met: isResolved(ev.checks, type),
  });

  switch (stage) {
    case "registered":
      return [{ key: "consent", label: "Data-processing consent recorded", met: ev.consented }];
    case "screened":
      return [checkReq("cv_review")];
    case "verified":
      return [checkReq("identity"), checkReq("education"), checkReq("professional_qualification")];
    case "assessed":
      return [checkReq("interview"), checkReq("skills_assessment")];
    case "peeps_ready":
      return [
        checkReq("employment_history"),
        checkReq("references"),
        checkReq("readiness"),
        { key: "classification", label: "Classification assigned with rationale", met: !!ev.classification },
      ];
    case "recommended":
      return [{ key: "shortlist", label: "Shortlisted against a client vacancy", met: ev.shortlisted }];
    case "placed":
      return [{ key: "placement", label: "Placement recorded", met: ev.placed }];
  }
}

/**
 * Walk the ladder from the bottom; the candidate holds the highest stage for
 * which this and every lower stage's requirements are met. A recorded
 * placement is a fact and always wins.
 */
export function computeStage(ev: StageEvidence): Stage {
  if (ev.placed) return "placed";
  let current: Stage = "registered";
  for (const stage of STAGES) {
    if (stage === "placed") break;
    const ok = requirementsFor(stage, ev).every((r) => r.met);
    if (!ok) break;
    current = stage;
  }
  return current;
}

export function stageIndex(stage: Stage | string): number {
  return STAGES.indexOf(stage as Stage);
}

/** What is still missing for the next rung of the ladder. */
export function nextStep(ev: StageEvidence): { next: Stage | null; missing: Requirement[] } {
  const current = computeStage(ev);
  const idx = stageIndex(current);
  const next = STAGES[idx + 1] ?? null;
  if (!next) return { next: null, missing: [] };
  return { next, missing: requirementsFor(next, ev).filter((r) => !r.met) };
}

/** True when a failed check blocks progress — surfaced as a warning in the console. */
export function blockingFailures(checks: CheckRecord[]): CheckRecord[] {
  return checks.filter((c) => c.status === "failed");
}

export function stageLabel(stage: string): string {
  return STAGE_META[stage as Stage]?.label ?? stage;
}
