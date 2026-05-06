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
 * Loads the current user's saved review for one album.
 * Returns the review when one exists, or null when the album has not been reviewed yet.
 * Uses Suspense for loading states, so the caller should provide a Suspense boundary.
 */
export function useUserAlbumReview(
  albumId: string,
): UseUserAlbumReviewResult {
  const { user } = useAuth();
  const supabase = createClient();

  const query = useSuspenseQuery<Review | null>({
    queryKey: ["userReview", user?.id, albumId],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }

      // Fetches the user's saved review for the current album.
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("album_id", albumId)
        .single();

      if (reviewError) {
        // Treats a missing row as an unrated album instead of a fatal error.
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
