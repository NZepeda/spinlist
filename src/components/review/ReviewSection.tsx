"use client";

import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPromptCard } from "./LoginPromptCard";
import { ReviewForm } from "./ReviewForm";
import { ReviewFormSkeleton } from "./ReviewFormSkeleton";
import { Album } from "@/lib/types/album";

interface ReviewSectionProps {
  album: Album;
}

/**
 * Loading skeleton for the auth state check.
 * Displays placeholder UI while checking authentication status.
 */
function AuthSkeleton() {
  return (
    <div className="border rounded-lg p-8 bg-card">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-10 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

/**
 * Container component for the album review section.
 * Displays login prompt for unauthenticated users or review form for authenticated users.
 * Uses Suspense to handle loading state while fetching the user's existing review.
 */
export function ReviewSection({ album }: ReviewSectionProps) {
  const { user, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <AuthSkeleton />;
  }

  if (!user) {
    return <LoginPromptCard />;
  }

  return (
    <Suspense fallback={<ReviewFormSkeleton />}>
      <ReviewForm album={album} />
    </Suspense>
  );
}
