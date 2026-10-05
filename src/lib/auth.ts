import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

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

export const auth = betterAuth({
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
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
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
