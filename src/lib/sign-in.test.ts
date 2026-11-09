import { describe, expect, it } from "vitest";
import { audienceFor, isAudience, signInHref } from "./sign-in";

describe("audienceFor", () => {
  it("knows each dashboard and the pages under it", () => {
    expect(audienceFor("/portal/employer")).toBe("employer");
    expect(audienceFor("/portal/employer/vacancies/new")).toBe("employer");
    expect(audienceFor("/portal/candidate")).toBe("candidate");
    expect(audienceFor("/portal/candidate/profile")).toBe("candidate");
    expect(audienceFor("/portal/candidate?welcome=1")).toBe("candidate");
  });

  it("claims nothing else", () => {
    expect(audienceFor(undefined)).toBeNull();
    expect(audienceFor("")).toBeNull();
    expect(audienceFor("/portal")).toBeNull();
    expect(audienceFor("/portal/employers")).toBeNull();
    expect(audienceFor("/console")).toBeNull();
  });
});

describe("signInHref", () => {
  it("points at the chooser or at one account type", () => {
    expect(signInHref()).toBe("/sign-in");
    expect(signInHref(null)).toBe("/sign-in");
    expect(signInHref("employer")).toBe("/sign-in/employer");
  });

  it("carries where to go afterwards, encoded", () => {
    expect(signInHref("candidate", "/portal/candidate/jobs")).toBe("/sign-in/candidate?next=%2Fportal%2Fcandidate%2Fjobs");
    expect(signInHref(null, "/portal/employer")).toBe("/sign-in?next=%2Fportal%2Femployer");
  });
});

describe("isAudience", () => {
  it("accepts only the two public account types", () => {
    expect(isAudience("employer")).toBe(true);
    expect(isAudience("candidate")).toBe(true);
    expect(isAudience("admin")).toBe(false);
    expect(isAudience("Employer")).toBe(false);
  });
});
