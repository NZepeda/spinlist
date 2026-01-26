"use client";

/**
 * Loading skeleton for the ReviewForm component.
 * Displays placeholder UI while the review data is being fetched.
 * Used as a Suspense fallback for the ReviewForm component.
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
