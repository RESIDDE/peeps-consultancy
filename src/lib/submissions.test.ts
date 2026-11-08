import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FORM_TABS,
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

/**
 * Which variant each call site uses is a correctness rule, not a style choice.
 *
 * Where the submission is the whole deliverable (a payroll quote, a contact message, a
 * career-service request) a failed write has to reach the sender, so the throwing
 * `recordSubmission` is right. Where the real work is already committed — an account
 * created and signed in, a vacancy posted, feedback saved — the inbox entry is a
 * notification about it, and failing the whole action over it is worse than a missing
 * row: the person retries and is told their email is already taken.
 */
describe("intake call-site discipline", () => {
  const read = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
  /** Counts `await recordSubmission({` but not `await recordSubmissionQuietly({`. */
  const throwing = (src: string) => src.match(/await recordSubmission\(\{/g)?.length ?? 0;
  const quiet = (src: string) => src.match(/await recordSubmissionQuietly\(\{/g)?.length ?? 0;

  it("lets every public form surface a failed write to the sender", () => {
    const src = read("src/server/actions/public.ts");
    expect(throwing(src)).toBeGreaterThan(0);
    expect(quiet(src)).toBe(0);
  });

  it("never fails a registration because the inbox write failed", () => {
    const src = read("src/server/actions/auth.ts");
    // The account, profile and sign-in are already committed by this point.
    expect(throwing(src)).toBe(0);
    expect(quiet(src)).toBe(2);
  });

  it("keeps the career-service request loud and the rest of the portal quiet", () => {
    const src = read("src/server/actions/portal.ts");
    expect(throwing(src)).toBe(1);
    expect(quiet(src)).toBeGreaterThan(0);
    // The one that throws is the one with no other record behind it.
    const loud = src.slice(src.indexOf("await recordSubmission({"));
    expect(loud.slice(0, 200)).toContain('type: "career_service"');
  });
});

describe("the Forms page's service tabs", () => {
  it("puts every form in exactly one tab, so All always equals the sum of the tabs", () => {
    for (const s of SUBMISSIONS) {
      const homes = FORM_TABS.filter((t) => t.types.includes(s.value));
      expect(homes.map((t) => t.key), s.value).toHaveLength(1);
    }
  });

  it("only names tags the registry knows", () => {
    const known = new Set(SUBMISSIONS.map((s) => s.value));
    for (const t of FORM_TABS) for (const type of t.types) expect(known.has(type), `${t.key}: ${type}`).toBe(true);
  });

  it("gives every tab a unique key", () => {
    const keys = FORM_TABS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
