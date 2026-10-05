import type { Candidate } from "@/db/schema";

/** Candidate-facing wording for what's needed to climb the ladder. */
export const GUIDANCE: Record<string, string> = {
  consent: "Accept the data-processing consent in your profile.",
  cv_review: "Upload your CV. A PEEPs consultant will review it and give honest feedback.",
  identity: "Upload or bring a government ID (NIN slip, passport or driver's licence).",
  education: "Upload your certificates so we can verify them with your institution.",
  professional_qualification: "Upload evidence of professional qualifications (ICAN, ACCA, trade tests), if you have any.",
  interview: "Attend your PEEPs preliminary interview. Your consultant will schedule it.",
  skills_assessment: "Complete the technical assessment for your profession.",
  employment_history: "Add your previous employers so we can confirm dates and roles.",
  references: "Share contact details for two referees.",
  readiness: "Confirm your availability and salary expectations with your consultant.",
  classification: "Your consultant assigns your classification from the evidence.",
  shortlist: "We put you forward for a vacancy where you're a genuine fit.",
  placement: "Accept an offer and start your new role.",
};

export function profileCompleteness(c: Candidate, documentCount: number) {
  const items: [string, boolean][] = [
    ["Phone number", !!c.phone],
    ["Headline", !!c.headline],
    ["Professional summary", !!c.summary],
    ["At least 3 skills", c.skills.length >= 3],
    ["Education", c.education.length > 0],
    ["Experience", c.experience.length > 0 || c.yearsExperience === 0],
    ["Availability", !!c.availability],
    ["Salary expectation", c.salaryMin != null],
    ["CV uploaded", documentCount > 0],
  ];
  const done = items.filter(([, ok]) => ok).length;
  return { percent: Math.round((done / items.length) * 100), missing: items.filter(([, ok]) => !ok).map(([k]) => k) };
}
