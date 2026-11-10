import { describe, expect, it } from "vitest";
import { audienceFor, destinationFor, isAudience, signInHref } from "./sign-in";
import { homeFor } from "./roles";

describe("homeFor", () => {
  it("knows only the two public dashboards", () => {
    expect(homeFor("employer")).toBe("/portal/employer");
    expect(homeFor("candidate")).toBe("/portal/candidate");
  });

  it("never points at the staff console", () => {
    for (const role of ["admin", "recruiter", undefined, null, ""]) expect(homeFor(role)).toBe("/");
  });
});

describe("destinationFor", () => {
  it("sends each account to its own dashboard", () => {
    expect(destinationFor("employer")).toBe("/portal/employer");
    expect(destinationFor("candidate", "")).toBe("/portal/candidate");
  });

  it("returns to the page asked for when it is in that account's own dashboard", () => {
    expect(destinationFor("employer", "/portal/employer/vacancies/new")).toBe("/portal/employer/vacancies/new");
    expect(destinationFor("candidate", "/portal/candidate/jobs")).toBe("/portal/candidate/jobs");
  });

  it("ignores a page that belongs to the other dashboard, or isn't a dashboard", () => {
    expect(destinationFor("employer", "/portal/candidate/jobs")).toBe("/portal/employer");
    expect(destinationFor("candidate", "/portal/employer")).toBe("/portal/candidate");
    expect(destinationFor("candidate", "/console")).toBe("/portal/candidate");
    expect(destinationFor("employer", "//evil.example/portal/employer")).toBe("/portal/employer");
    expect(destinationFor("employer", "https://evil.example")).toBe("/portal/employer");
  });

  it("has nowhere on the public site for staff", () => {
    expect(destinationFor("admin", "/portal/employer")).toBe("/");
    expect(destinationFor("recruiter")).toBe("/");
  });
});

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
