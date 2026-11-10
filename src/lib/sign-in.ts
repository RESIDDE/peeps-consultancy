import { homeFor } from "./roles";

/**
 * The two public sign-ins: employers and candidates. Pure, so the sign-in pages, the proxy
 * and the site's links all read the same words and addresses.
 *
 * Both run the same emailed-code sign-in. Each page says plainly who it is for, and an email
 * typed on the wrong one is pointed to the right one before any code is sent, so every
 * account signs in where it belongs and lands on its own dashboard.
 */
export const AUDIENCES = ["employer", "candidate"] as const;
export type Audience = (typeof AUDIENCES)[number];

export function isAudience(value: string | null | undefined): value is Audience {
  return !!value && (AUDIENCES as readonly string[]).includes(value);
}

interface AudienceCopy {
  /** The account type, as a tag: "Sign in · Employer". */
  name: string;
  /** The choice in the visitor's own words, on the chooser. */
  choice: string;
  /** What the account is for, under the choice. */
  blurb: string;
  /** The question that offers this sign-in from the other one's page. */
  question: string;
  title: string;
  lede: string;
  emailLabel: string;
  emailHint: string;
  register: { href: string; label: string };
  /** Said when this type's email is entered on the other type's sign-in page. */
  wrongPage: string;
  /** The one-click way to this type's sign-in from there. */
  goLabel: string;
}

export const SIGN_IN: Record<Audience, AudienceCopy> = {
  employer: {
    name: "Employer",
    choice: "I'm hiring",
    blurb: "Manage vacancies, review shortlists and follow every hire.",
    question: "Hiring?",
    title: "Employer sign in.",
    lede: "Sign in to your company account to manage vacancies, review shortlists and follow every hire.",
    emailLabel: "Work email",
    emailHint: "Use the work email your company account was created with.",
    register: { href: "/register/employer", label: "Create an employer account" },
    wrongPage: "This email belongs to an employer account. Employers sign in on the employer page.",
    goLabel: "Continue to employer sign-in",
  },
  candidate: {
    name: "Candidate",
    choice: "I'm looking for work",
    blurb: "Your profile, your PEEPs ID and the roles we put you forward for.",
    question: "Looking for work?",
    title: "Candidate sign in.",
    lede: "Sign in to update your profile, see your PEEPs ID and follow the roles we put you forward for.",
    emailLabel: "Email",
    emailHint: "Use the email you registered your profile with.",
    register: { href: "/register/candidate", label: "Join the talent registry" },
    wrongPage: "This email belongs to a candidate account. Candidates sign in on the candidate page.",
    goLabel: "Continue to candidate sign-in",
  },
};

/** The sign-in page for an account type (or the chooser), carrying where to go afterwards. */
export function signInHref(audience?: Audience | null, next?: string): string {
  const path = audience ? `/sign-in/${audience}` : "/sign-in";
  return next ? `${path}?${new URLSearchParams({ next })}` : path;
}

/**
 * Carries an address from one sign-in page to the other when it was typed on the wrong one,
 * so the visitor doesn't type it twice. A short-lived cookie rather than the URL, which
 * would put the address in browser history and server logs.
 */
export const SIGN_IN_EMAIL_COOKIE = "peeps-sign-in-email";

/**
 * Where an account goes after signing in: back to the page it came for if that page is in its
 * own dashboard, otherwise to the dashboard itself. Anything that isn't an employer or a
 * candidate account has no dashboard on the public site.
 */
export function destinationFor(role: string | null | undefined, next?: string | null): string {
  if (!role || !isAudience(role)) return "/";
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  return safe && audienceFor(safe) === role ? safe : homeFor(role);
}

/** The sign-in a dashboard page belongs to, so a visitor bounced from one skips the choice. */
export function audienceFor(path: string | null | undefined): Audience | null {
  if (!path) return null;
  for (const audience of AUDIENCES) {
    const home = `/portal/${audience}`;
    if (path === home || path.startsWith(`${home}/`) || path.startsWith(`${home}?`)) return audience;
  }
  return null;
}
