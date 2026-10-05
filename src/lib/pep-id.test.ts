import { describe, expect, it } from "vitest";
import { formatPepId, nextPepId, parsePepId } from "./pep-id";

describe("PEP IDs", () => {
  it("formats with a six-digit sequence", () => {
    expect(formatPepId("ACC", 1245)).toBe("PEP-ACC-001245");
  });

  it("sequences per sector", () => {
    const existing = ["PEP-ACC-000001", "PEP-ACC-000007", "PEP-AUT-000003"];
    expect(nextPepId("ACC", existing)).toBe("PEP-ACC-000008");
    expect(nextPepId("AUT", existing)).toBe("PEP-AUT-000004");
    expect(nextPepId("HOS", existing)).toBe("PEP-HOS-000001");
  });

  it("ignores malformed IDs", () => {
    expect(parsePepId("PEP-ACC-12")).toBeNull();
    expect(nextPepId("ACC", ["junk", "PEP-ACC-12"])).toBe("PEP-ACC-000001");
  });
});
