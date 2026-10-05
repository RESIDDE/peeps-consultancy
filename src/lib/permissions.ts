import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import type { Role } from "@/db/schema";
import { homeFor } from "./roles";

export { homeFor };

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const STAFF: Role[] = ["admin", "recruiter"];

/** For layouts/pages: redirect away unless the user has one of `roles`. */
export async function requireRole(roles: Role[]) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const role = session.user.role as Role;
  if (!roles.includes(role)) redirect(homeFor(role));
  return { ...session, role };
}

export class AuthzError extends Error {}

/** For server actions: throw (never trust the UI to have hidden a button). */
export async function assertRole(roles: Role[]) {
  const session = await getSession();
  if (!session) throw new AuthzError("Please sign in again.");
  const role = session.user.role as Role;
  if (!roles.includes(role)) throw new AuthzError("You don't have permission to do that.");
  return { ...session, role };
}
