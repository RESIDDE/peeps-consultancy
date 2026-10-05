/**
 * Transparent, rule-based candidate ↔ vacancy matching. Every point awarded
 * comes with a reason so recruiters can see (and challenge) why someone
 * surfaced. This is a ranking aid, not a decision.
 */
import { SECTOR_BY_CODE, type SectorCode } from "./taxonomy";
import { stageIndex, type Stage } from "./quality";

export interface MatchCandidate {
  sectorCode: string;
  skills: string[];
  software?: string[];
  yearsExperience: number;
  city: string | null;
  preferredLocations: string[];
  willingToRelocate: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  availability: string | null;
  stage: Stage | string;
}

export interface MatchVacancy {
  sectorCode: string;
  requiredSkills: string[];
  experienceMin: number;
  city: string | null;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
}

export interface MatchFactor {
  key: string;
  label: string;
  score: number;
  max: number;
  note: string;
}

export interface MatchResult {
  total: number;
  factors: MatchFactor[];
}

const norm = (s: string) => s.trim().toLowerCase();

function sectorFactor(c: MatchCandidate, v: MatchVacancy): MatchFactor {
  const max = 25;
  if (c.sectorCode === v.sectorCode) {
    return { key: "sector", label: "Sector", score: max, max, note: "Same talent category" };
  }
  const cv = SECTOR_BY_CODE[c.sectorCode as SectorCode]?.vertical;
  const vv = SECTOR_BY_CODE[v.sectorCode as SectorCode]?.vertical;
  if (cv && cv === vv) {
    return { key: "sector", label: "Sector", score: 12, max, note: "Adjacent category in the same vertical" };
  }
  return { key: "sector", label: "Sector", score: 0, max, note: "Different sector" };
}

function skillsFactor(c: MatchCandidate, v: MatchVacancy): MatchFactor {
  const max = 25;
  const have = new Set([...c.skills, ...(c.software ?? [])].map(norm));
  const need = v.requiredSkills.map(norm).filter(Boolean);
  if (need.length === 0) {
    return { key: "skills", label: "Skills", score: 15, max, note: "Vacancy lists no specific skills" };
  }
  const matched = need.filter((s) => have.has(s));
  const score = Math.round((matched.length / need.length) * max);
  return {
    key: "skills",
    label: "Skills",
    score,
    max,
    note: `${matched.length} of ${need.length} required skills${matched.length ? `: ${matched.join(", ")}` : ""}`,
  };
}

function experienceFactor(c: MatchCandidate, v: MatchVacancy): MatchFactor {
  const max = 15;
  const gap = c.yearsExperience - v.experienceMin;
  if (gap >= 0 && gap <= 8) {
    return { key: "experience", label: "Experience", score: max, max, note: `${c.yearsExperience} yrs (min ${v.experienceMin})` };
  }
  if (gap > 8) {
    return { key: "experience", label: "Experience", score: 10, max, note: `${c.yearsExperience} yrs — may be over-qualified` };
  }
  if (gap === -1) {
    return { key: "experience", label: "Experience", score: 8, max, note: `${c.yearsExperience} yrs — one year short` };
  }
  return { key: "experience", label: "Experience", score: 0, max, note: `${c.yearsExperience} yrs (min ${v.experienceMin})` };
}

function locationFactor(c: MatchCandidate, v: MatchVacancy): MatchFactor {
  const max = 10;
  if (v.employmentType === "remote") {
    return { key: "location", label: "Location", score: max, max, note: "Remote role" };
  }
  if (!v.city) return { key: "location", label: "Location", score: 5, max, note: "Vacancy location not set" };
  if (c.city && norm(c.city) === norm(v.city)) {
    return { key: "location", label: "Location", score: max, max, note: `Based in ${v.city}` };
  }
  if (c.preferredLocations.map(norm).includes(norm(v.city))) {
    return { key: "location", label: "Location", score: 7, max, note: `Prefers ${v.city}` };
  }
  if (c.willingToRelocate) {
    return { key: "location", label: "Location", score: 5, max, note: "Willing to relocate" };
  }
  return { key: "location", label: "Location", score: 0, max, note: `Based in ${c.city ?? "unknown"}` };
}

function salaryFactor(c: MatchCandidate, v: MatchVacancy): MatchFactor {
  const max = 10;
  if (c.salaryMin == null || v.salaryMax == null) {
    return { key: "salary", label: "Salary", score: 5, max, note: "Expectation or budget not stated" };
  }
  if (c.salaryMin <= v.salaryMax) {
    return { key: "salary", label: "Salary", score: max, max, note: "Expectation within budget" };
  }
  if (c.salaryMin <= v.salaryMax * 1.15) {
    return { key: "salary", label: "Salary", score: 5, max, note: "Slightly above budget (≤15%)" };
  }
  return { key: "salary", label: "Salary", score: 0, max, note: "Expectation above budget" };
}

const AVAILABILITY_POINTS: Record<string, number> = {
  immediate: 5,
  two_weeks: 4,
  one_month: 3,
  three_months: 1,
};

function availabilityFactor(c: MatchCandidate): MatchFactor {
  const score = AVAILABILITY_POINTS[c.availability ?? ""] ?? 2;
  return { key: "availability", label: "Availability", score, max: 5, note: c.availability?.replace("_", " ") ?? "Not confirmed" };
}

const STAGE_POINTS: Partial<Record<Stage, number>> = {
  registered: 1,
  screened: 3,
  verified: 5,
  assessed: 7,
  peeps_ready: 10,
  recommended: 10,
  placed: 0,
};

function qualityFactor(c: MatchCandidate): MatchFactor {
  const score = STAGE_POINTS[c.stage as Stage] ?? 0;
  const note =
    c.stage === "placed"
      ? "Already placed with a client"
      : stageIndex(c.stage) >= stageIndex("peeps_ready")
        ? "PEEPs Ready — fully evidenced"
        : "Still progressing through verification";
  return { key: "quality", label: "Quality stage", score, max: 10, note };
}

export function scoreMatch(c: MatchCandidate, v: MatchVacancy): MatchResult {
  const factors = [
    sectorFactor(c, v),
    skillsFactor(c, v),
    experienceFactor(c, v),
    locationFactor(c, v),
    salaryFactor(c, v),
    availabilityFactor(c),
    qualityFactor(c),
  ];
  const total = factors.reduce((sum, f) => sum + f.score, 0);
  return { total, factors };
}
