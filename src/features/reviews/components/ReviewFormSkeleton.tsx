"use client";

/**
 * Loading skeleton for the album log card.
 * Displays placeholder UI while the current user's album log is being fetched.
 */
export function ReviewFormSkeleton() {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-24 bg-muted rounded" />
      </div>
    </div>
  );
}
