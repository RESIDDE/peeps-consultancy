import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic gate: bounce visitors with no console session cookie to sign-in.
 * Real authorization (staff role) happens in the console layout and every server action.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request, { cookiePrefix: process.env.AUTH_COOKIE_PREFIX || "better-auth" })) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/console/:path*"],
};
