import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { isActiveProfile } from "@/features/auth/isActiveProfile";
import type { Database } from "@/server/database";
import { mapAlbumRowToAlbum } from "@/server/database/mappers/mapAlbumRowToAlbum";
import { createClient } from "@/server/supabase/server";
import type { AlbumRow } from "@/server/database";

interface ReviewRequestBody {
  albumId: string;
  rating: number;
  reviewText?: string;
  favoriteTrackId?: string;
  existingReviewId?: string;
}

interface ReviewErrorResponse {
  code:
    | "INVALID_REQUEST"
    | "UNAUTHORIZED"
    | "EMAIL_CONFIRMATION_REQUIRED"
    | "ALBUM_NOT_FOUND"
    | "INVALID_FAVORITE_TRACK"
    | "SAVE_FAILED";
  message: string;
}

interface ReviewSuccessResponse {
  ok: true;
}

/**
 * Returns a normalized favorite track id or null if none was selected.
 */
function normalizeFavoriteTrackId(favoriteTrackId?: string): string | null {
  const trimmedFavoriteTrackId = favoriteTrackId?.trim();

  if (!trimmedFavoriteTrackId) {
    return null;
  }

  return trimmedFavoriteTrackId;
}

/**
 * Validates the request body for review writes.
 */
function validateRequestBody(body: unknown): ReviewRequestBody | null {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  const candidate = body as Record<string, unknown>;

  if (typeof candidate.albumId !== "string") {
    return null;
  }

  if (
    typeof candidate.rating !== "number" ||
    !Number.isFinite(candidate.rating)
  ) {
    return null;
  }

  if (
    candidate.reviewText !== undefined &&
    candidate.reviewText !== null &&
    typeof candidate.reviewText !== "string"
  ) {
    return null;
  }

  if (
    candidate.favoriteTrackId !== undefined &&
    candidate.favoriteTrackId !== null &&
    typeof candidate.favoriteTrackId !== "string"
  ) {
    return null;
  }

  if (
    candidate.existingReviewId !== undefined &&
    candidate.existingReviewId !== null &&
    typeof candidate.existingReviewId !== "string"
  ) {
    return null;
  }

  return {
    albumId: candidate.albumId,
    rating: candidate.rating,
    reviewText:
      typeof candidate.reviewText === "string"
        ? candidate.reviewText
        : undefined,
    favoriteTrackId:
      typeof candidate.favoriteTrackId === "string"
        ? candidate.favoriteTrackId
        : undefined,
    existingReviewId:
      typeof candidate.existingReviewId === "string"
        ? candidate.existingReviewId
        : undefined,
  };
}

/**
 * Verifies that the selected favorite track belongs to the album.
 */
function isFavoriteTrackValid(
  album: AlbumRow,
  favoriteTrackId: string | null,
): boolean {
  if (favoriteTrackId === null) {
    return true;
  }

  const validTrackIds = new Set(
    mapAlbumRowToAlbum(album).tracks.map((track) => track.id),
  );

  return validTrackIds.has(favoriteTrackId);
}

/**
 * Returns a forbidden response when the current user has not confirmed their email yet.
 */
function createEmailConfirmationRequiredResponse() {
  const response: ReviewErrorResponse = {
    code: "EMAIL_CONFIRMATION_REQUIRED",
    message: "Please confirm your email before logging albums.",
  };

  return NextResponse.json(response, { status: 403 });
}

/**
 * Checks whether the current authenticated user is allowed to create community content.
 */
async function ensureActiveProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Response | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !isActiveProfile(profile)) {
    return createEmailConfirmationRequiredResponse();
  }

  return null;
}

/**
 * Writes a review to the server.
 */
export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    const response: ReviewErrorResponse = {
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const parsedBody = validateRequestBody(requestBody);

  if (parsedBody === null) {
    const response: ReviewErrorResponse = {
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const favoriteTrackId = normalizeFavoriteTrackId(parsedBody.favoriteTrackId);
  const reviewText = parsedBody.reviewText?.trim() ?? null;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || user === null) {
    const response: ReviewErrorResponse = {
      code: "UNAUTHORIZED",
      message: "You must be logged in to save a review.",
    };

    return NextResponse.json(response, { status: 401 });
  }

  const activeProfileRequirement = await ensureActiveProfile(supabase, user.id);

  if (activeProfileRequirement) {
    return activeProfileRequirement;
  }

  const { data: album, error: albumError } = await supabase
    .from("albums")
    .select("*")
    .eq("id", parsedBody.albumId)
    .single();

  if (albumError || album === null) {
    const response: ReviewErrorResponse = {
      code: "ALBUM_NOT_FOUND",
      message: "The album could not be found.",
    };

    return NextResponse.json(response, { status: 404 });
  }

  if (!isFavoriteTrackValid(album, favoriteTrackId)) {
    const response: ReviewErrorResponse = {
      code: "INVALID_FAVORITE_TRACK",
      message: "The selected favorite song does not belong to this album.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const reviewPayload = {
    album_id: parsedBody.albumId,
    favorite_track_id: favoriteTrackId,
    rating: parsedBody.rating,
    review_text: reviewText,
    user_id: user.id,
  };

  if (parsedBody.existingReviewId) {
    const { error: updateError } = await supabase
      .from("reviews")
      .update({
        favorite_track_id: reviewPayload.favorite_track_id,
        rating: reviewPayload.rating,
        review_text: reviewPayload.review_text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsedBody.existingReviewId)
      .eq("user_id", user.id);

    if (updateError) {
      const response: ReviewErrorResponse = {
        code: "SAVE_FAILED",
        message: "The review could not be saved.",
      };

      return NextResponse.json(response, { status: 500 });
    }

    const successResponse: ReviewSuccessResponse = { ok: true };

    return NextResponse.json(successResponse, { status: 200 });
  }

  const { error: insertError } = await supabase
    .from("reviews")
    .insert(reviewPayload);

  if (insertError) {
    const response: ReviewErrorResponse = {
      code: "SAVE_FAILED",
      message: "The review could not be saved.",
    };

    return NextResponse.json(response, { status: 500 });
  }

  const successResponse: ReviewSuccessResponse = { ok: true };

  return NextResponse.json(successResponse, { status: 200 });
}

/**
 * Deletes a review through the same authenticated API boundary used for review writes.
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");

  if (typeof reviewId !== "string" || reviewId.trim().length === 0) {
    const response: ReviewErrorResponse = {
      code: "INVALID_REQUEST",
      message: "The review payload is invalid.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || user === null) {
    const response: ReviewErrorResponse = {
      code: "UNAUTHORIZED",
      message: "You must be logged in to delete a review.",
    };

    return NextResponse.json(response, { status: 401 });
  }

  const activeProfileRequirement = await ensureActiveProfile(supabase, user.id);

  // Realistically this should never happen.
  // Unconfirmed users cannot log any reviews in the first place.
  if (activeProfileRequirement) {
    return activeProfileRequirement;
  }

  const { error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (deleteError) {
    const response: ReviewErrorResponse = {
      code: "SAVE_FAILED",
      message: "The review could not be deleted.",
    };

    return NextResponse.json(response, { status: 500 });
  }

  const successResponse: ReviewSuccessResponse = { ok: true };

  return NextResponse.json(successResponse, { status: 200 });
}
