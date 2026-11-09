import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { audienceFor, signInHref } from "@/lib/sign-in";

/**
 * Optimistic gate: bounce visitors with no session cookie to sign-in — the employer or the
 * candidate one, whichever dashboard they asked for — and back here afterwards.
 * Real authorization (role checks) happens in each area's server layout
 * and in every server action.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const path = request.nextUrl.pathname;
    return NextResponse.redirect(new URL(signInHref(audienceFor(path), path), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
