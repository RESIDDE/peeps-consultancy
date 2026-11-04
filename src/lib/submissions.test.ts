import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  OPEN_STATUSES,
  REPLY_TYPES,
  SUBMISSIONS,
  SUBMISSION_GROUPS,
  SUBMISSION_STATUSES,
  SUBMISSION_STATUS_VALUES,
  isSubmissionType,
  statusLabel,
  submissionMeta,
  typesInGroup,
} from "./submissions";
import { ENQUIRY_TYPES } from "./pipeline";

/**
 * The console's inbox, its filters and its badges are all generated from the form
 * registry, so these tests guard the one thing that would silently break it: a form
 * filing under a tag the registry has never heard of.
 */

describe("the form registry", () => {
  it("has no duplicate tags", () => {
    const tags = SUBMISSIONS.map((s) => s.value);
    expect(new Set(tags).size).toBe(tags.length);
  });

  it("gives every form a group the console renders", () => {
    const known = new Set(SUBMISSION_GROUPS.map((g) => g.value));
    for (const s of SUBMISSIONS) expect(known).toContain(s.group);
  });

  it("partitions every form into exactly one group", () => {
    const counted = SUBMISSION_GROUPS.flatMap((g) => typesInGroup(g.value));
    expect(counted.sort()).toEqual(SUBMISSIONS.map((s) => s.value).sort());
  });

  it("points every form at a page on the site", () => {
    for (const s of SUBMISSIONS) expect(s.href.startsWith("/")).toBe(true);
  });

  it("falls back safely for a tag it does not know", () => {
    const meta = submissionMeta("something_new");
    expect(meta.label).toBe("Something new");
    expect(meta.icon).toBe("inbox");
    expect(isSubmissionType("something_new")).toBe(false);
  });

  it("counts only reply-owing forms as reply types", () => {
    expect(REPLY_TYPES).toContain("payroll");
    expect(REPLY_TYPES).toContain("auto_check");
    // Registrations and portal activity are recorded, not chased.
    expect(REPLY_TYPES).not.toContain("candidate_registration");
    expect(REPLY_TYPES).not.toContain("job_application");
    expect(REPLY_TYPES).not.toContain("profile_update");
  });

  it("exposes every tag to the console's label lookup", () => {
    const labelled = new Set(ENQUIRY_TYPES.map((t) => t.value));
    for (const s of SUBMISSIONS) expect(labelled).toContain(s.value);
  });
});

describe("statuses", () => {
  it("keeps the open set inside the known statuses", () => {
    for (const s of OPEN_STATUSES) expect(SUBMISSION_STATUS_VALUES).toContain(s);
  });

  it("treats closed and logged as settled", () => {
    expect(OPEN_STATUSES).not.toContain("closed");
    expect(OPEN_STATUSES).not.toContain("logged");
  });

  it("labels a status, and passes an unknown one through", () => {
    expect(statusLabel("in_progress")).toBe("In progress");
    expect(statusLabel("martian")).toBe("martian");
  });

  it("has a note on every status, for the inbox legend", () => {
    for (const s of SUBMISSION_STATUSES) expect(s.note.length).toBeGreaterThan(0);
  });
});

/**
 * The guard that matters: every tag any server action actually files under has an entry
 * here. Without it a new form would land in the inbox unlabelled, outside every filter.
 */
describe("what the server actually files", () => {
  const CALLERS = [
    "src/server/actions/public.ts",
    "src/server/actions/portal.ts",
    "src/server/actions/auth.ts",
  ];

  it("files only under tags the registry knows", () => {
    const found = new Set<string>();
    for (const file of CALLERS) {
      const src = readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
      for (const m of src.matchAll(/type:\s*"([a-z_]+)"/g)) found.add(m[1]);
    }
    expect(found.size).toBeGreaterThan(0);
    for (const tag of found) {
      expect(isSubmissionType(tag), `"${tag}" is filed by a server action but is not in SUBMISSIONS`).toBe(true);
    }
  });

  it("covers the three services the brief added", () => {
    for (const tag of ["payroll", "compliance", "auto_check"]) {
      expect(isSubmissionType(tag)).toBe(true);
      expect(submissionMeta(tag).group).toBe("services");
    }
  });
});
