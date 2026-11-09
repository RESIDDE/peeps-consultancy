/**
 * The two public sign-ins: employers and candidates. Pure, so the sign-in pages, the proxy
 * and the site's links all read the same words and addresses.
 *
 * Both run the same emailed-code sign-in, and every account lands on its own dashboard
 * whichever page it signed in from. The split is for the visitor: each page says plainly
 * who it is for, so nobody wonders whether they are in the right place.
 */
export const AUDIENCES = ["employer", "candidate"] as const;
export type Audience = (typeof AUDIENCES)[number];

export function isAudience(value: string): value is Audience {
  return (AUDIENCES as readonly string[]).includes(value);
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
  },
};

/** The sign-in page for an account type (or the chooser), carrying where to go afterwards. */
export function signInHref(audience?: Audience | null, next?: string): string {
  const path = audience ? `/sign-in/${audience}` : "/sign-in";
  return next ? `${path}?${new URLSearchParams({ next })}` : path;
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
