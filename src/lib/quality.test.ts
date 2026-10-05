import { describe, expect, it } from "vitest";
import { computeStage, nextStep, type CheckRecord, type StageEvidence } from "./quality";

const base = (checks: CheckRecord[] = [], over: Partial<StageEvidence> = {}): StageEvidence => ({
  consented: true,
  checks,
  classification: null,
  shortlisted: false,
  placed: false,
  ...over,
});

const passed = (...types: CheckRecord["type"][]): CheckRecord[] =>
  types.map((type) => ({ type, status: "passed" }));

describe("computeStage", () => {
  it("a CV alone never makes a candidate Verified", () => {
    expect(computeStage(base(passed("cv_review")))).toBe("screened");
  });

  it("identity without resolved qualifications stays Screened", () => {
    expect(computeStage(base(passed("cv_review", "identity")))).toBe("screened");
  });

  it("N/A without a written reason does not resolve a check", () => {
    const checks: CheckRecord[] = [
      ...passed("cv_review", "identity", "education"),
      { type: "professional_qualification", status: "not_applicable", notes: "" },
    ];
    expect(computeStage(base(checks))).toBe("screened");
  });

  it("N/A with a reason resolves an optional check", () => {
    const checks: CheckRecord[] = [
      ...passed("cv_review", "identity", "education"),
      { type: "professional_qualification", status: "not_applicable", notes: "Role needs none" },
    ];
    expect(computeStage(base(checks))).toBe("verified");
  });

  it("identity can never be N/A", () => {
    const checks: CheckRecord[] = [
      ...passed("cv_review", "education", "professional_qualification"),
      { type: "identity", status: "not_applicable", notes: "skip" },
    ];
    expect(computeStage(base(checks))).toBe("screened");
  });

  it("all checks but no classification is not PEEPs Ready", () => {
    const all = passed(
      "cv_review",
      "identity",
      "education",
      "professional_qualification",
      "interview",
      "skills_assessment",
      "employment_history",
      "references",
      "readiness",
    );
    expect(computeStage(base(all))).toBe("assessed");
    expect(computeStage(base(all, { classification: "competent" }))).toBe("peeps_ready");
    expect(computeStage(base(all, { classification: "competent", shortlisted: true }))).toBe("recommended");
  });

  it("a shortlist does not skip verification", () => {
    expect(computeStage(base(passed("cv_review"), { shortlisted: true }))).toBe("screened");
  });

  it("without consent a candidate stays at the bottom", () => {
    expect(computeStage(base(passed("cv_review"), { consented: false }))).toBe("registered");
  });

  it("a recorded placement is final", () => {
    expect(computeStage(base([], { placed: true }))).toBe("placed");
  });
});

describe("nextStep", () => {
  it("lists what is missing for the next rung", () => {
    const { next, missing } = nextStep(base(passed("cv_review", "identity")));
    expect(next).toBe("verified");
    expect(missing.map((m) => m.key)).toEqual(["education", "professional_qualification"]);
  });
});
