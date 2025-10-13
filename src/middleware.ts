import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Clerk middleware for Next.js that handles authentication and session management.
 *
 * Public routes are accessible without authentication.
 * Protected routes require users to be signed in.
 *
 * To protect a route, add it to the isProtectedRoute matcher.
 * Example: /dashboard, /profile, /settings, etc.
 */

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  // Add protected routes here as you build them
  // Example: '/dashboard(.*)', '/profile(.*)', '/settings(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
