import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/server/supabase/updateSession";

/**
 * Lists the auth pages that should NOT be accessible to signed-in users.
 */
const SIGNED_IN_USER_BLOCKED_PATHS = new Set(["/login", "/signup"]);

/**
 * Returns whether the current route should stay hidden from signed-in users.
 *
 * @param pathname - The current request pathname.
 * @returns Whether the route is reserved for signed-out visitors.
 */
function isGuestOnlyAuthPath(pathname: string): boolean {
  return SIGNED_IN_USER_BLOCKED_PATHS.has(pathname);
}

/**
 * Copies refreshed session cookies onto a redirect response.
 *
 * @param source - The response that already carries the latest auth cookies.
 * @param destination - The redirect response that should preserve those cookies.
 * @returns The redirect response with the refreshed auth cookies applied.
 */
function copyCookiesToResponse(
  source: NextResponse,
  destination: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    destination.cookies.set(name, value, options);
  });

  return destination;
}

/**
 * Next.js middleware that automatically refreshes Supabase auth sessions.
 * This ensures users stay authenticated across page navigation and refreshes.
 */
export async function proxy(request: NextRequest) {
  const { user, sessionResponse } = await updateSession(request);

  if (user && isGuestOnlyAuthPath(request.nextUrl.pathname)) {
    // Redirect the signed-in user away from auth pages.
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));

    return copyCookiesToResponse(sessionResponse, redirectResponse);
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
