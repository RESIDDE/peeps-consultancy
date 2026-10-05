import { describe, expect, it } from "vitest";
import { scoreMatch, type MatchCandidate, type MatchVacancy } from "./matching";

const vacancy: MatchVacancy = {
  sectorCode: "ACC",
  requiredSkills: ["Excel", "IFRS", "Sage"],
  experienceMin: 3,
  city: "Abuja",
  employmentType: "full_time",
  salaryMin: 300_000,
  salaryMax: 450_000,
};

const candidate: MatchCandidate = {
  sectorCode: "ACC",
  skills: ["excel", "IFRS", "Payroll"],
  software: ["Sage"],
  yearsExperience: 4,
  city: "Abuja",
  preferredLocations: [],
  willingToRelocate: false,
  salaryMin: 350_000,
  salaryMax: 400_000,
  availability: "immediate",
  stage: "peeps_ready",
};

describe("scoreMatch", () => {
  it("scores a strong fit at 100 with reasons for every factor", () => {
    const r = scoreMatch(candidate, vacancy);
    expect(r.total).toBe(100);
    expect(r.factors.every((f) => f.note.length > 0)).toBe(true);
  });

  it("is case-insensitive and counts software as skills", () => {
    const skills = scoreMatch(candidate, vacancy).factors.find((f) => f.key === "skills")!;
    expect(skills.score).toBe(skills.max);
  });

  it("gives partial credit for an adjacent sector in the same vertical", () => {
    const r = scoreMatch({ ...candidate, sectorCode: "AUD" }, vacancy);
    expect(r.factors.find((f) => f.key === "sector")!.score).toBe(12);
  });

  it("penalises salary far above budget and missing experience", () => {
    const r = scoreMatch({ ...candidate, salaryMin: 900_000, yearsExperience: 0 }, vacancy);
    expect(r.factors.find((f) => f.key === "salary")!.score).toBe(0);
    expect(r.factors.find((f) => f.key === "experience")!.score).toBe(0);
  });

  it("deprioritises candidates who are already placed", () => {
    const r = scoreMatch({ ...candidate, stage: "placed" }, vacancy);
    expect(r.factors.find((f) => f.key === "quality")!.score).toBe(0);
  });
});
