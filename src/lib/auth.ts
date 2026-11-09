import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sendEmail, signInCodeEmail } from "@/server/email";

/** How long a sign-in code stays valid. */
export const OTP_MINUTES = 10;

const LOCALHOST = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * BETTER_AUTH_URL is always trusted. In development any localhost port is
 * accepted too (so `next dev` on 3001 works); in production add extra
 * origins via TRUSTED_ORIGINS (comma-separated).
 */
function trustedOrigins(request?: Request): string[] {
  const extra = (process.env.TRUSTED_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean);
  const origin = request?.headers.get("origin");
  if (process.env.NODE_ENV !== "production" && origin && LOCALHOST.test(origin)) extra.push(origin);
  return extra;
}

/**
 * The main site and the admin console share this config. The console sets
 * AUTH_COOKIE_PREFIX so its session cookies don't collide with the site's
 * (cookies on localhost are shared across ports).
 */
export const COOKIE_PREFIX = process.env.AUTH_COOKIE_PREFIX || "better-auth";

export const auth = betterAuth({
  trustedOrigins,
  advanced: { cookiePrefix: COOKIE_PREFIX },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  // Signing in is by emailed code only. Password sign-in stays enabled internally because
  // registration creates the account and signs it in on the server, but the public HTTP
  // route for it is closed, so nobody can sign in with a password from outside.
  disabledPaths: ["/sign-in/email"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Registration signs in itself once the profile and role are saved; signing in at
    // sign-up would cache the default "candidate" role in the session cookie.
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      // Never accepted from the client; set server-side only.
      role: { type: "string", required: false, defaultValue: "candidate", input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: OTP_MINUTES * 60,
      allowedAttempts: 5,
      // Stored hashed: a database leak doesn't hand out live codes.
      storeOTP: "hashed",
      // Accounts are created by registration, never by signing in. An email with no account
      // gets no code and no error, so the form can't be used to find out who has one.
      disableSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        await sendEmail(signInCodeEmail(email, otp, OTP_MINUTES));
      },
    }),
    // Must stay last: it applies cookies set by the plugins before it.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
