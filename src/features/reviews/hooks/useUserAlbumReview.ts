"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createClient } from "@/server/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Review } from "@/shared/types";

interface UseUserAlbumReviewResult {
  review: Review | null;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

/**
 * Hook to fetch the current user's review for a specific release group.
 * Returns the review if it exists, or null if the user hasn't reviewed the release group.
 * Uses Suspense for loading states - wrap the component in a Suspense boundary.
 */
export function useUserAlbumReview(
  releaseGroupId: string,
): UseUserAlbumReviewResult {
  const { user } = useAuth();
  const supabase = createClient();

  const query = useSuspenseQuery<Review | null>({
    queryKey: ["userReview", user?.id, releaseGroupId],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      // Get the user's review for this release group
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("release_group_id", releaseGroupId)
        .single();

      if (reviewError) {
        // No review found for this user/release-group combination
        if (reviewError.code === "PGRST116") {
          return null;
        }
        throw reviewError;
      }

      return review;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    review: query.data ?? null,
    error: query.error instanceof Error ? query.error : null,
    refetch: async () => query.refetch(),
  };
}
