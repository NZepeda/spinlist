import * as Sentry from "@sentry/nextjs";

/**
 * Limits user correlation to the internal user identifier so account-scoped debugging remains possible without exposing profile or email metadata.
 *
 * @param userId - The internal authenticated user identifier or null.
 */
export function setAuthenticatedUser(userId: string | null): void {
  if (userId === null) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: userId,
  });
}
